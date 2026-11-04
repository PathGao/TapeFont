"""Glyph JSON sanity and a full font build. Run: .venv/bin/python -I -m unittest discover -s tests"""
import json, sys, tempfile, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))
import tape  # noqa: E402
from fontTools.ttLib import TTFont  # noqa: E402

KEYS = {"ch", "src", "aspect", "w", "strips", "polys", "cuts", "sharp", "note"}
FILES = sorted((ROOT / "glyphs" / "manual").glob("*.json"))


class GlyphJson(unittest.TestCase):
    def test_entries(self):
        self.assertTrue(FILES)
        for f in FILES:
            with self.subTest(f.name):
                e = json.loads(f.read_text(encoding="utf-8"))
                self.assertEqual(ord(e["ch"]), int(f.stem, 16))
                self.assertLessEqual(set(e), KEYS)
                self.assertTrue(0.07 <= e["w"] <= 0.16, e["w"])
                if e["src"] is not None:
                    self.assertTrue((ROOT / "refs" / "traced" / e["src"]).is_file(), e["src"])


class FontBuild(unittest.TestCase):
    def test_build(self):
        chars = [json.loads(f.read_text(encoding="utf-8"))["ch"] for f in FILES]
        with tempfile.TemporaryDirectory() as d:
            out = str(Path(d) / "t.ttf")
            self.assertEqual(tape.build(out), len(FILES))
            font = TTFont(out)
            self.assertEqual(len(font.getGlyphOrder()), len(FILES) + 2)  # + .notdef, space
            cmap = font.getBestCmap()
            for c in chars:
                self.assertIn(ord(c), cmap, c)


if __name__ == "__main__":
    unittest.main()
