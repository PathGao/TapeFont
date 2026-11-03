# Rebuilding hand glyphs at one standard weight

Read docs/manual_brief.md first: same JSON format, same checker (`src/manual.py`), same Sato rules.

## Why
The first pass copied each photo's own tape weight. Photos range from thin (0.05 of cell height) to very heavy (0.3, the b017 katakana chart). In the font, strips are clamped to one weight but `polys`/`cuts` keep the photo's weight, so heavy glyphs come out half thick, half thin, and the font looks uneven. The user says some glyphs are far too bold.

## Standard (every rebuilt glyph)
- `"w": 0.11` exactly.
- Kana, kanji, arrows, symbols: `"aspect": 0.68`. Latin letters and digits: their natural narrow aspect (0.45–0.75 typical), but the glyph must use the full cell height (no small caps).
- Small marks (ー 一 、 。 ・ . , 〜 !) keep their own size and position.
- `polys` and `cuts` are drawn for w = 0.11: a dot is about 0.11–0.14 across, a slit 0.015–0.03, a diagonal slab as thick as one tape.
- Heavy-sign tricks (solid blocks with hairline slits) stay only where thin and normal signs also use them (dense kanji like 暮 霊 繊). In simple glyphs (kana, 口, 日) use real strip outlines with open counters.
- Keep the construction of the photo: same strips, same bends, same level layout, same diagonal-vs-vertical choices. Only the weight and cell change.

## Round 2: cell aspect
Weight also depends on the cell. A glyph drawn at aspect 0.42 is stretched 1.6x sideways to fill the 0.68 cell, so its vertical strokes come out 1.6x too thick (小 田 急 look bold). A glyph drawn at 1.04 is squeezed, so its verticals come out thin (駅). Every kana/kanji must be laid out at `"aspect": 0.68` with `"w": 0.11`, edge to edge (the font now stretches at most 1.15x to fill the cell; a glyph with big margins stays small).
Specific fixes in round 2:
- ー: a horizontal bar about 0.8 of the cell width at mid height, one tape thick. 。: a small ring (outer ~0.3, one tape) at the lower left. Both keep their own size (they are not stretched).
- Small kana (ァィゥェォッャュョ and hiragana small forms) keep their own size: draw them about 0.65 of the cell, sitting on the baseline, at w 0.11. ォ is currently drawn full size: redraw it small.
- Arrows ← ↑ → ↓ ↖: shaft one tape (0.11), head a filled triangle with sharp corners, at aspect 0.68 (↖ too).
- マ: check against its photo; the current glyph reads wrong.

## Checking
1. `src/manual.py` IoU against a heavy photo will drop. That is expected. Judge the overlay for structure: stroke positions, bends, which corners are round or square.
2. Consistency with the rest of the font matters more. Build a test font with only your chars plus a few standard ones for comparison:
   `.venv/bin/python -I src/tape.py build/review/<group>.ttf "<your chars>口日東中南北線駅" --ja advance=680`
   `.venv/bin/python -I src/sample.py build/review/<group>.ttf build/review/<group>.png "<line1>|<line2>"`
   View the sample. Weights must match the standard glyphs.
3. `build/review/p0.png`, `p1.png`, `p2.png` show the current state of every glyph (photo trace above, font glyph below).

## Rules
- Overwrite only your characters' `glyphs/manual/<HEX>.json` (+ overlay png). If a char has no JSON yet, create it from the best trace in refs/traced/index.tsv.
- Keep your scratch files in your own subfolder of your scratch area. Do not edit src/ or refs/. Do not download anything.
- Update `"note"` to say what changed. Keep `"iou"` as the new checker value.
- Final report: per character one line (what you changed), and anything you could not resolve.
