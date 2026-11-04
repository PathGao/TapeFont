"""Build the TTF from the hand-built glyphs in glyphs/manual/.

usage: .venv/bin/python -I src/tape.py [OUT.ttf]      (default build/hand.ttf)
Font units: em 1024, baseline 0, ascent 900, descent -124. Kana/kanji cells are 680 wide.
Characters without a hand glyph are not in the font; the web engine (web/engine.js)
generates those from stroke skeletons.
"""
import json, math, sys
from pathlib import Path

import pathops
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

ROOT = Path(__file__).resolve().parent.parent

P = dict(
    width=100,     # tape width in font units; manual.render sets it per glyph
    advance=680,   # kana/kanji cell width
    gap=0.06,      # space between cells / advance
    radius=1.0,    # outer corner radius / tape width (Sato cuts a quarter circle ~1 width)
    inner=0.1,     # inner corner radius / tape width (photos: square to 0.3)
)

MARKS = "ー一、。・.,〜!-ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶゕゖ"  # keep their own size and place in the cell


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy) or 1
    d = [abs(dy * (x - x1) - dx * (y - y1)) / n for x, y in pts[1:-1]]
    i = max(range(len(d)), key=d.__getitem__)
    if d[i] <= eps:
        return [pts[0], pts[-1]]
    return rdp(pts[: i + 2], eps)[:-1] + rdp(pts[i + 1 :], eps)


def round_corners(path, sharp=()):
    """Cut corners of the merged outline the way Sato does with a cutter:
    outer bends get a quarter-circle of radius*width, inner bends a small fill,
    and the short square-cut end of a strip stays sharp. Corners within one tape
    width of a point in `sharp` stay square (Sato decides per corner)."""
    w = P["width"]
    out = pathops.Path()
    contours = []
    for c in path.contours:
        pts = [q[-1] for v, q in c.segments if v in ("moveTo", "lineTo")]
        if len(pts) > 2 and pts[0] == pts[-1]:
            pts.pop()
        n = len(pts)
        contours.append((pts, sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n))))
    # Holes wind opposite to outlines; judge every corner against the outline's winding,
    # so a counter's corners count as inner corners (small radius), not outer ones.
    area = max((a for _, a in contours), key=abs, default=1)
    for pts, _ in contours:
        n = len(pts)
        first = True
        for i in range(n):
            a, b, c2 = pts[i - 1], pts[i], pts[(i + 1) % n]
            la, lc = math.dist(a, b), math.dist(b, c2)
            cross = (b[0] - a[0]) * (c2[1] - b[1]) - (b[1] - a[1]) * (c2[0] - b[0])
            convex = cross * area > 0
            r = P["radius"] * w if convex else P["inner"] * w
            if convex and min(la, lc) < 1.2 * w:
                r = 0  # end of a strip: keep the square cut
            if any(math.dist(b, q) < w for q in sharp):
                r = 0
            t = min(r, la * 0.4, lc * 0.4)  # keep a flat bit on every side, no lens-shaped blocks
            if t < 1:
                (out.moveTo if first else out.lineTo)(*b)
            else:
                p0 = (b[0] + (a[0] - b[0]) * t / la, b[1] + (a[1] - b[1]) * t / la)
                p1 = (b[0] + (c2[0] - b[0]) * t / lc, b[1] + (c2[1] - b[1]) * t / lc)
                (out.moveTo if first else out.lineTo)(*p0)
                out.quadTo(*b, *p1)
            first = False
        out.close()
    return out


def advance_of(c, e):
    """Kana/kanji share one cell width; Latin, digits and ASCII marks keep their own width."""
    if ord(c) >= 0x2000:
        return P["advance"]
    return min(P["advance"], round(e.get("aspect", 0.6) * 904 / (1 - P["gap"])))


def manual_path(e, adv):
    """Hand-built glyph -> font units, stretched into a cell adv wide."""
    sys.path.insert(0, str(ROOT / "src"))
    import manual
    e = dict(e, w=min(max(e.get("w", 0.11), 0.07), 0.16))
    p = manual.render(e, 904)
    g = P["gap"] * adv / 2
    p = p.transform((adv - 2 * g) / (e.get("aspect", 1) * 904), 0, 0, -1, g, 840)
    if e["ch"] in MARKS:
        return p
    # fill the same cell as every other glyph; small stretch only, since scaling also thickens strokes
    x0, y0, x1, y1 = p.bounds
    sx = min((adv - 2 * g) / ((x1 - x0) or 1), 1.15)
    sy = min(904 / ((y1 - y0) or 1), 1.15)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return p.transform(sx, 0, 0, sy, adv / 2 - cx * sx, 388 - cy * sy)


def build(out):
    hand = {}
    for f in sorted((ROOT / "glyphs" / "manual").glob("*.json")):
        e = json.loads(f.read_text(encoding="utf-8"))
        hand[e["ch"]] = e
    chars = sorted(hand, key=ord)
    names = [".notdef", "space"] + [f"uni{ord(c):04X}" for c in chars]
    cmap = {32: "space", 0x3000: "space"} | {ord(c): f"uni{ord(c):04X}" for c in chars}
    glyphs = {".notdef": TTGlyphPen(None).glyph(), "space": TTGlyphPen(None).glyph()}
    for c in chars:
        pen = TTGlyphPen(None)
        manual_path(hand[c], advance_of(c, hand[c])).draw(Cu2QuPen(pen, 1.0, reverse_direction=True))
        glyphs[f"uni{ord(c):04X}"] = pen.glyph()
    fb = FontBuilder(1024, isTTF=True)
    fb.setupGlyphOrder(names)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    glyf = fb.font["glyf"]
    for n in names:
        glyf[n].recalcBounds(glyf)
    adv = {f"uni{ord(c):04X}": advance_of(c, hand[c]) for c in chars}
    fb.setupHorizontalMetrics({n: (adv.get(n, P["advance"]), getattr(glyf[n], "xMin", 0)) for n in names})
    fb.setupHorizontalHeader(ascent=900, descent=-124)
    fb.setupNameTable({"familyName": "TapeFont", "styleName": "Regular"})
    fb.setupOS2(sTypoAscender=900, sTypoDescender=-124, usWinAscent=900, usWinDescent=124)
    fb.setupPost()
    fb.save(out)
    return len(chars)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "build" / "hand.ttf")
    print(build(out), "glyphs ->", out)
