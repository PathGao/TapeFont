# Building a glyph

How to add or fix a character in `glyphs/manual/`. Sato's method is in `docs/book_method.md`; how each radical and kana stroke is built is in `docs/radicals.md`.

## File format

One JSON per character: `glyphs/manual/<HEX>.json`, HEX = 4-digit uppercase codepoint (口 → `53E3.json`). Coordinates are in the glyph's cell: x 0..aspect, y 0..1, y down.

```json
{"ch": "口", "src": "口_a041_1_0.svg", "aspect": 0.68, "w": 0.11,
 "strips": [[[x, y], [x, y], ...], ...],
 "polys":  [[[x, y], ...], ...],
 "cuts":   [[[x, y], ...], ...],
 "sharp":  [[x, y], ...],
 "note": "one line: how it is built"}
```

- `strips`: tape centerlines, `w` wide, square ends.
- `polys`: extra filled shapes (blocks, wedges, dots, diagonal slabs).
- `cuts`: shapes cut out after the union (slits, notches, cell-edge trims).
- `sharp`: outline corners near these points stay square.
- `src`: the photo trace in `refs/traced/` the glyph was built from, or `null` if there was no photo. Glyphs with a `src` are the approved reference; change them only on purpose.

Outer bends of the merged outline are rounded about one tape width; strip ends and inner corners stay square.

## Standard

- Tape `w` 0.11 of cell height. Dense characters (6+ verticals or 7+ stacked bars) may use 0.09, or a solid block with hairline slits.
- Kana and kanji: `aspect` 0.68, edge to edge. Latin capitals and digits: full height, their own narrow aspect (digits share 0.58).
- Small kana and marks (ー 。 、 ・ ァ ッ ゃ …) keep their own size, sitting on the baseline.
- Bars sit on shared levels: top ~0.055 (or ~0.17 when a dot sits above it), middle ~0.46–0.5, base ~0.945.
- Every stroke of the normal character is there, dots included. Simplify shapes, never drop strokes.
- Counters stay open where a normal font has them; white between parallel strips at least ~0.03 of cell height unless it is a deliberate hairline slit.

## Tools

- From a photo: `src/trace.py` rectifies one sign row into cells and writes traces to `refs/traced/` (`index.tsv` lists every trace; `photo_notes.md` gives each photo's true cell aspect and tape weight). Several chars have more than one trace: pick the cleanest confirmed one. Build the glyph over the trace and check it with
  `.venv/bin/python -I src/manual.py glyphs/manual/<HEX>.json [overlay.png]`
  (IoU against the trace; overlay black = both, blue = photo only, red = ours only). IoU is a hint, not a grade: every glyph was re-laid at the standard weight and cell, so a heavy photo scores low, and glyphs whose note starts with "Deliberately differs from the photo" (へ 以 マ T …) were changed on purpose for legibility.
- Without a photo:
  `.venv/bin/python -I src/preview.py out.png "<chars>" [--ja]`
  prints per char: strokes covered / total against a normal font's skeleton (missing dots show up here), enclosed holes ours vs reference font, thinnest enclosed white gap. The PNG shows reference | skeleton | ours | ours with the skeleton on top (red = missing stroke).
- In context: rebuild the font and look at a sample next to existing glyphs:
  `.venv/bin/python -I src/tape.py`
  `.venv/bin/python -I src/sample.py build/hand.ttf out.png "line1|line2"`
- Then refresh the web engine's data: `.venv/bin/python -I src/export_web.py`.
