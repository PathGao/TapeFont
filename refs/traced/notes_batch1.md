# Batch 1 tracing notes (a001-a008, a024-a028, a032, a033, a045)

55 SVGs written. Tags are `<img>_<run>`. A run is one trace.py call. Usually that is one text row. a028 is split into two runs because its cells are unequal (see below). Every `_row_<tag>.png` was checked by eye.

## Per image

| img | traced (tag: text) | skipped and why |
|---|---|---|
| a001 | a001_1: 左側通行 (red, `--ink 220,30,50 --tol 90`, given quad) | none. Strong perspective, so the horizontal measurements are foreshortened |
| a002 | a002_1: 左側通行 (dark). a002_2: ↓ (red on yellow). a002_3: ↑ (black on yellow, dark Otsu) | none |
| a003 | a003_1: 左側通行 (white tape on black, `light`) | none. Oblique shot, but the rectified result is clean |
| a004 | a004_1: 左側通行 (dark, heavy tape) | none. Seam gaps in 側's 貝 show as small holes. They are real tape seams |
| a005 | a005_1: _中央東口 (dark). a005_2: ↖ (red). a005_3: 東_ | the long ← in row 2 (aspect 1.8:1 would be squashed into a square cell). Row-2 口 is occluded by the person's arm/vest at its upper right. 口 a005_1_4 carries one tiny speck from the sign frame in its bottom-right corner |
| a006 | none (pen sketch, by instruction) | grid described below |
| a008 | none | same photo as a005 at lower resolution (1536 px wide vs 3335; mean abs pixel diff 2.5/255 after downscaling both) |
| a024 | a024_1: 中央東口. a024_2: ↖. a024_3: 東口 | the long ← (same reason as a005) |
| a025 | none | close-up of the lower half of 央, not a whole glyph. Used for the construction notes below |
| a026 | a026_1: 左側通行 (light) | none. Small chars (cell is about 300 px), clean |
| a027 | a027_1: 左側通行 (red, `--ink 210,40,60 --tol 90`) | none |
| a028 | a028_1: 通行. a028_2: 側 (single cell) | 左 is cut by the photo's left edge. 側 is about 300 px wide against 250 px for 通 and 行, so one equal-cell row would split 側. It got its own quad |
| a032 | a032_1: 中_東口. a032_2: ← (`--ink 190,30,40 --tol 120`). a032_3: 東口. a032_4: ← | 央 row 1: specular glare splits its middle. The first ← attempt at tol 90 was speckled, and tol 120 fixed it |
| a033 | a033_1: _宿駅 (light) | 新: the wrinkled banner breaks its left side into fragments. ← tile: wrinkle cracks run through the red |
| a045 | a045_1: 左側通行 (light, quad picked on a full-res crop) | none, but lowest confidence: strong foreshortening, glare, ragged edges on 左. Do not use it for width numbers |

Count by character: 左 7, 側 8, 通 8, 行 8, 東 6, 口 5, 中 3, 央 2, 宿 1, 駅 1, ↖ 2, ← 2, ↓ 1, ↑ 1.

## Note on the output geometry

trace.py maps every cell to a 512x512 square. Most of Sato's cells are taller than wide, so the SVGs are stretched horizontally. To restore the real proportions, scale x by the row aspect below. All ratios here are in original units (horizontal widths are multiplied by the aspect), measured with `.venv/bin/python -I` scripts on the cell PNGs.

## Measurements

### Cell aspect, original width/height per cell
- Fronto-parallel shots, so reliable: a005/a024 (same ↖中央東口 sign) 0.57-0.58. a002 0.79. a027 0.74. a028 0.65 (通行) and 0.78 (側). a033 0.82. a032 0.89-0.91. a026 1.11.
- Oblique shots, so unreliable: a001 0.59, a003 0.98, a004 0.58, a045 0.67.
- Glyphs are taller than square in 7 of 8 reliable signs (0.57-0.91). a026 is the only wide one.

### Tape (stroke) width / cell height
Measured as the most common ink run length, horizontal strokes (h) and vertical strokes (v).
- Thin signs: a001 0.08-0.10 h. a005 0.09 h / 0.08-0.10 v. a024 0.09 / 0.09. a027 0.09 / 0.09. Median 0.09.
- Heavy signs: a003 0.14 / 0.12. a004 0.13-0.14 / 0.12. a026 0.14 / 0.13-0.14. a028 0.14-0.15 / 0.14-0.15. a032 0.14-0.15 / 0.13-0.15. a033 宿 0.12 / 0.12. Median 0.137.
- a002 sits between the two groups: 0.113 / 0.108-0.114.
- On fronto-parallel shots h and v agree within about 10%, so each sign uses one stroke width.
- trace.py's `tape_width_ratio` column in index.tsv agrees: 0.09-0.11 thin, 0.12-0.15 heavy. Exceptions: about 0.23 for a004 側/行, where the 貝 block is solid, and 0.17 for a028 通 (same cause).
- a025 shows that one "stroke" can be two overlapping strips. The 冂 left stem is about 150 px with a seam at about 90 px. So stroke width is a design choice, not the width of one tape roll.

### Corners
- Outer corners of enclosures (口, 用 top, 貝 top, 日 in 東, 冂 in 央) are rounded. Radius / tape width, per corner, measured by inset along the diagonal:
  - 口 a024: 0.96-2.0 (median about 1.2).
  - 口 a032: 0.67-1.41 (median about 1.0).
  - a005 口 is drawn skewed, so it is excluded.
  - Rule: outer radius ≈ 1 tape width.
- Counter (hole) corners inside 口: 0.05-0.24 tape on a032 (almost square) and 0.44-1.1 on a024. So inner radius is about 0.2-0.6 tape, clearly smaller than outer.
- Joins between straight strokes (T and L joints, e.g. 工 in 左, 用 counters in 通, 亍 in 行) have square inside corners, radius 0.
- Free stroke ends are cut square. The exceptions are hooks. Hook bottoms (左's long stroke, 刂 in 側, 亍 in 行, 辶 bottom-left) have one rounded outer corner of about 1 tape radius.
- 東's 日 is a stadium: left and right ends rounded with radius ≈ half the box height (about 2 tape widths). Its two counters are pills with rounded outer ends.

### Diagonals
- Diagonals are single straight strips. Their perpendicular width equals the tape width: 0.087-0.092 on a024 (tape 0.09), 0.138-0.143 on a032 (tape 0.14). There is no stair-stepping.
- Angles from horizontal: 52-66 degrees. 央 a024 63/63. 東 a024 52/56. 東 a032 62-65.
- Leg ends at the baseline are cut along the cell edge, so the end cut is not perpendicular to the strip.
- 側's 貝 legs are not strips. The bottom of 貝 is a solid trapezoid with a triangular notch (an inverted V cut out).
- 通's マ is a horizontal bar plus one diagonal going down-left. In heavy signs this makes a filled triangle.
- 央 apex, from a025:
  - The two leg strips meet under a separate diamond patch with a sharp mitred peak.
  - The central stem flares into the legs with concave knife-cut fillets of radius about 0.7-1.0 tape width.
  - The crotch between the legs is a round arch of radius about 0.45 tape width.

### Gap between characters / cell width
- Taken as the longest empty column run near each cell boundary.
- 30 boundaries, nonzero range 0.008-0.137, median 0.059.
- Converted to tape widths (× aspect / tape): a005/a024 about 0.55, a002 about 0.5, a032 about 0.7, a026 about 1.0. So gap ≈ 0.5-1 tape width.
- 0.000 (projections overlap) at 通→行 in a001/a003/a045 and 側→通 in a003/a004. Part of this is perspective error, but 辶's base bar does run to the cell edge.

### How the characters are built (consistent across all 8 左側通行 signs)
- 左: top bar runs the full cell width. The ノ is replaced by a vertical with a rounded foot at the bottom left. 工 is two horizontals plus a vertical, with square joins.
- 側:
  - 亻 is a single vertical with no left-falling stroke.
  - 貝 is a tall box with rounded top corners (about 1 tape radius) and two small counters stacked in a center column. Its bottom is a solid notched trapezoid.
  - 刂 is a short vertical plus a long vertical with a rounded hook.
- 通:
  - 辶 is a short top tick, a vertical, and a full-width base bar with square ends.
  - マ is a bar plus a diagonal.
  - 用 is a box with rounded top corners and 4 square counters.
- 行: 彳 is two offset short verticals plus two short horizontals, with no diagonals. 亍 is two horizontals and a vertical with a rounded hook.
- 東: 一 runs the full width. 日 is the stadium above. The 木 legs are two diagonals from the stem foot. The stem runs top to bottom.
- 央: 冂 has rounded top corners. The bar runs full width. 人 is two diagonals under a mitred apex, with a round arch underneath (see a025).
- 中: 口 with rounded corners. The stem runs above and below the box.
- 口: rounded box, outer radius ≈ 1 tape, inner radius about 0.2-0.6 tape.

## a006 (pen sketch, not traced)
- Red grid: 4 vertical lines and 6 horizontal lines inside a hand-drawn frame. The lines run past the glyph area.
- Hatch marks of 2-4 short slashes (`//`, `///`, `////`) cross the line ends outside the grid:
  - Every horizontal line has `////` at its left end. Some right ends have `///`.
  - The vertical lines carry `//` to `////` above, between and below the bands.
  - This reads as labelling equal spacings (same slash count = same distance), like engineering dimension ticks. That is an interpretation. Nothing in the sketch states it.
- Black outline, top to bottom:
  1. A long top bar on the first horizontal line, overhanging past the left grid line. Short verticals drop from it at the outer two grid lines.
  2. In the band between horizontals 2 and 3, a wide box spanning grid lines 1-4, divided at grid lines 2 and 3 into 3 compartments.
  3. From horizontal 4, a wide open box spans lines 1-4 and its sides drop to horizontal 5.
  4. Inside it, a hook falls from grid line 2 and curves down-left to horizontal 6. A second stroke starts near line 2 at horizontal 5, runs right to line 3, then turns down and curves left to horizontal 6. A red circle sits between the two hooks, maybe marking a joint or a point to check.
- So the construction is band-based: horizontals alternate stroke band / gap band, and verticals sit on 4 grid columns.
- The black topology does not match a standard 東 (no 木 legs, a 3-compartment box instead of 日). The manifest's "東" label is unverified.
