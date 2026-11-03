"""Build stroke skeletons from Make Me a Hanzi + KanjiVG.

Coordinate system (all outputs): MMAH native font units.
  em 1024, y up, baseline y=0, em box x in [0,1024], y in [-124,900].
  MMAH medians are used unchanged.
  KanjiVG (109x109, y down): x' = x*1024/109, y' = 900 - y*1024/109.

Usage: python -I build_skeletons.py <project_dir>
"""
import json, re, sys, unicodedata
from pathlib import Path

S = 1024 / 109
TOK = re.compile(r"[MmCcSsLlHhVvZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE]-?\d+)?")


def cubic(p0, p1, p2, p3, n=16):
    out = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        out.append((u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
                    u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]))
    return out


def flatten(d):
    """SVG path d -> list of polylines (one per subpath)."""
    toks, i, cmd = TOK.findall(d), 0, None
    cur, ctrl, polys = (0.0, 0.0), None, []

    def nums(k):
        nonlocal i
        v = [float(t) for t in toks[i:i + k]]; i += k
        return v

    while i < len(toks):
        if toks[i].isalpha():
            cmd = toks[i]; i += 1
            if cmd in "Zz":
                continue
        rel, c = cmd.islower(), cmd.upper()
        ox, oy = cur if rel else (0.0, 0.0)
        if c == "M":
            x, y = nums(2); cur = (ox + x, oy + y); polys.append([cur]); ctrl = None
            cmd = "l" if rel else "L"  # implicit lineto after moveto
        elif c in "LHV":
            if c == "L": x, y = nums(2); cur = (ox + x, oy + y)
            elif c == "H": cur = ((ox if rel else 0) + nums(1)[0], cur[1])
            else: cur = (cur[0], (oy if rel else 0) + nums(1)[0])
            polys[-1].append(cur); ctrl = None
        elif c in "CS":
            if c == "C":
                a, b, e, f, x, y = nums(6); p1 = (ox + a, oy + b)
            else:
                e, f, x, y = nums(4)
                p1 = (2*cur[0] - ctrl[0], 2*cur[1] - ctrl[1]) if ctrl else cur
            p2, p3 = (ox + e, oy + f), (ox + x, oy + y)
            polys[-1] += cubic(cur, p1, p2, p3); cur, ctrl = p3, p2
        else:
            raise ValueError(f"unsupported path command {cmd!r} in {d!r}")
    return polys


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (ax, ay), (bx, by) = pts[0], pts[-1]
    dx, dy = bx - ax, by - ay; L = (dx*dx + dy*dy) ** .5 or 1e-9
    dists = [abs(dy*(px - ax) - dx*(py - ay)) / L for px, py in pts[1:-1]]
    k = max(range(len(dists)), key=dists.__getitem__)
    if dists[k] <= eps:
        return [pts[0], pts[-1]]
    return rdp(pts[:k + 2], eps)[:-1] + rdp(pts[k + 1:], eps)


def kvg_strokes(svg_text, eps=3.0):
    paths = re.findall(r'<path id="kvg:[0-9a-f]+(?:-[^"]*)?-s(\d+)"[^>]*\sd="([^"]+)"', svg_text)
    out, multi = [], 0
    for _, d in sorted(paths, key=lambda p: int(p[0])):
        polys = flatten(d)
        multi += len(polys) > 1
        pts = [p for poly in polys for p in poly]  # ponytail: subpaths concatenated; count reported
        pts = [(round(x*S, 1), round(900 - y*S, 1)) for x, y in pts]
        out.append([[round(x), round(y)] for x, y in rdp(pts, eps)])
    return out, multi


def is_kanji(ch):
    return unicodedata.name(ch, "").startswith("CJK ")


def main(root):
    raw, out = root / "data/raw", root / "data"
    mmah = {}
    for line in open(raw / "mmah/graphics.txt", encoding="utf-8"):
        r = json.loads(line)
        mmah[r["character"]] = r["medians"]
    kvg, multi_chars = {}, []
    for f in sorted((raw / "kanjivg/main/kanji").glob("*.svg")):
        if "-" in f.stem:
            continue  # variant files (Kaisho etc.) not in main, skip if present
        ch = chr(int(f.stem, 16))
        strokes, multi = kvg_strokes(f.read_text(encoding="utf-8"))
        if strokes:
            kvg[ch] = strokes
        if multi:
            multi_chars.append(ch)
    rec = lambda ch, src, s: json.dumps({"ch": ch, "src": src, "strokes": s}, ensure_ascii=False) + "\n"
    with open(out / "skeletons.jsonl", "w", encoding="utf-8") as f:
        for ch, s in mmah.items():
            f.write(rec(ch, "mmah", s))
        for ch, s in kvg.items():
            if ch not in mmah:
                f.write(rec(ch, "kanjivg", s))
    with open(out / "skeletons_ja.jsonl", "w", encoding="utf-8") as f:
        for ch, s in kvg.items():
            if is_kanji(ch):
                f.write(rec(ch, "kanjivg", s))
    print(f"mmah={len(mmah)} kanjivg={len(kvg)} kvg_only={sum(c not in mmah for c in kvg)}"
          f" ja_kanji={sum(map(is_kanji, kvg))} kvg_multi_subpath={len(multi_chars)} {''.join(multi_chars[:40])}")


def _check():
    p = flatten("M10,10c0,0,10,0,10,10s10,10,10,10L40,20h5v-5")[0]
    assert p[0] == (10, 10) and p[16] == (20, 20) and p[32] == (30, 30) and p[-1] == (45, 15), p
    assert rdp([(0, 0), (1, 0.01), (2, 0)], 0.1) == [(0, 0), (2, 0)]


if __name__ == "__main__":
    _check()
    main(Path(sys.argv[1]).resolve())
