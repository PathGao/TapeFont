"""Turn stroke skeletons into tape-lettering glyphs and build a TTF.

usage: .venv/bin/python -I src/tape.py OUT.ttf [chars|@all] [--ja]
Coordinates: em 1024, y up, baseline 0, ascent 900 (data/skeletons.jsonl convention).
"""
import json, math, sys
from pathlib import Path

import pathops
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

ROOT = Path(__file__).resolve().parent.parent

# Style knobs, to be tuned against the traced photos in refs/traced/.
P = dict(
    width=100,        # tape width: ~0.11 of glyph height in the photos
    simplify=38,      # RDP tolerance: how hard curves get straightened
    snap=30,          # segments within this many degrees of H/V become exact H/V
    merge=0.6,        # strokes closer than this many tape widths share one line
    join=1.0,         # an end within this many tape widths of another stroke joins it
    even=0.7,         # 0 = keep original stroke spacing, 1 = perfectly even spacing
    min_seg=60,       # drop end segments shorter than this (hook tails)
    advance=1024,     # cell width; photos are mostly 0.42-0.75 of height, a few square
    gap=0.06,         # space between cells / advance (photos: 0.03-0.09)
    max_stretch=1.8,   # only stops 一/丶-like glyphs from blowing up into a block
    radius=1.0,       # outer corner radius / tape width (Sato cuts a quarter circle ~1 width)
    inner=0.1,        # inner corner radius / tape width (photos: square to 0.3)
)


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


def straighten(pts):
    pts = rdp([tuple(p) for p in pts], P["simplify"])
    while len(pts) > 2 and math.dist(pts[-1], pts[-2]) < P["min_seg"]:
        pts.pop()
    while len(pts) > 2 and math.dist(pts[0], pts[1]) < P["min_seg"]:
        pts.pop(0)
    # Near-horizontal/vertical segments become exact by averaging the shared
    # coordinate, so endpoints stay put and strokes keep touching each other.
    pts = [list(p) for p in pts]
    tol = math.radians(P["snap"])
    for a, b in zip(pts, pts[1:]):
        ang = abs(math.atan2(b[1] - a[1], b[0] - a[0])) % math.pi
        if min(ang, math.pi - ang) < tol:
            a[1] = b[1] = (a[1] + b[1]) / 2
        elif abs(ang - math.pi / 2) < tol:
            a[0] = b[0] = (a[0] + b[0]) / 2
    return [tuple(p) for p in pts]


def even_out(strokes):
    """Sato lays equally spaced strips first, then cuts. So: collect the levels of all
    horizontal strokes (y) and vertical strokes (x), merge near-equal ones into one shared
    line, and move them toward even spacing. The warp is monotone and piecewise linear,
    so stroke order is kept and diagonal ends follow along."""
    out = [list(map(list, s)) for s in strokes]
    for k in (0, 1):  # k=0: x of vertical strokes, k=1: y of horizontal strokes
        lv = [a[k] for s in out for a, b in zip(s, s[1:]) if abs(a[k] - b[k]) < 1e-6]
        allc = [p[k] for s in out for p in s]
        lv = sorted(lv + [min(allc), max(allc)])
        merged = [[lv[0]]]
        for v in lv[1:]:
            if v - merged[-1][-1] < P["merge"] * P["width"]:
                merged[-1].append(v)
            else:
                merged.append([v])
        src = [sum(m) / len(m) for m in merged]
        if len(src) < 2:
            continue
        lo, hi = src[0], src[-1]
        dst = [(1 - P["even"]) * v + P["even"] * (lo + (hi - lo) * i / (len(src) - 1)) for i, v in enumerate(src)]
        for s in out:
            for p in s:
                v = p[k]
                if any(v in m for m in merged):  # exact snap to the shared line
                    p[k] = dst[next(i for i, m in enumerate(merged) if v in m)]
                    continue
                j = max(0, min(len(src) - 2, sum(1 for x in src if x <= v) - 1))
                t = (v - src[j]) / ((src[j + 1] - src[j]) or 1)
                p[k] = dst[j] + t * (dst[j + 1] - dst[j])
    return [[tuple(p) for p in s] for s in out]


def fit(strokes):
    xs = [x for s in strokes for x, _ in s]
    ys = [y for s in strokes for _, y in s]
    h = P["width"] / 2  # joined ends stick out by half a tape width
    g = P["gap"] * P["advance"] / 2
    x0, y0, x1, y1 = g + h, -64 + h, P["advance"] - g - h, 840 - h  # every glyph fills the same cell
    w, h = max(xs) - min(xs) or 1, max(ys) - min(ys) or 1
    sx = min((x1 - x0) / w, P["max_stretch"])
    sy = min((y1 - y0) / h, P["max_stretch"])
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    return [[(mx + (x - cx) * sx, my + (y - cy) * sy) for x, y in s] for s in strokes]


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


def join_ends(strokes):
    """An end that touches another stroke moves onto that stroke's centerline and is
    extended half a tape width, so it stops flush with the far edge (no poke-through).
    A free end stays where the skeleton ends."""
    w = P["width"]
    out = []
    for i, s in enumerate(strokes):
        s = list(s)
        for e, nb in ((0, 1), (-1, -2)):
            if len(s) < 2:
                break
            best = None
            for j, o in enumerate(strokes):
                if j == i:
                    continue
                for a, b in zip(o, o[1:]):
                    dx, dy = b[0] - a[0], b[1] - a[1]
                    L2 = dx * dx + dy * dy or 1
                    t = max(0, min(1, ((s[e][0] - a[0]) * dx + (s[e][1] - a[1]) * dy) / L2))
                    q = (a[0] + t * dx, a[1] + t * dy)
                    d = math.dist(q, s[e])
                    if d < P["join"] * w and (best is None or d < best[0]):
                        best = (d, q)
            if best is None:
                continue
            q = best[1]
            vx, vy = q[0] - s[nb][0], q[1] - s[nb][1]
            L = math.hypot(vx, vy)
            if L < 1:
                continue
            s[e] = (q[0] + vx / L * w / 2, q[1] + vy / L * w / 2)
        out.append(s)
    return out


def glyph_path(strokes):
    strokes = join_ends(fit(even_out([straighten(s) for s in strokes])))
    out = pathops.Path()
    for s in strokes:
        p = pathops.Path()
        p.moveTo(*s[0])
        for pt in s[1:]:
            p.lineTo(*pt)
        p.stroke(P["width"], pathops.LineCap.BUTT_CAP, pathops.LineJoin.MITER_JOIN, 4)
        p.convertConicsToQuads()
        out = pathops.op(out, p, pathops.PathOp.UNION)
    out.simplify()
    return round_corners(out)


def load(ja):
    data = {}
    for f in ["skeletons.jsonl"] + (["skeletons_ja.jsonl"] if ja else []):
        for line in open(ROOT / "data" / f, encoding="utf-8"):
            r = json.loads(line)
            data[r["ch"]] = r["strokes"]
    return data


MARKS = "ー一、。・.,〜!-ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ"  # keep their own size and place in the cell


def advance_of(c, e=None):
    """Kana/kanji share one cell width; Latin, digits and ASCII marks keep their photo width."""
    if e is None or ord(c) >= 0x2000:
        return P["advance"]
    return min(P["advance"], round(e.get("aspect", 0.6) * 904 / (1 - P["gap"])))


def manual_path(e, adv):
    """Hand-built glyph (glyphs/manual) -> font units, stretched into a cell adv wide."""
    sys.path.insert(0, str(ROOT / "src"))
    import manual
    e = dict(e, w=min(max(e.get("w", 0.11), 0.09), 0.16))  # strips keep their sign weight (polys were drawn for it), only extremes are pulled in
    p = manual.render(e, 904)
    g = P["gap"] * adv / 2
    p = p.transform((adv - 2 * g) / (e.get("aspect", 1) * 904), 0, 0, -1, g, 840)
    if e["ch"] in MARKS:
        return p
    # fill the same cell as every other glyph (photo cells have uneven margins)
    x0, y0, x1, y1 = p.bounds
    # small stretch only: scaling also thickens strokes, and glyphs are drawn to fill the cell
    sx = min((adv - 2 * g) / ((x1 - x0) or 1), 1.15)
    sy = min(904 / ((y1 - y0) or 1), 1.15)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return p.transform(sx, 0, 0, sy, adv / 2 - cx * sx, 388 - cy * sy)


def build(out, chars, ja=False):
    data = load(ja)
    hand = {}
    for f in (ROOT / "glyphs" / "manual").glob("*.json"):
        e = json.loads(f.read_text(encoding="utf-8"))
        if e.get("strips") or e.get("polys"):
            hand[e["ch"]] = e
    chars = [c for c in dict.fromkeys(chars) if c in data or c in hand]
    names = [".notdef", "space"] + [f"uni{ord(c):04X}" for c in chars]
    cmap = {32: "space", 0x3000: "space"} | {ord(c): f"uni{ord(c):04X}" for c in chars}
    glyphs = {".notdef": TTGlyphPen(None).glyph(), "space": TTGlyphPen(None).glyph()}
    for c in chars:
        pen = TTGlyphPen(None)
        path = manual_path(hand[c], advance_of(c, hand[c])) if c in hand else glyph_path(data[c])
        path.draw(Cu2QuPen(pen, 1.0, reverse_direction=True))
        glyphs[f"uni{ord(c):04X}"] = pen.glyph()
    fb = FontBuilder(1024, isTTF=True)
    fb.setupGlyphOrder(names)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    glyf = fb.font["glyf"]
    for n in names:
        glyf[n].recalcBounds(glyf)
    adv = {f"uni{ord(c):04X}": advance_of(c, hand.get(c)) for c in chars}
    fb.setupHorizontalMetrics({n: (adv.get(n, P["advance"]), getattr(glyf[n], "xMin", 0)) for n in names})
    fb.setupHorizontalHeader(ascent=900, descent=-124)
    name = "TapeFont JA" if ja else "TapeFont"
    fb.setupNameTable({"familyName": name, "styleName": "Regular"})
    fb.setupOS2(sTypoAscender=900, sTypoDescender=-124, usWinAscent=900, usWinDescent=124)
    fb.setupPost()
    fb.save(out)
    return len(chars)


if __name__ == "__main__":
    out, sel = sys.argv[1], sys.argv[2]
    for a in sys.argv[3:]:
        if "=" in a:  # knob overrides, e.g. advance=700
            k, v = a.split("=")
            P[k] = float(v)
    P["advance"] = int(P["advance"])
    ja = "--ja" in sys.argv
    chars = "".join(load(ja)) if sel == "@all" else sel
    print(build(out, chars, ja), "glyphs ->", out)
