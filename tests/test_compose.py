"""Component trees and the part library. Run: .venv/bin/python -I -m unittest discover -s tests"""
import json, sys, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))
sys.path.insert(0, str(ROOT / "src/data_prep"))
import build_components, compose_lib  # noqa: E402


class Components(unittest.TestCase):
    def test_ids_tree(self):
        # 们 = ⿰亻门: strokes 0-1 are 亻 (left), 2-4 are 门 (right)
        r = {"character": "们", "decomposition": "⿰亻门", "matches": [[0], [0], [1], [1], [1]]}
        strokes = [[[100, 800], [100, 0]]] * 2 + [[[500, 800], [900, 800]]] * 3
        t = build_components.parse_ids(r, strokes)
        self.assertEqual([(k[0], k[1], k[3]) for k in t[3]], [("亻", "left", [0, 1]), ("门", "right", [2, 3, 4])])

    def test_cut_parts(self):
        # 語 (hand glyph) cut along its KanjiVG tree: 言 on the left takes the left tape only
        e = json.loads((ROOT / "glyphs/manual/8A9E.json").read_text(encoding="utf-8"))
        rec = next(json.loads(l) for l in (ROOT / "data/components.jsonl").read_text(encoding="utf-8").splitlines() if l.startswith('{"ch":"語","src":"ja"'))
        sk = next(json.loads(l) for l in (ROOT / "data/skeletons_ja.jsonl").read_text(encoding="utf-8").splitlines() if l.startswith('{"ch": "語"'))
        strokes = [[[x * 1000 / 1024, (900 - y) * 1000 / 1024] for x, y in s] for s in sk["strokes"]]
        parts = {k: p for k, _, p in compose_lib.cut(e, rec["t"], strokes)}
        self.assertIn("言|left", parts)
        left = parts["言|left"]
        self.assertLess(left["box"][2], 0.36)
        self.assertEqual(len(left["strips"]), 5)
        self.assertGreater(parts["吾|right"]["box"][0], 0.3)


if __name__ == "__main__":
    unittest.main()
