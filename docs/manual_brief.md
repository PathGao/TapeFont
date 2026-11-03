# Hand-building tape glyphs from photo traces

Goal: for each assigned character, build a clean 修悦体 glyph out of tape strips that matches Sato Shuetsu's real sign as closely as possible. These become the font's glyphs for these characters and the reference for how Sato builds each radical.

## Inputs
- `refs/traced/index.tsv`: `file  char  ratio`. Several traces per char may exist. Tags with `_x_` are unconfirmed signs: use only if no confirmed trace exists.
- `refs/traced/<file>.png`: binarized trace, 512x512, black ink. It is the glyph's cell stretched to a square.
- `refs/traced/notes_batch*.md`: per-tag true cell width/height ratio (`aspect`) and style notes. Read the notes for your tags.
- `docs/book_method.md`: Sato's method. Summary: he lays equally spaced straight strips on a grid, then cuts away waste. One tape width per sign (~0.09–0.14 of cell height). Strokes are horizontal/vertical; real diagonals are single straight strips with ends cut flush to a horizontal/vertical edge. Outer bends are rounded (~1 tape width); stroke ends are cut square; T-joints and crossings are square. Curves never exist: kana curves are straight strips joined by rounded bends. Dots are discs or short bars.

## Tool
`.venv/bin/python -I src/manual.py glyphs/manual/<HEX>.json [overlay.png]` (read its docstring for the JSON format).
It prints IoU against the trace named in `src` and writes an overlay: black = both, blue = only in photo (we are missing ink), red = only in ours (we have extra ink).
File name: uppercase hex codepoint, e.g. 口 → `glyphs/manual/53E3.json`. Overlay PNGs go next to it (`53E3.png`).

## How to work, per character
1. Look at the candidate traces (view the PNGs) and pick the cleanest confirmed one. Put it in `src`, its true `aspect` in `aspect` (from the notes; if not listed, estimate from the photo or use 0.7), and measure tape width `w` (fraction of cell height).
2. Write strips as centerlines in the true-aspect frame: x in [0, aspect], y in [0, 1], y down. Keep coordinates on a small set of shared levels (Sato's strips line up), round to 3 decimals. Use `polys` for wedges/discs/triangle tips and `cuts` for slits and notches.
3. Run the checker and view the overlay. Fix blue and red areas that come from construction (missing strip, wrong level, wrong corner). Do not chase noise from photo blur, glare, perspective or tape texture: clean geometry beats a higher IoU. Typical good result: IoU ≥ 0.85.
4. Add `"iou"` and a one-line `"note"` (what was hard, or what you guessed) to the JSON.

## Also record radicals
While building, append to `glyphs/components/<your group>.md` how Sato builds each radical/component you met (口 日 氵 亻 辶 糸 言 木 女 扌 刂 艹 宀 貝 etc., and kana strokes): strip layout in words plus normalized coordinates, and which characters show it. These rules will be used to generate characters that have no photo.

## Rules
- Only write your own characters' files and your own components file. Other agents work in parallel.
- Do not edit src/ or refs/. Do not download anything.
- Final report: per character IoU (one line), characters you could not do and why, and the most useful radical rules you found.
