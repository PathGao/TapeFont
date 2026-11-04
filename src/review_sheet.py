"""Review material for the web engine: one folder with images + per-char metrics.

usage: .venv/bin/python -I src/review_sheet.py OUT_DIR "line1|line2|..."
Writes:
  engine.png       the engine's output (line solve on)
  engine_off.png   the same without the line solve (each glyph as built)
  font.png         the same text in the finalized font build/hand.ttf (missing chars blank)
  photos.png       Sato's original signs: photo traces of chars that have one, per line
  metrics.tsv      per char of engine output: source (hand/skeleton), strokes covered/total,
                   holes ours/reference font, thinnest enclosed white gap
"""
import json, subprocess, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import preview

ROOT = Path(__file__).resolve().parent.parent
out, text = Path(sys.argv[1]), sys.argv[2]
out.mkdir(parents=True, exist_ok=True)
lines = text.split("|")

for name, extra in (("engine", []), ("engine_off", ["--noalign"])):
    subprocess.run(["node", str(ROOT / "web/cli.js"), text, str(out / f"{name}.json")] + extra, check=True)
    subprocess.run([sys.executable, "-I", str(ROOT / "src/raster_web.py"), str(out / f"{name}.json"), str(out / f"{name}.png"), "110"], check=True)
subprocess.run([sys.executable, "-I", str(ROOT / "src/sample.py"), str(ROOT / "build/hand.ttf"), str(out / "font.png"), text], check=True)

# photo traces, one row per line
trace = {}
for f in (ROOT / "glyphs/manual").glob("*.json"):
    e = json.loads(f.read_text(encoding="utf-8"))
    if e.get("src"):
        trace[e["ch"]] = ROOT / "refs/traced" / e["src"].replace(".svg", ".png")
H, W = 110, 75
rows = []
for t in lines:
    row = Image.new("L", (max(1, len(t)) * (W + 6), H), 255)
    for i, ch in enumerate(t):
        if ch in trace:
            row.paste(Image.open(trace[ch]).convert("L").resize((W, H)), (i * (W + 6), 0))
    rows.append(row)
sheet = Image.new("L", (max(r.width for r in rows) + 20, len(rows) * (H + 20) + 10), 255)
for i, r in enumerate(rows):
    sheet.paste(r, (10, 10 + i * (H + 20)))
sheet.save(out / "photos.png")

# metrics on the engine's own glyphs
hand = {json.loads(f.read_text(encoding="utf-8"))["ch"] for f in (ROOT / "glyphs/manual").glob("*.json")}
eng = json.load(open(out / "engine.json"))
sk_ja, sk_zh = preview.skeletons(True), preview.skeletons(False)
rows = ["line\tchar\tsource\tstrokes\tholes(ours/ref)\tgap"]
k = preview.H
for li, L in enumerate(eng["lines"]):
    kana = any("぀" <= c <= "ヿ" for c in lines[li])
    for c in L["chars"]:
        if not c["shapes"]:
            continue
        cw = max(1, round(c["width"] * k))
        im = Image.new("L", (cw, k), 255)
        d = ImageDraw.Draw(im)
        for s in c["shapes"]:
            d.polygon([(x * k, y * k) for x, y in s], fill=0)
        for s in c["cuts"]:
            d.polygon([(x * k, y * k) for x, y in s], fill=255)
        ink = np.array(im) < 128
        strokes = (sk_ja if kana else sk_zh).get(c["ch"]) or sk_zh.get(c["ch"]) or sk_ja.get(c["ch"], [])
        _, ok = preview.coverage(ink, strokes, 0.11)
        ref = preview.ref_ink(c["ch"], cw)
        rows.append(f"{li + 1}\t{c['ch']}\t{'hand' if c['ch'] in hand else 'skeleton'}\t{sum(ok)}/{len(ok)}"
                    f"\t{preview.holes(ink)}/{preview.holes(ref)}\t{preview.min_gap(ink):.3f}")
(out / "metrics.tsv").write_text("\n".join(rows) + "\n", encoding="utf-8")
print(f"{len(rows) - 1} chars -> {out}")
