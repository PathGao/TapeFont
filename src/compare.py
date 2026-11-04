"""Traced originals (top) vs generated glyphs (bottom), plus an overlap score.
usage: .venv/bin/python -I src/compare.py FONT.ttf OUT.png CHARS|@traced [aspect]
Uses the first confirmed (non x_) trace of each char. Both sides are cropped to their ink
and resized to the same cell, so the score (IoU, 1 = identical) ignores margins."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
font, out, chars = sys.argv[1], sys.argv[2], sys.argv[3]
aspect = float(sys.argv[4]) if len(sys.argv) > 4 else 0.68
H, W = 120, int(120 * aspect)
traces = {}
for line in open(ROOT / "refs/traced/index.tsv", encoding="utf-8"):
    f, ch = line.split("\t")[:2]
    if "_x_" not in f and ch not in traces:
        traces[ch] = ROOT / "refs/traced" / f.replace(".svg", ".png")
for m in (ROOT / "glyphs/manual").glob("*.json"):  # prefer the trace each hand glyph was built from
    import json
    e = json.loads(m.read_text(encoding="utf-8"))
    if e.get("src"):
        traces[e["ch"]] = ROOT / "refs/traced" / e["src"].replace(".svg", ".png")
f = ImageFont.truetype(font, 400)
if chars == "@traced":
    chars = "".join(c for c in traces if f.getmask(c).getbbox() and c.strip() and ord(c) > 0x3000)


def norm(ink):  # bool array -> ink cropped to bbox, resized to W x H
    ys, xs = np.nonzero(ink)
    if not len(xs):
        return np.zeros((H, W), bool)
    im = Image.fromarray((ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1] * 255).astype(np.uint8))
    return np.array(im.resize((W, H))) > 127


def gen(ch):
    im = Image.new("L", (600, 600), 0)
    ImageDraw.Draw(im).text((50, 0), ch, font=f, fill=255)
    return norm(np.array(im) > 127)


scores = {}
pairs = []
for ch in chars:
    g = gen(ch)
    t = norm(np.array(Image.open(traces[ch]).convert("L")) < 128) if ch in traces else None
    if t is not None:
        scores[ch] = (g & t).sum() / max((g | t).sum(), 1)
    pairs.append((t, g))

per = 20  # pairs per row: photo trace on top, our glyph below, char + score under it
lab = ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", 18)
rows = (len(pairs) + per - 1) // per
img = Image.new("L", (per * (W + 12) + 12, rows * (2 * H + 52) + 12), 235)
d = ImageDraw.Draw(img)
for i, ((t, g), ch) in enumerate(zip(pairs, chars)):
    x, y = 12 + (i % per) * (W + 12), 12 + (i // per) * (2 * H + 52)
    if t is not None:
        img.paste(Image.fromarray(np.where(t, 20, 255).astype(np.uint8)), (x, y))
    img.paste(Image.fromarray(np.where(g, 20, 255).astype(np.uint8)), (x, y + H + 4))
    d.text((x, y + 2 * H + 8), f"{ch} {scores.get(ch, 0):.2f}", font=lab, fill=0)
img.save(out)
print(f"mean IoU {np.mean(list(scores.values())):.3f} over {len(scores)} chars")
print(" ".join(f"{c}{v:.2f}" for c, v in sorted(scores.items(), key=lambda kv: kv[1])[:12]))
