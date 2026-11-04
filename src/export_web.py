"""Export glyph data for the web engine (web/engine.js) as web/data.js.

usage: .venv/bin/python -I src/export_web.py
hand: glyphs/manual/*.json as they are (cell frame: x 0..aspect, y 0..1 down).
zh / ja: stroke skeletons in the same frame (em box -> 1x1 cell), lightly simplified,
coordinates in thousandths to keep the file small.
"""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import tape

ROOT = Path(__file__).resolve().parent.parent


def skel(path):
    out = {}
    for line in open(path, encoding="utf-8"):
        r = json.loads(line)
        out[r["ch"]] = [[[round(x * 1000 / 1024), round((900 - y) * 1000 / 1024)] for x, y in tape.rdp([tuple(p) for p in s], 6)]
                        for s in r["strokes"]]
    return out


hand = {}
for f in sorted((ROOT / "glyphs/manual").glob("*.json")):
    e = json.loads(f.read_text(encoding="utf-8"))
    hand[e["ch"]] = {k: e[k] for k in ("aspect", "w", "strips", "polys", "cuts", "sharp") if e.get(k)}
data = {"hand": hand, "zh": skel(ROOT / "data/skeletons.jsonl"), "ja": skel(ROOT / "data/skeletons_ja.jsonl")}
out = ROOT / "web/data.js"
out.write_text("globalThis.TAPE_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print(len(hand), "hand,", len(data["zh"]), "zh,", len(data["ja"]), "ja ->", out, f"{out.stat().st_size / 1e6:.1f} MB")
