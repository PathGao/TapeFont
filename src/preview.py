"""Check hand glyphs that have no photo: completeness and legibility against a normal font.

usage: .venv/bin/python -I src/preview.py OUT.png CHARS [--ja]
Per char, four panels: reference font | stroke skeleton | our glyph | our glyph with the
skeleton on top (green = stroke covered by tape, red = stroke missing).
Prints per char:
  strokes  covered/total skeleton strokes (a stroke counts when >= 70% of it lies on ink,
           after mapping the skeleton box onto our ink box). Missing dots show up here.
  holes    enclosed white areas, ours vs reference font. Fewer than the reference usually
           means counters got filled or merged (a blob); more is fine if they are slits.
  gap      width of the thinnest white region (counter or slit), as a fraction of cell
           height (< 0.02 reads as a hairline slit).
"""
import json, sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import manual

ROOT = Path(__file__).resolve().parent.parent
H = 240
REF = ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", int(H * 0.95))


def skeletons(ja):
    out = {}
    for f in (["skeletons_ja.jsonl"] if ja else []) + ["skeletons.jsonl"] + ([] if ja else ["skeletons_ja.jsonl"]):
        for line in open(ROOT / "data" / f, encoding="utf-8"):
            r = json.loads(line)
            out.setdefault(r["ch"], r["strokes"])
    return out


def ours(e):
    W = int(round(e.get("aspect", 0.68) * H))
    return manual.raster(manual.render(e, H), W, H)


def ref_ink(ch, W):
    im = Image.new("L", (H, H), 0)
    ImageDraw.Draw(im).text((H * 0.025, -H * 0.08), ch, font=REF, fill=255)
    a = np.array(im) > 127
    return np.array(Image.fromarray(a.astype(np.uint8) * 255).resize((W, H))) > 127


def holes(ink):
    bg = (~ink).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(bg, connectivity=4)
    h, w = ink.shape
    return sum(1 for i in range(1, n) if st[i, 4] > 0.0008 * h * w
               and st[i, 0] > 0 and st[i, 1] > 0 and st[i, 0] + st[i, 2] < w and st[i, 1] + st[i, 3] < h)


def min_gap(ink):
    """Width of the thinnest enclosed white region (counter or closed slit), as a fraction
    of cell height. Each white region's width = 2 x its deepest distance to ink, so a narrow
    crotch of a wide region does not count."""
    if not ink.any():
        return 0.0
    ys, xs = np.nonzero(ink)
    box = (~ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1]).astype(np.uint8)
    d = cv2.distanceTransform(np.pad(box, 1), cv2.DIST_L2, 3)[1:-1, 1:-1]
    n, lab, st, _ = cv2.connectedComponentsWithStats(box, connectivity=4)
    h, w = box.shape
    widths = [2 * d[lab == i].max() / H for i in range(1, n) if st[i, 4] > 0.0005 * H * H
              and st[i, 0] > 0 and st[i, 1] > 0 and st[i, 0] + st[i, 2] < w and st[i, 1] + st[i, 3] < h]
    return float(min(widths)) if widths else 0.08


def coverage(ink, strokes, w):
    ys, xs = np.nonzero(ink)
    if not len(xs) or not strokes:
        return [], []
    pts = [p for s in strokes for p in s]
    sx0, sx1 = min(p[0] for p in pts), max(p[0] for p in pts)
    sy0, sy1 = min(p[1] for p in pts), max(p[1] for p in pts)
    pad = w * H / 2
    bx0, bx1, by0, by1 = xs.min() + pad, xs.max() - pad, ys.min() + pad, ys.max() - pad
    mx = lambda x: bx0 + (x - sx0) / ((sx1 - sx0) or 1) * (bx1 - bx0)
    my = lambda y: by0 + (sy1 - y) / ((sy1 - sy0) or 1) * (by1 - by0)
    near = cv2.distanceTransform((~ink).astype(np.uint8), cv2.DIST_L2, 3) <= w * H * 0.9
    mapped, ok = [], []
    for s in strokes:
        seg = []
        for (x0, y0), (x1, y1) in zip(s, s[1:]):
            n = max(2, int(np.hypot(x1 - x0, y1 - y0) / 8))
            seg += [(mx(x0 + (x1 - x0) * t), my(y0 + (y1 - y0) * t)) for t in np.linspace(0, 1, n)]
        if len(s) == 1:
            seg = [(mx(s[0][0]), my(s[0][1]))]
        hit = [near[min(max(int(y), 0), H - 1), min(max(int(x), 0), ink.shape[1] - 1)] for x, y in seg]
        mapped.append(seg)
        ok.append(sum(hit) / len(hit) >= 0.7)
    return mapped, ok


def main():
    out, chars = sys.argv[1], sys.argv[2]
    ja = "--ja" in sys.argv
    sk = skeletons(ja)
    tiles = []
    for ch in chars:
        f = ROOT / f"glyphs/manual/{ord(ch):04X}.json"
        if not f.exists():
            print(f"{ch}  no glyph file")
            continue
        e = json.loads(f.read_text(encoding="utf-8"))
        g = ours(e)
        W = g.shape[1]
        r = ref_ink(ch, W)
        strokes = sk.get(ch, [])
        mapped, ok = coverage(g, strokes, e.get("w", 0.11))
        print(f"{ch}  strokes {sum(ok)}/{len(ok)}" + (f" missing {[i for i, v in enumerate(ok) if not v]}" if not all(ok) else "")
              + f"  holes {holes(g)} (ref {holes(r)})  gap {min_gap(g):.3f}")
        panels = [Image.fromarray(np.where(r, 40, 255).astype(np.uint8)).convert("RGB")]
        sk_im = Image.new("RGB", (W, H), "white")
        d = ImageDraw.Draw(sk_im)
        for s in mapped:
            d.line(s, fill=(0, 0, 0), width=3)
        panels.append(sk_im)
        gi = Image.fromarray(np.where(g, 20, 255).astype(np.uint8)).convert("RGB")
        panels.append(gi)
        ov = Image.fromarray(np.where(g, 170, 255).astype(np.uint8)).convert("RGB")
        d = ImageDraw.Draw(ov)
        for s, good in zip(mapped, ok):
            d.line(s, fill=(0, 160, 0) if good else (230, 0, 0), width=4)
        panels.append(ov)
        tile = Image.new("RGB", (4 * (W + 6), H + 30), (235, 235, 235))
        for i, p in enumerate(panels):
            tile.paste(p, (i * (W + 6), 0))
        ImageDraw.Draw(tile).text((4, H + 4), ch, font=ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", 20), fill=0)
        tiles.append(tile)
    if tiles:
        cols = 3
        tw, th = tiles[0].size
        sheet = Image.new("RGB", (cols * (tw + 12), ((len(tiles) + cols - 1) // cols) * (th + 12)), "white")
        for i, t in enumerate(tiles):
            sheet.paste(t, ((i % cols) * (tw + 12), (i // cols) * (th + 12)))
        sheet.save(out)


if __name__ == "__main__":
    main()
