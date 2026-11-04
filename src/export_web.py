"""Export glyph data for the web engine (web/engine.js) as web/data.js.

usage: .venv/bin/python -I src/export_web.py
hand: glyphs/manual/*.json as they are (cell frame: x 0..aspect, y 0..1 down).
zh / ja: stroke skeletons in the same frame (em box -> 1x1 cell), lightly simplified,
coordinates in thousandths to keep the file small.
lib: tape parts cut out of the hand glyphs, per component and position (src/compose_lib.py).
comp: component trees (data/components.jsonl) of the chars web/compose.js assembles from lib,
as [skeleton source, tree]; only chars that passed src/compose_gate.py (data/compose_ok.tsv).
"""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import compose_lib, tape

ROOT = Path(__file__).resolve().parent.parent


def skel(path):
    out = {}
    for line in open(path, encoding="utf-8"):
        r = json.loads(line)
        out[r["ch"]] = [[[round(x * 1000 / 1024), round((900 - y) * 1000 / 1024)] for x, y in tape.rdp([tuple(p) for p in s], 6)]
                        for s in r["strokes"]]
    return out


def trees():
    out = {}
    for line in open(ROOT / "data/components.jsonl", encoding="utf-8"):
        r = json.loads(line)
        out[(r["ch"], r["src"])] = r["t"]
    return out


def build():
    files = [json.loads(f.read_text(encoding="utf-8")) for f in sorted((ROOT / "glyphs/manual").glob("*.json"))]
    hand = {e["ch"]: {k: e[k] for k in ("aspect", "w", "strips", "polys", "cuts", "sharp") if e.get(k)} for e in files}
    data = {"hand": hand, "zh": skel(ROOT / "data/skeletons.jsonl"), "ja": skel(ROOT / "data/skeletons_ja.jsonl")}
    t = trees()
    data["lib"] = compose_lib.library({e["ch"]: e for e in files}, t, {"zh": data["zh"], "ja": data["ja"]})
    ok = ROOT / "data/compose_ok.tsv"
    data["comp"] = {}
    for line in (ok.read_text(encoding="utf-8").splitlines() if ok.exists() else []):
        ch, src = line.split("\t")
        if ch not in hand and (ch, src) in t:
            data["comp"][ch] = [src, t[(ch, src)]]
    return data, t


if __name__ == "__main__":
    data, _ = build()
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "web/data.js"
    out.write_text("globalThis.TAPE_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(len(data["hand"]), "hand,", len(data["zh"]), "zh,", len(data["ja"]), "ja,", len(data["lib"]), "parts,",
          len(data["comp"]), "composed ->", out, f"{out.stat().st_size / 1e6:.1f} MB")
