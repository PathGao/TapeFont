# Photo trace notes

These are measurements of the photos: Sato's tape weight and cell shape vary from sign to sign (tape 0.05–0.3 of cell height, cells 0.42–1.3 wide). They are not the font standard. Every glyph in the font uses tape 0.11 (0.09 for dense kanji) and cell aspect 0.68; see docs/building_glyphs.md.

Per photo: true cell aspect (width/height), tape weight and style notes, recorded while tracing. Trace files are `<char>_<tag>_<i>.svg/.png`; `index.tsv` lists file, char, tape ratio. Tags with `_x_` are unconfirmed signs.

## Batch 1 tracing notes (a001-a008, a024-a028, a032, a033, a045)

55 SVGs written. Tags are `<img>_<run>`. A run is one trace.py call. Usually that is one text row. a028 is split into two runs because its cells are unequal (see below). Every `_row_<tag>.png` was checked by eye.

### Per image

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

### Note on the output geometry

trace.py maps every cell to a 512x512 square. Most of Sato's cells are taller than wide, so the SVGs are stretched horizontally. To restore the real proportions, scale x by the row aspect below. All ratios here are in original units (horizontal widths are multiplied by the aspect), measured with `.venv/bin/python -I` scripts on the cell PNGs.

### Measurements

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

### a006 (pen sketch, not traced)
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

## Batch 2 tracing notes (a011–a041 subset)

98 SVGs from 11 images. Tags are `<img>_<row>` plus a letter when a row was split into per-glyph runs
(perspective rows, or uneven spacing). One file is a dotfile: `._a012_4a_0.svg` (the full stop).

### Conventions used

- Normal glyphs: quad = the glyph's cell (its own pitch slot × row height), so trace.py stretches
  portrait cells to square. Undo with the cell aspect listed per image below.
- Small/narrow marks (ー 一 、 。 . ! の and arrows in a016/a040/a041/a038 ー/a031 ー):
  square cell of row height, centered on the glyph, neighbours masked out in a scratch copy.
  These keep their true proportion and vertical position in the row.
- Perspective rows (a017, a022, a031, a034) were split per glyph along the row's top/bottom edges
  (a022 via the row homography so foreshortening is handled).
- a034 rows 1/3 were binarized from derived channels (R−max(0,B−R), R−B) in scratch to kill blue
  glare; row 2 from a redness channel. The SVGs only depend on the mask, not on the source colours.

### Per image

| img | traced | skipped and why |
|---|---|---|
| a011 | – | Same Suntory billboard as a034 at 1/3 the resolution. |
| a012 | 1 0 . ブ ン ー ! 東口 広場 JR 新 宿 東 口 | ナイキ row cropped at top edge; 4 cropped at left; オ cropped; 新/宿 headline is multi‑colour and 宿 is under the swoosh; ルミネエスト ~35 px; JR新宿駅 cropped. JR新宿東口 row is only 84 px tall, still clean (digital art). |
| a014 | – | Glyphs ~40 px, tape ~5 px. |
| a015 | – | Glyphs ~25 px. |
| a016 | 化 粧 室, ← → (black) | JR logo is the corporate logo, not tape lettering. 北口改札 oblique and 札 cut by the frame. Red ← on an oblique panel. |
| a017 | 山 手 線 | トイレ staggered + perspective. 京浜東北線 cut at left/bottom. |
| a018 | – | Vertical text, ~55 px, blurry, 駅前 cut at left. |
| a019 | – | 40–45 px and motion/focus blur. |
| a022 | 南 口 北 口 → | Oblique; rectified per glyph. Clean frontal version of the same text is a041 (different sign: white on black here, black on white there). |
| a023 | – | Same sign as a040, oblique. a040 is frontal. |
| a029 | 用 | 路: visible piece (three 口‑boxes + a diagonal) does not read as 路 with confidence; left unlabelled rather than risk wrong ground truth. |
| a031 | 小 田 線 ホ ー(×3) ム ↑ | 急: two screw heads cover the 心 dot. 直通: interlocked (辶 runs under 直) and the glass rail touches the bottom. エスカレタ: glass rail crosses the bottoms. |
| a034 | row1 今 日 も 日 、 一 ス ト ロ さ ま 。; row2 イ ッ タ ー で お 疲 れ 様 募 集 中; row3 # お ス ト ゼ ロ さ ま; サ ン ト リ ー | row1 お/ゼ: glare noise. row2 ツ エ ピ ソ: top halves of the tape are faded pink and binarize incomplete; ード merged with ー. row3 選 権: detail lost at this size. |
| a037 | 日 | 暮 里 and the lower panels: blurred, ≤60 px. |
| a038 | 小 田 急 線 ホ ー ム | – (best source: frontal, 560 px rows). |
| a039 | – | Observation only, see layering. |
| a040 | 京 王 井 の 頭 線 → | – |
| a041 | 南 口 北 口 → | Tape is translucent where it is lighter at the top; used colour distance (ink 33,38,38, tol 150) instead of Otsu. |

### Style measurements

Tape width is measured as the mode of horizontal‑stroke thickness (vertical run lengths), which the
horizontal cell stretch does not distort. Frontal images were also measured in original pixels.

### Tape width

| source | tape px | cell h px | tape / cell h | cell pitch px | tape / cell pitch |
|---|---|---|---|---|---|
| a041 (frontal) | 51 | 347 | 0.147 | 251 | 0.20 |
| a040 (frontal) | 38–39 | 284 | 0.137 | 192 | 0.20 |
| a038 (frontal) | 55 | 567 | 0.097 | 237 | 0.23 |
| a034 row1 white | ~43 | ~430 | 0.100 | 203 | 0.21 |
| a034 kana rows (median) | – | – | 0.12 | – | – |
| a031 | ~35 | ~280 | 0.125 | ~150 | 0.23 |
| a016 | ~14 | 106 | 0.131 | 112 | 0.125 |
| a012 digits 1/0 | 47–50 | 271 | 0.18 | 196 | 0.24 |
| a012 JR row | ~9 | 84 | 0.11 | ~84 | 0.11 |
| a029 用 | ~89 | 1312 | 0.068 | – | – |

- Tape/cell height ranges 0.07–0.18 (median of traced glyphs 0.125).
- Tape/cell pitch is steadier, 0.20–0.24, on every portrait‑cell sign. Sato seems to fix the tape
  width against the cell width, and the cell height floats with the sign's aspect.
- Wide strokes are built from several parallel strips. Faint seams run along the strokes in a031, a038 and a039.
  The measured "tape" is the stroke width, not the roll width.

### Corners (frontal, original pixels, r from the diagonal gap at the bbox corner)

| glyph | tape | outer r | outer r / tape | inner r | inner r / tape |
|---|---|---|---|---|---|
| a041 口 | 51 | 55–68 | 1.1–1.3 | 14–24 | 0.3–0.45 |
| a041 口 (2nd) | 50 | 51–61 | 1.0–1.2 | 14–17 | 0.3 |
| a038 田 | 55 | 51–65 | 0.9–1.2 | 3–17 | 0.05–0.3 |
| a040 京 (top) | 38 | 41 | 1.05 | 7–10 | 0.2–0.25 |
| a012 0 (digital) | 48 | 38 | 0.8 | 14–17 | 0.3 |

- Outer corner radius ≈ 1.0 × tape width (0.8–1.3).
- Inner corners are square or nearly so. The 7–10 px floor comes from the 5×5 blur plus the 3×3 opening, so a measured
  inner r ≤ 0.3 tape means square. The bend is a quarter‑disc of radius = tape about the inner corner.
- Only bends that turn the outline get rounded (box corners, J‑hooks, L‑feet). T‑joints and crossings
  stay square. Stroke ends are cut square (or along the cell edge for diagonals).

### Diagonals, curves, dots, hooks

- Diagonal strokes take three forms:
  1. A full‑width strip at an angle with its ends cut horizontal/vertical flush to the cell edges (ス, 急's top tick, 京's feet, れ).
  2. A long thin triangle tapering from 0 to about 1 tape (ホ's legs in a031/a038, 、 in a034, and the arrowheads).
  3. A cross of two strips (線's 氺 part, 粧's 米).
- Kana curves are never drawn as arcs. Each one is a polyline of straight strips with rounded outer corners only (さ ま お も で の).
  の is a rounded rectangle with a narrow slit, about 0.6 cell high, sitting on the baseline. ロ, 口 and 0 are rounded rectangles.
- Dots: お's dot and 心's dot (急, a038) are discs about 0.7–1.0 tape across. Dakuten are two discs (ゼ in a034, ド).
  In a012 ブ the dakuten is a disc cut out of the end of the top bar.
  南's 丷 is two small triangles cut out of a solid block (a041, a022). The 。 is a small rounded‑rect "o" (a034).
- Hooks (小's middle stroke, 手, リ, ン, ブ, J) are an L‑bend with outer r ≈ tape and a square inner corner.
  ム's foot overshoots the baseline by about 0.04 of cell height (a038).

### Spacing and cell shape

| source | gap px | gap / pitch | cell w/h (original) |
|---|---|---|---|
| a041 | 7–21 (mean 14) | 0.055 | 0.72 |
| a040 | 14–15 | 0.075 | 0.68 single; 0.85–0.89 for 頭 線 |
| a038 | 6–32 (mean 19) | 0.08 | 0.42 single; 0.60 for 線 |
| a034 row1 | 18–32 (mean 26) | 0.13 | 0.47 |
| a034 row2/3 (rectified) | – | ~0.06 | ~0.45–0.5 |
| a031 | 0–10 | ~0.03 | ~0.5 single; 0.85 for 線 |
| a016 | 9–11 | 0.09 | 1.05 |
| a012 JR row | 4 | 0.05 | 0.73–0.98 (proportional) |

- Cells are mostly portrait (w/h 0.4–0.75) and only a016 is square. Sato fills whatever band the sign gives him.
- Two‑part kanji (線 頭 疲) get cells about 1.3–1.5× wider than single‑part ones in the same row.
- Small kana (の) and punctuation keep their own small size inside the row height.
- Gaps between characters are 0.03–0.13 of the pitch, typically 0.06–0.08. They shrink to almost 0 where strokes
  interlock (a031 直通, a034 集中).

### Latin letters and digits

- Digits (a012) are drawn the same way as the kanji. 0 is a rounded rectangle (outer r 0.8 tape, inner 0.3).
  1 is a vertical with a short flag and a full‑width base slab. Cells are 0.59 (1) and 0.71 (0) of the height. "." is a disc of 1.1 tape.
- J/R (a012) use half‑width cells of 0.45 w/h. J is a vertical with a rounded bend into a foot. R is a rounded bowl plus a straight diagonal leg.
- # (a034) is two slanted parallelograms plus two horizontal bars.
- 北 is built as "l t"‑like halves in both a022 and a041. 口 is identical to 0.

### Tape layering (a039, plus seams in a031/a038)

- Horizontal bars are laid first. The vertical strip at a box edge is laid over the bar ends, and the seam is a straight
  vertical line.
- The rounded outer corner is a separately cut piece over the joint.
- Parallel bars (急's 彐) are separated by slits about 0.1 tape wide. The slit ends are rounded where they meet the vertical.
- A diagonal tick laid over a bar has its end cut straight along the bar's edge, not mitred.
- Wide strokes show horizontal seams roughly every 1/2–1/3 of the stroke width, so they are built from 2–3 parallel strips.
- a012 (artwork) colours each tape piece of 新 differently (pink, brown, grey, red), which shows the piece decomposition directly.

## Batch 3 tracing notes

Images: a007 a013 a021 a030 a035 a036 a042 a043 a044 a046-a052.
Output: 92 SVGs (36 confirmed Sato, 56 `x_` unconfirmed). H below = cell height in the original photo.
Measurements come from each quad re-warped at its true aspect ratio (no square stretch). The script is
in the session scratchpad, not in the repo.

### Caveat for the generator: most cells are not square

trace.py maps every cell to a square. Measured cell W/H in the originals:

| source | W/H |
|---|---|
| a030 seal 修悦 | 0.95-1.00 |
| a042 bag 修悦体 | 0.93 |
| a043 夢 | 0.77 |
| a021 book cover title | 0.60 |
| a013 inset kana ナイキ | 0.61 |
| a035 banner kana | 0.50-0.52 |
| a036 Latin letters | 0.39-0.40 |
| x_a046 大月/河口湖/方面 | 0.68-0.71 |
| x_a047 / x_a048 | 0.66 / 0.69 |
| x_a050 TEKKEN / 東口ヤード | 0.59 / 0.68 |
| x_a051 路上喫煙禁止 | 0.74 |
| x_a052 関係者以外 / 立入禁止 | 0.74 / 0.77 |

So in these SVGs, vertical strokes are widened by 1/(W/H), which is 1.3x to 2.6x. The `tape_width_ratio`
column in index.tsv is biased upward for these rows, most of all for single narrow cells such as
x_a050_4 T (0.199) and a036 N/W (0.24). Use the true-aspect numbers below instead.

### Per image

- **a007** (white tape on black, "BLUE BOX"?): skipped. The letters are interlocked and share strokes
  across both lines, and the reading is unclear. The only free letter is an "O"-like shape (x 1052-2020,
  y 1340-2130), but its counter is mostly covered by a white patch that leaves two slits, so it may be
  θ or e. Measured anyway: tape 255 px / letter height 790 = 0.32H. Outer corner radius about 200 px =
  0.8 tape. Slit corners about 30 px.
- **a013** (digitized 新宿 + ナイキ logo): traced ナ, イ, キ as single cells (a013_1..3). Skipped 新 and
  宿 because the logo changes them: ナイキ sits inside 新's 斤, and the Nike swoosh replaces 宿's inner
  part. The kana are a small inset column (cell 106x178 px), so their tape/H = 0.173 is relative to
  that small cell.
- **a021** (book cover): traced the positive glyphs ム ー で 文 字 を 書 こ う (a021_1..9). Skipped ガ, テ,
  プ. They are knockouts: a colored block with the glyph cut out in white, and ガ's dakuten is colored
  inside the white カ. They cannot be binarized as one ink. を is transcribed as を per the manifest, but
  the glyph looks close to き.
- **a030** (修悦 seal): traced 修 and 悦 as single cells (a030_1, a030_2). Both are clean.
- **a035** (black banner, white tape, curved): traced ッ ニ ュ ス 2 4 per character with per-character
  bounds (the baseline curves from y 733 to 703). Skipped ロ and ケ because they interlock and their
  bounding boxes overlap. Skipped ト because its slanted stem overlaps ッ's hook. Skipped ー because
  ュ's foot shares its x range.
- **a036** (red banner, multicolor letters): traced R O C K E T N E W S 2 4 as single cells, each with
  its own color (a036_1..12). W is black on red. tol 70 left speckle, so it was re-run with tol 110.
  Small caps are 127 px tall and sit at the bottom of the 165 px cap-height cell.
- **a042** (修悦体 on a paper bag, green + blue tape on kraft): the bag is bent, so the quad is a
  parallelogram (rotated about 11 deg, verticals lean 0.36). Traced through a median-7 filtered copy in
  scratch, because the tape has white pinhole texture, with ink = midpoint of green/blue (1,128,160),
  tol 120. 修's 攵 is an X, the same as in a030.
- **a043** (夢, red tape on a white disc): one cell, ink 216,35,45, tol 60. The blue dot and blue
  squares are decorations and are excluded.
- **a044**: skipped. Green tape on blue stripes gives low contrast, the image is tilted, and the glyph is
  pictorial. Its structure (艹, rounded slit band, 夕 with a dot) matches a043, so it is probably 夢, not
  富.
- **x_a046** (→ 9.10 sign): traced 大 月 府 松 本 / 河 口 湖 / 方 面. The "." dots between 月|甲 and
  府|松 sit in the gaps and touch both cells. To avoid them, 甲 is skipped and the row is split into runs
  (x_a046_1, _4, _5). Skipped 9.10 (black frame with the digits left as negative space) and the
  escalator pictogram.
- **x_a047**: 寄り掛からな, one run, clean except for tape-overlap seams.
- **x_a048**: いで下さい, one run. ! is skipped (narrow, and partly red).
- **x_a049** (KEEP SHINJUKU BEAUTIFUL): only K E E traced. P has a decorative sticker dot inside its
  cell. SHINJUKU is skipped (red, small, very oblique). BEAUTIFUL is skipped (oblique, variable widths,
  stickers overlap letters). Strokes measured here are unreliable (perspective): v 0.063H vs h 0.123H.
- **x_a050**: TEKKEN, TAISEI, 東口ヤード. The rows touch each other (gap of 1-3 px). T and ド were
  re-traced alone (x_a050_4, x_a050_5) to drop pieces of the neighbouring rows. The `_row_x_a050_2/3`
  previews still show the old T/ド cells.
- **x_a051**: 路上喫煙禁止, perspective quad (left side 97 px tall, right 82 px). Skipped NO!ポイ捨て
  (second sign, about 60 deg oblique, cells about 25 px wide).
- **x_a052**: 関係者以外 (dark) and 立入禁止 (ink 149,63,65, tol 70). Low resolution: H is 68 px.

### Style measurements (true aspect)

Tape width / H (ridge median, then v and h run-length mode):

| row | tape/H | vertical | horizontal |
|---|---|---|---|
| a030 修 / 悦 | 0.124 / 0.118 | 0.122 / 0.118 | 0.126 / 0.121 |
| a021 字 書 こ う | 0.101-0.111 | 0.103-0.137 | 0.101-0.111 |
| a035 ス 2 | 0.112 / 0.107 | 0.123 / 0.110 | 0.113 / 0.100 |
| a036 E T | 0.087 / 0.093 | 0.097 / 0.093 | 0.090 / 0.087 |
| a042 修悦体 | 0.088 | 0.093 | 0.087 |
| a043 夢 | 0.073 | 0.073 | 0.077 |
| x_a046 | 0.093-0.100 | 0.097-0.100 | 0.097-0.100 |
| x_a047 / x_a048 | 0.093 / 0.100 | 0.097 / 0.100 | 0.093 / 0.093 |
| x_a050 | 0.107-0.120 | 0.110-0.117 | 0.113-0.120 |
| x_a051 | 0.083 | 0.080 | 0.083 |
| x_a052 | 0.113-0.120 | 0.113-0.120 | 0.113-0.120 |

- Confirmed range is 0.073-0.124, median about 0.10. The x_ range is 0.083-0.120, median about 0.10.
  Vertical and horizontal tape are the same width within 10% in every clean row. Tape width is
  constant, and the cell narrows instead of the strokes.
- **Stroke count fits about 9-10 tape widths per H.** a030 修 has 3 stacked bars plus gaps in its lower
  half. 悦 has 4 parallel verticals. Gaps between parallel strokes are about 0.5-1.0 tape (a030 悦's
  verticals: 80-88 px tape with 8-10 px gaps, so 0.1 tape, almost touching).
- **Outer corners at bends** (り ら か こ う 口 さ, 悦's 兑, 2): rounded, radius 0.08-0.13H, which is
  1.0-1.3 tape widths. Examples: x_a046 口 0.08-0.10H, a021 う 0.10H, a021 こ 0.08H, x_a047 ら 0.10-0.13H.
  a007's heavy O is 0.8 tape.
- **Inner corners**: sharp to 0.3 tape (radius 0.00-0.03H). Stroke-to-stroke joins (T and + junctions)
  are square. a030 is all square-corner rectangles except the 兑 loop and the 亻 notch.
- **Loops** (悦 兑 in a030 and a042, な, 夢's 罒 band): a closed stadium or rounded rectangle. The outer
  radius is about 1 tape, and the hole is a thin slot with rounded ends. 夢's 罒 is reduced to one
  rounded band with a slit.
- **Diagonals**: same width as the tape. Ends are cut flush with horizontal or vertical lines (大 and 本
  legs end flat on the baseline, ヤ, 修's X clipped to the cell). 修's 攵 is an X in both a030 and a042.
  氵 is two short horizontal bars (0.15-0.18H long) plus a diagonal wedge at the bottom (河 湖).
- **Kana curves**: there is no true curve. A curve is a straight run plus one rounded outer corner of
  radius about 1 tape. さ (x_a048): bar, then a diagonal, then a rounded L at the bottom. ら: tab, then
  a C made of 3 straight pieces with 2 rounded outer corners. な (x_a047): cross, then a rounded-square
  loop crossed by a diagonal tail. い: two verticals, with the left one's foot cut diagonally. お and ま
  are not in this batch.
- **Dots**: dakuten and punctuation are filled circles 0.07-0.10H across (0.7-1.0 tape): x_a048 で,
  x_a050 ド, a021 で and ガ, x_a046 ".". Exceptions: the 丷 of 悦 is two squares of about 1 tape in a030
  and short diagonal tape pieces in a042.
- **Latin and digits**: condensed. The cell is the same height as kana, and W/H is 0.39-0.55 (a036
  0.39-0.40, x_a050 TEKKEN 0.55-0.59, a035 digits 0.51). a036 uses small caps (lowercase forms at 0.77
  of cap height). Bowls and curves (O C S 2 R) are rectangles with outer radius about 1 tape and
  rectangular counters. K, N and 4 use straight diagonals. I is a single bar. TEKKEN/TAISEI (x) looks
  like a plain condensed sans with mostly square corners and is the least tape-specific.
- **Gap between characters (along the row)**: confirmed a021 0.048H (16-19 px / 356), a030 0.035H
  (vertical gap), a035/a036 0.03-0.09H. x_ signs: 0.06-0.08H (x_a047 13 px / 164, x_a046 6 / 96,
  x_a052 3-6 / 68), x_a050 東口ヤード 0.12H.

### Are the x_ signs consistent with confirmed Sato work?

Yes, on every measured property:
- Tape/H is 0.083-0.120, against 0.073-0.124 for confirmed work.
- Outer corners at bends are about 1 tape and inner corners are sharp.
- Diagonal ends are flush, and dakuten are circles.
- 氵 is built as bars plus a wedge.
- The tall cells (0.66-0.77) match the confirmed book cover (0.60) and 夢 (0.77). Only the a030/a042
  showpieces are square.

x_a047, x_a048 and x_a050 show visible overlap seams and patch pieces, the same as the hand-applied
confirmed pieces (a042, a030). None of this proves who made them. It only finds no stylistic outlier.
The Latin on x_a050 is the weakest match: square corners, close to a stock condensed sans.

## Batch 4 tracing notes (refs/photos_b b001–b053)

220 SVGs from 27 images. Tags are `<img>_<row><letter>`: one letter per glyph, and each glyph is its own single-cell run.
b017 uses `<row><column a–k>`, so the letter is the chart column. `b017_r1..r5` are the red hiragana column.

### How cells were made

- Most rows: one cell per glyph. The cell is centred on the glyph's bbox centre and is one pitch wide (pitch = median centre spacing, or set by hand where spacing was uneven). Its height is the row frame.
  w/h below is pitch / row height in the photo, so divide x by it to undo the square stretch. b047 alone was checked against an even grid (it matches to ±3 px).
- Neighbours were blanked outside the glyph's x-range (±2 px) in scratch copies, so a cell has no slivers from adjacent glyphs.
  b006 `・` and `4` overlap in x, so they were separated with 2-D masks.
- Derived channels in scratch (the SVG depends only on the mask):
  - redness r−max(g,b): b024, b025 ようこそ, b011, b013 red row. The tops of the red pieces are faded pink and Otsu breaks them.
  - blueness: b013 羽田空港.
  - max(r,g,b): b006 (removes the blue frame) and b015 row 2 (blue plus coloured discs on black).
  - distance from each band's background colour: b016 (multicolour glyphs).
  - red-or-black mask: b041.
- Arrows and `・` use a square cell of row height. Exception: b042 `←` sits in its own row above トイレ and is longer than tall, so its cell is a square of the arrow's length (402 px) on a padded copy.
- Small kana (b053 の へ) keep the normal pitch × row-height cell, so their size survives.

### True cell w/h per tag

| tag | w/h | note |
|---|---|---|
| b017_1a–k | ン1.56 ワ1.55 ラ1.53 ヤ1.52 マ1.50 ハ1.49 ナ1.47 タ1.46 サ1.44 カ1.43 ア1.42 | landscape cells |
| b017_2c–k | リ1.50 ユ1.49 ミ1.48 ヒ1.46 ニ1.45 チ1.44 シ1.42 キ1.41 イ1.40 | |
| b017_3c–k | ル1.51 ヨ1.50 ム1.49 フ1.48 ヌ1.47 ツ1.47 ス1.46 ク1.45 ウ1.44 | |
| b017_4c–k | レ1.51 メ1.47 ヘ1.46 ネ1.44 テ1.42 セ1.41 ケ1.39 エ1.37 | |
| b017_5b–k | ヲ1.40 ロ1.38 モ1.33 ホ1.31 ノ1.28 ト1.26 ソ1.24 コ1.22 オ1.20 | photo-plane values. The left→right and top→bottom drift is perspective. The sign-plane value is ≈1.45 everywhere. |
| b017_r1–r5 | し1.16 ゆ1.22 う1.16 え1.09 つ1.14 | single column, width = glyph bbox + 5 px, so the true width is unknown. Sheared parallelogram quads (dx/dy −0.127). |
| b039_1a–c | 0.50 | 1d → 1.00 |
| b042_2a–c | 0.50 | 1 ← square of arrow length |
| b047_1a–k | 0.62 | |
| b010_1a–e / 2a–e,h,i / 3a–e / 4a–c | 0.99 / 0.97 / 0.91 / 0.93 | |
| b004_1a–d / 2a–e / 3b–e | 1.10 / 1.26 / 1.28 | |
| b053_2a–g | 0.82 | 2f ー square 1.00 |
| b053_1a,b,d | 1.72 (H 57 px) | 1c の, 1e へ: 1.72 of a 52 px frame (top 258, bottom 310 instead of 255/312) to drop a panel-edge sliver |
| b025_1a–d / 2a–c | 0.49 / 0.61 | |
| b024_1a–c | 0.83 | |
| b027_2a,b | 1.13 | |
| b015_1a–c / 2a–c | 1.00 / 0.77 | one glyph per panel, cell = glyph bbox ± 5 px |
| b016_1 / 2 / 3 / 4 / 5 / 6 (a,b) | 0.98 / 1.05 / 1.06 / 1.06 / 1.01 / 1.13 | |
| b007_1 / 2 / 3 / 4 / 5 / 6 | 1.25 / 1.08 / 0.98 / 0.93 / 0.95 / 0.95 | |
| b006_1a–c | 0.99 | 1d → square. Keystoned sign, row quad follows the frame |
| b006_2a,c | 0.80 | 2b ・ square |
| b048_2a–h | 0.76 | |
| b013_1 / 2 / 3 | 1.12 / 1.04 / 1.12 | |
| b041_1a,1b,2a,2b,2c | 0.82, 0.81, 0.82, 0.88, 1.01 | strong perspective. Per-glyph quads with the row's top/bottom slopes, cell = glyph bbox + 6 px, not a pitch slot |
| b050_1 / b020_1 | 0.81 / 0.85 | |
| b035_1 / b005_1 | 0.43 / 0.52 | b005 1c ・ square |
| b040_1 | 1.00 | |
| b011_1 / b011_2 | 0.66 / 0.48 | 1c ↑, 2c → square |

### Per image

| img | traced | skipped and why |
|---|---|---|
| b001 b002 | – | 修悦体 being made, strongly oblique. Same word traced from b025. |
| b003 | – | 谷中/日暮里駅 ≤120 px and all already have 3–7 traces. |
| b004 | 日暮里駅 どりの窓口 ぷうりば | み and き are behind the man. っ's top bar runs into his motion blur, so its left end is unknown. JR is the corporate logo. |
| b005 | 1 1 ・ 1 2 | The small panels repeat b007 at lower resolution. |
| b006 | 常磐線 → 3 ・ 4 | – |
| b007 | 山手 上野品川 池袋新宿 京浜東北 東京川崎 赤羽大宮 | The boxed digits are white-on-colour inverse panels. |
| b008 b034 b044 b045 | – | 中央東口/東口 already have 4–25 traces each. |
| b009 | – | poor |
| b010 | やさしさが 走るこの街 道路 蒲田警察署 通安全 | Row 2's second こ and の are behind the girl. 蒲(2) 田 交 会 occluded. 協 merges with a bike handle. |
| b011 | 京成↑ 京成→ | 1・2 is cut by the frame. ✈ is a pictogram. |
| b012 | – | lower-res duplicate of b013 |
| b013 | 京急蒲田駅 羽田空港 蒲田駅 | JR logo. 京急 at the right is cut. |
| b014 | – | Each glyph is on its own tilted tile and the kana are ~30 px. |
| b015 | 富山県 美術館 | – |
| b016 | 江戸 明治 大正 昭和 平成 令和 | – |
| b017 | all 46 katakana, しゆうえつ (red) | 佐藤修悦 below is cut by the frame. |
| b018 b019 | – | same chart, more oblique and lower res |
| b020 | 現在地 | – |
| b021–b023 | – | construction stages, see below |
| b024 | 未完成 | The path arrow leaves the frame. |
| b025 | ようこそ 修悦体 | 未完成 is traced from b024. The ⤴ path arrow is not a character. |
| b026 b027 | 円寺 (b027) | あ and う are cut. り touches あ. が's dakuten sits over と's bowl, so the two cannot be split by x. 高 is cut at the left. b026 is the oblique full view. |
| b028–b033 b036 | – | close-ups, see below |
| b035 | 1 1 | – |
| b037 b043 b049 | – | Every character already has ≥2 traces. b043 also merges with the black border. |
| b038 | – | duplicate of b006. 松戸・柏・水戸 is a printed sticker, not tape. |
| b039 b042 | トイレ→, トイレ ← | – |
| b040 | 階段 | The C-loop arrow is not a character. |
| b041 | 通路 気をつ | が is too oblique to rectify cleanly. 狭 and け touch the right edge. |
| b046 | – | same text as b047, smaller |
| b047 | 寄りかからないで下さい | – |
| b048 | 自転車通れません | 歩行者通路 is blurred and 歩/行 merge. |
| b050 | 現在地 | – |
| b051 b052 | – | 北 is cut. b052 is oblique and covered by a pole. |
| b053 | 世界の空へ 東京モノレール | – |

### Measurements

Tape is measured as the mode of vertical run length in the traced cells, so the horizontal stretch does not affect it.
tape/pitch = (tape/H) / (w/h).

| source | tape/H | tape/pitch |
|---|---|---|
| b017 chart | 0.28–0.32 | 0.20 |
| b039/b042 トイレ | 0.23–0.26 | 0.46–0.52 |
| b047 | 0.105 | 0.17 |
| b053 東京モノレール | 0.176 | 0.21 |
| b007 black rows | 0.15–0.16 | 0.15–0.16 |
| b005 / b006 digits | 0.16 | 0.30 / 0.20 |
| b015, b016 | 0.11–0.14 | 0.11–0.14 |
| b010 | 0.08–0.10 | 0.09–0.10 |
| b048 | 0.090 | 0.12 |
| b013 red row | 0.068 | 0.06 |
| b025 修悦体 | 0.055 | 0.09 |

- tape/pitch is 0.20 on the chart and b053, the same as batch 2. Thin-stroke signs (b010, b013, b025, b048) run at 0.06–0.12, and the bold kana of トイレ at ~0.5. So a fixed tape/pitch holds only within one sign family.
- Chart cells (b017) are landscape. The glyph bbox is w/h ≈ 1.2–1.3 and the pitch ≈ 1.45 H. Gaps are ≈0.2 H horizontally and ≈0.25 H between rows. The board has a ruled grid of white lines, one per row.

### New style facts

- ヲ (chart) is three bars plus the right vertical, like ヨ. The difference is that ヲ's bottom-right corner is cut diagonally and the bar ends are slanted, while ヨ has a rounded top-right corner and square ends.
- The chart mixes tape stocks. ム フ ヌ メ ヘ ネ ホ, and parts of ミ ヒ, are a lighter translucent grey (gray ≈137 against ≈40 for black).
- Every 丶 can be a separate coloured disc of ≈1.3 tape: b015 美's two dots, 術's dot and 館's three dots, in white, red, yellow, purple, pink and green.
  - b016 colours glyphs by component: 明 has a white 日 and a red 月, and 治 is pink and white.
  - 戸's dot is a red disc that overshoots the band top by 0.12 H.
  - b006 ・ is a square. b005 ・ is a round disc. Both sit at mid-height.
- Curves do occur. b005's 2 has a smooth S-curve neck.
  - b036 (stroke 400–465 px): the outer corner is r ≈ 1.0 tape, as in batch 2. The inner corner, unlike batch 2, has a concave fillet of r ≈ 0.4 tape cut as a separate piece. The corner block is its own piece, bounded by a vertical seam through the bar and a horizontal seam through the stem.
  - b030: a U bottom is a full semicircle, and the slot (counter) ends inside are rounded.
- Construction (b021–b023): Sato lays a full lattice of horizontal and vertical white strips over the area, then removes segments to leave 現在地. Strokes therefore share one grid and one strip width.
  b002: the red tape goes on as long parallel stripes across the whole word and the excess is peeled off.
- Dakuten:
  - が (b010): two small rectangles stacked like `:`.
  - で (b047): two small squares inside the bowl.
  - が (b027): two blocks above the next glyph. They nest over と's bowl, so dakuten may intrude into the neighbour's cell.
  - ぷ (b004): the handakuten is a small ring.
- Small kana の/へ (b053) are ≈0.5 H and sit on the baseline. ゆ in the red しゆうえつ column is full size, not ゅ.
- Digit 1 (b005, b035) has a base slab as wide as the glyph and a short top flag. 4 (b006) has a slanted stem.
- New arrow forms: an outline (hollow) ⇨ in b048, ⤴ path arrows with rounded bends in b024/b025, and a C-loop arrow in b040.
- そ (b025) starts with a separate small square, then a bar.
- 成 (b011 lower) draws the 戈 dot as a short vertical bar and shortens the diagonal.
- Thin-stroke family (b048 自転車通れません, b013 京急蒲田駅): tape ≈0.07–0.09 H, and corners are rounded outside and square inside, the same construction at a smaller strip width.

## Batch 5 tracing notes (b054–b106)

168 SVGs from 37 images. Tags are `<img>_<row>`, plus a letter when a row was split into per-glyph runs.
One dotfile: `._b076_1d_0.svg` (the "." in H20.1). Scratch masks were made in the session scratchpad, not in the repo.
"w/h" below is the true cell width / height in the original photo. Divide x by it to undo trace.py's square stretch.

### Per image

| img | traced (tag: chars, w/h) | skipped and why |
|---|---|---|
| b054 | – | セロテープ display board, oblique, small. |
| b055 | b055_1 常磐線 0.67 (pitch 140, h 210). b055_2a 3 0.78, b055_2b ・ (square cell, row height), b055_2c 4 0.81 | Red arrow tip next to 線 painted out. 松戸・柏・水戸 is a printed strip. |
| b056 | – | Same sign as b106, smaller. |
| b057 | – | Close-up, no whole glyph. |
| b058 | – | 歩行者通路 in strong perspective. b064 has the same text frontal. |
| b059 | b059_1 路 0.89 | Yellow on black. Ink = r+g−2b > 90, then close 5 and fill holes < 800 px to remove white seams. Small glare bumps at the feet. |
| b060 | – | ~70 px glyphs. 日暮里駅 is covered by 5 other images. |
| b061 | b061_1 谷中 0.97 (pitch 282, h 290) | Same yellow channel as b059. |
| b062 | – | Oblique close-up. |
| b063 | b063_1 日暮里駅 0.74 (pitch 147.5, h 201). b063_2 北口 1.13 (pitch 198, h 176) | – |
| b064 | b064_1a/b/c 歩 行 者 1.0 (168×167). b064_2a/b 通 路 1.14 (168×148) | Ink = max(rgb) < 115 (black on orange). Block arrow. |
| b065 | – | 暮 close-up, oblique, cut at both sides. |
| b066 | – | 銀座/霊園 close-up, cut. |
| b067 | – | 繊 close-up, oblique, only part of the glyph. b070 and b080 have whole copies. |
| b068 | – | 左側通行 oblique and cut at both ends. b091 is frontal. |
| b069 | – | Oblique and cut. b071 is the frontal copy of the same sign. |
| b070 | b070_1a 東 0.87, b070_1b 口 0.89 (≈193×220). b070_2 ロータリ 1.11 (pitch 101, h 91). b070_3 繊維街 0.89 (pitch 103, h 117) | The trailing ー touches the sign border. Row-2 bits above 繊維街 were removed with a component filter. 繊's slits are mushy at ~100 px. |
| b071 | b071_1a 西 0.98, b071_1b 口 0.98 (192×195). b071_2 谷中銀座 0.99 (pitch 91, h 93). b071_3 霊園 0.90 (pitch 91.5, h 102) | 左側通行 on the lower panel is at the frame edge. |
| b072 | – | 北口改札 is behind glossy film. Glare breaks the mask with both Otsu and a local-background threshold. b105 is clean. 化粧室 is ~80 px, and b075 is better. |
| b073 | b073_1a 北 0.64, 1b 部 0.62, 1c 乗 0.61, 1d 換 0.61 (h 337) | 通 is cut by the frame. Red, ink = r−max(g,b) > 60. |
| b074 | b074_1a 換 0.55, 1b 通 0.62, 1c 路 0.61 (h 458) | 3 常磐線 is a printed sign. |
| b075 | b075_1 化粧室 1.00 (pitch 172, h 173), ink 150,30,40 tol 70 | Pictograms, block arrow. |
| b076 | b076_1a H 0.59, 1b 2 0.63, 1c 0 0.59, 1e 1 0.43 (h 269). 1d "." in a square cell | – |
| b077 | b077_1a C 1.04 (blue). b077_1b 階段 1.04 (pitch 224, h 215) | Red L-shaped route arrow. |
| b078 | b078_1 京浜東北 1.19 (pitch 191, h 161, keystone quad). b078_2 山手 1.03 (pitch 186, h 181) | Red turn arrows. |
| b079 | b079_1a 池 0.92, b079_1b 袋 0.91 (h 414) | 新 is cut by the frame. b098 has 新宿. |
| b080 | b080_1 谷中銀座 1.07 (pitch 159, h 149). b080_2a ロ 1.07, 2b ー 0.95, 2c タ 1.11, 2d リ 0.90 (h 152). b080_3 繊維街 1.0 (pitch 160, h 160). b080_4a/b/c 1 2 3 (red, stacked vertically, 1.07 each) | The trailing ー is cut by the frame. Ink = max(rgb) < 105 for black. |
| b081 | b081_2a/b/c 1 1 1: 0.34 / 0.35 / 0.36. b081_2d 2 0.54 (h 254) | The small labels are ~45 px. |
| b082 | b082_1a 赤 0.95, b082_1b 羽 0.92 (h 372) | – |
| b083 | b083_1 中央東口 0.58 (pitch 152, h 263). b083_2 東口 0.55 (pitch 150, h 271) | Block arrows. |
| b084 | b084_1a B 0.99 (blue). b084_1b 階段 1.04 (pitch 294, h 284) | – |
| b085 | b085_1a 中 0.62, 1b 央 0.62, 1c 乗 0.65 (h ~453) | The manifest says 中央東, but the third glyph is 乗, the same form as b073's. The cut-off neighbour was painted out. Ink = r−max(g,b) > 60 against glare. |
| b086 | b086_1 札 0.79 (348×438) | 改 is cut at the left. The printed sign's border was painted out. |
| b087 | – | Multicolour 宮. The lower-right of the 口 is only an outline drawn on yellow, so a mask would not be the glyph. Observation only (see below). |
| b088 | b088_1 日暮里駅 1.02 (pitch 134, h 134). b088_2 みどりの窓口 1.21 (pitch 136, h 113). b088_3 きっぷうり 1.26 (pitch 136, h 109) | ば: a passer-by's shoulder covers its loop. The JR logo is corporate. Panel-seam specks next to っ were painted out. |
| b089 | b089_1 足元注意 0.77 (pitch 174, h 227), ink r−max(g,b) > 60 | – |
| b090 | b090_1 現在地 0.74 (pitch 257, h 351), ink b−max(r,g) > 50 | – |
| b091 | b091_1a 左 1.06, 1b 側 1.09, 1c 通 0.99, 1d 行 0.91 (per-glyph cells, h 211, rotated board). b091_2a 宮 1.05, 2b 川 1.05, 2c 賢 1.22 (blue, h 231) | – |
| b092 | – | Poor, angled. 残 would be new but is not clean. |
| b093 | – | Same sign as b071, smaller. |
| b094 | b094_1a ト 0.49, 1b リ 0.59, 1c オ 0.69, 1d フ 0.72 (h 211). b094_1f ー (square cell) | Green slanted display lettering. Overlapping neighbours were isolated by connected component. ォ is merged with フ's foot. 12345/6789: keystone, a cable crosses 1 and 6, and tape rolls hide the bottom of 6–9. |
| b095 | b095_1a 開 1.03, b095_1b 業 0.99 (h 237) | Confetti dots were painted to the background. 業 loses a small notch at two bar ends where dots sat. 祝 is a knockout (white cut from a red block). |
| b096 | b096_1 日暮里 1.27 (pitch 247, h 194), ink r < 140 (glare on the black tape defeats Otsu) | – |
| b097 | b097_1a/b/c 日 暮 里 0.75 / 0.75 / 0.72 (h 351). b097_2a 南 1.03, b097_2b 口 1.07 (h ~188) | 駅 is cut by the frame. A red dot near 口 was painted out. |
| b098 | b098_1a 新 0.91, b098_1b 宿 0.94 (h 400) | – |
| b099 | b099_1a 南 0.84, b099_1b 口 0.68 (h 455) | – |
| b100 | b100_1a 口 0.69, b100_1b 改 0.77 (h 454) | 南 and 札 are cut. |
| b101 | – | Close-up of one corner. Measured only (see below). |
| b102 | b102_1a 大 0.94, b102_1b 宮 0.94 (h 384) | – |
| b103 | b103_1 東 0.91 (434×477), ink max(rgb) < 95 + hole fill | 口 is cut by the frame. |
| b104 | b104_1a 常 0.61, b104_1b 磐 0.67 (h 335), ink r−max(g,b) > 50 | Block arrow. |
| b105 | b105_1 北口改札 0.71 (pitch 175, h 248) | Red arrow. |
| b106 | b106_1 日暮里駅北口 0.69 (pitch 93.7, h 135, white on black). b106_2a/b 東 口 0.83 (130×157). b106_3a ロ 0.99, 3b ー 1.01, 3c タ 0.91, 3d リ 0.91, 3e ー 1.0 (h 69, each glyph isolated by component) | 繊維街 at ~65 px: its slits merge. ← is small. |

### Style measurements (new facts only)

Tape/H is the mode of horizontal-stroke thickness (vertical run length / 512 in the traced cells, so the stretch does not affect it).

### Two tape regimes at the same station

| regime | rows | tape/H |
|---|---|---|
| thin, single strip | b073 b074 b085 (red), b099 b100 b086 (black), b091_2 (blue) | 0.051–0.082 |
| normal | b063 b075 b083 b088 b089 b090 b095 b096 b097_1 b104 b106_1 | 0.074–0.121 |
| heavy | b055 digits, b076, b080, b081, b091_1, b094, b097_2, b102, b106_3 | 0.145–0.20 |

- Thin-tape signs (b073/b074/b085/b099/b100) read as stroke skeletons. Bars overshoot the box corners, and usually only one corner of a box is rounded, so most box corners are plain overlaps.
  Tick strokes (乗/換's 丿, 央's legs) end in a short horizontal foot.
- Heavy signs shrink counters to slits. 西 (b071) is a solid block with two corner notches and an L-shaped slit. 東 (b103, b083) reduces 日 to a rounded slab with two slits.

### Dense kanji (how density is handled)

- 繊 / 維 (b070, b080): 糸 is drawn as two short verticals with a diagonal on top, an X-like crossing in the middle, and three short vertical stubs for 小.
  The right side of 繊 is cut into crosses and stubs. Gaps between parts are about 0.3–0.5 tape. 繊 and 維 fill the same width as single-part kanji (cell 1.0 in b080).
- 霊 (b071): 雨 is a rounded cap with its four dots as two pairs of short bars inside slits. 亚 is stacked bars.
- 磐 (b104, b055): 舟 has a small square counter, and 殳 is a 几-like block. 石's 口 is a rounded slab with one rectangular slit.
- 暮 (b063 b088 b096 b097 b106): 日 inside becomes 2 parallel slits. 大 is a bar plus two diagonals that go to the cell edge. The lower 日 is again 2 slits.
  Slit width is about 0.1–0.2 tape, the same as the gaps in a030 悦.

### Corners (b101, red, frontal close-up, original px)

- Tape is 157 px (vertical) and 161 px (horizontal). Outer corner r is 147 px = 0.92 tape. Inner corner r is 55 px = 0.34 tape, a real small fillet and not blur.
- Both strokes show a seam along their length, so each is 2 strips of about 80 px.
- b097_2b 口: the top corners are rounded and the bottom corners are square. Rounding is per corner, not per glyph.

### Cells

- Cell w/h at one station ranges from 0.55 (b083) to 1.27 (b096). Single-row kana signs run wide (b088 1.21–1.26, b070 1.11).
- Digits are narrow: 1 is 0.34–0.43, 2 is 0.54–0.63, 0/H are 0.59. On the b080 sign, digits sit in square-ish cells stacked vertically.
- Thin-tape signs have narrow cells (0.55–0.65). Heavy signs have square cells (0.9–1.1).

### Tape layering

- b087 (宮, each piece a different colour) shows the decomposition directly. The top 宀 is 2 L-pieces (red, green) meeting at the centre.
  The middle bar is one long strip (blue) laid over a grey vertical stub. The lower 口 is a pink top piece, a brown left stub, and a black bottom bar.
  So a box is about 3–4 pieces, and the long horizontals are single strips laid last.
- b094 (トリオフォー) is slanted display lettering (all verticals lean right by about 6°), unlike every other sample. It may be a different hand or a different brief.

## Batch 6 tracing notes (b107–b159)

197 SVGs from 29 images (one dotfile: `._b139_5_0.svg`, the full stop).
Tags are `<img>_<row>`, plus a letter when the row was split into per-glyph runs.
"w/h" is the true cell width / height in the original photo. trace.py stretches every cell to a square, so divide x by w/h to undo it.
Unless a row says otherwise, each run's quad is the glyph's own pitch slot × row height, with x bounds taken from column ink profiles.

Scratch preprocessing: all of it was done on copies in the session scratchpad, never on refs/.
- Median 3–5 closes tape seams and glare lines.
- Polygon masks blank neighbours for interlocked glyphs and marks.
- Derived channels (max RGB, saturation, distance to the board colour) handle multicolour or outlined tape.
- The two .webp files were converted to png.
The SVGs depend only on the binarized mask.

### Per image

| img | traced (tag: w/h) | skipped and why |
|---|---|---|
| b107 | 佐藤修悦 b107_1a–d: 1.12 1.05 1.01 0.80. トリオフ (green) b107_2a–d: .54 .60 .63 .54. ォ b107_3 and ー b107_4: square row-height cells, masked, colour ink | – (a cable crosses 佐's foot and leaves a thin stub) |
| b108 | ありがとう b108_1a–e: .96 .88 1.10 .86 .90. 高円寺 b108_2a–c: 1.01 .95 1.12. TBSラジオ b108_3a–f: .75 .72 .53 .55 .64 .61. バツラジ (red 140,28,48 tol 70) b108_4a–d: .60 .53 .55 .56 | – (がとう are interlocked and were traced through polygon masks) |
| b109 | 山 b109_1a, 手 b109_1b: about .83 / .82 | – (the quads are keystoned; the board is 1.12× wider at the bottom) |
| b110 | 駅前 b110_1a–b: .81 .76. ロタリ b110_2a–c: 1.20 1.43 1.26. ー b110_3 and b110_4: square, masked | – |
| b111, b112 | – | Oblique, vertical text. 階段 comes from b152 instead |
| b113, b114 | – | 左側通行 duplicates |
| b115 | 総 b115_1a: 1.0. 武 b115_1b: .83 (saturation channel). 京 b115_2a: .52. 王 b115_2b: .67. 線 b115_2c: 1.0. All per-glyph perspective quads, 110–140 px | 中央西口 (strong perspective, 西 merges with 口). 山手中央 (40 px). 14〜7 (cut) |
| b116 | 田 b116_1a: .69. 急 b116_1b: .73 (timestamp masked). ・ b116_2: square | 山手中央 cut at the top. 小 and 京 cut at the frame |
| b117 | 8 b117_1: .94, but only 29 px tall | エスカレーター is ~30 px. 7 was traced and deleted because b141 has a better one |
| b118 | 北口改札 b118_1a–d: .52 .58 .54 .55 | – |
| b119 | K b119_1: .70 (median 5) | – |
| b120 | KIOS b120_1a–d: .74 .29 .47 .49 (median 5) | The last K is cut by the image edge |
| b121 | – | Wraps around a corner, two faces in strong perspective, wrinkled. Same text is frontal in b156 |
| b122 | 南西口 b122_1a–c: .86 .86 .75. 南口北口 b122_2a–d: .73 .63 .72 .67. ← b122_3 and → b122_4: square, masked | 出口 cut |
| b123 | 謹賀新年 b123_1a–d: .87 .87 .87 .91 (distance-to-yellow channel) | – |
| b124 | 化粧室 b124_1a–c: .83 .84 .81 (median 5) | Pictograms |
| b125 | 日暮里駅 b125_1a–d: .66 .69 .63 .83. 谷中銀座 b125_2a–d: 1.06 .99 1.09 .94. 繊維街 b125_3a–c: 1.07 1.10 1.03 (63 px). Red 1 b125_4: 1.13. 2 b125_5: 1.04. 3 b125_6: 1.06 | 北口/南口 (small, dup). ロータリー (dup) |
| b126 | – | Poor, 240 px. 2007 is ~35 px and glare covers スタンプラリー, including プ |
| b127 | 旅路編 b127_1a–c: 1.20 1.13 1.22 (poor image, ~50 px glyphs, kept for the new characters) | – |
| b128 | – | At ~50 px the が/は strokes cannot be segmented with confidence. Trial traces of 床, た, て were blobby and deleted |
| b129 | 写真展 b129_1a–c: 1.76 1.76 1.65 (poor, 34 px tall) | – |
| b130 | – | Vertical text on a traffic cone, poor |
| b131 | – | The second glyph does not read as 都 at this size. 京 and 編 are covered elsewhere. 温もり求めて is cut |
| b132 | 紅葉編 b132_1a–c: .88 1.02 1.22 (poor) | – |
| b133 | 西口 b133_1a–b: 1.00 .98. 方 b133_2c: .68 (poor) | 谷中面 were traced and deleted (35 px, counters filled) |
| b134 | – | Same text as a038, which is already the reference |
| b135, b136 | – | 左側通行, 中央東口/東口 and arrows: duplicates |
| b137 | ユナイテ (red) b137_1a–d: .52 .57 .37 .53. アロス (blue) b137_2a–c: .50 .54 .52. 営業して (cream) b137_3a–d: .56 .55 .49 .43 | ッー and the next glyph of row 3 are hidden by the guard |
| b138 | TOKYUHANDS b138_1a–j: all .83–.86 (median 3, binder clips masked). 秋葉原 b138_2a–c: .78 .78 .74 | 修悦体 (white knock-out on red). 文 and 具 (covered by decorative dots and the guard). 萌え, 高級筆記具, ⇒HとHBの (small, partly hidden) |
| b139 | 9 b139_1: .97. 1 b139_2a: .40. 0 b139_2b: .57 (white tape on a black panel, light ink). 大月甲府松本 b139_3a–f: .69 .67 .68 .57 .68 .70. 河口湖方面 b139_4a–e: .76 .76 .73 .75 .76. "." b139_5: square, masked | Pictogram and arrow. The second "." was traced and deleted (it touched 松) |
| b140, b143–b146 | – | Poor, 468 px. Digits and kanji duplicate b141/b142 or are under 30 px. b146's C/B are ~25 px |
| b141 | 7 b141_1: .76. 〜 b141_2: square. 1 b141_3: .55. 4 b141_4: .46. All masked, 110 px row | Left half ~25 px |
| b142 | 3 4 5 6 b142_1a–d: .73 .73 .75 .71 (dots masked). ・ b142_2: square, 48 px row | Left half small |
| b147, b149, b153 | – | 左側通行 duplicates |
| b148 | – | 階段 duplicate. b152 is the closer view of the same sign |
| b150 | ロケットニュス24 b150_1a–i: .43–.47. ー b150_2: square, masked. A 5×3 grey opening removed a glare streak | – |
| b151 | – | ROCKETNEWS24, same banner as a036 |
| b152 | 階 b152_1a: ~1.00. 段 b152_1b: ~1.02 (median 5, light ink, keystone corrected) | – |
| b154 | – | Pen sketch, described below. The brief named b153, but b153 is a 左側通行 banner and the sketch is b154 |
| b155 | 京浜東北 b155_1a–d: .98 .95 .97 .96 (median 3). 池袋 b155_2a–b: .92 .91. 新 b155_2c: .90. 宿 b155_2d: .94. 赤羽大宮 b155_3a–d: .93 .93 .93 .92. 1 1 1 2 b155_4a–d: .35 .35 .36 .53 (400 px tall). ・ b155_5: square, masked | 山手 and red 化粧室 (dups) |
| b156 | 京成 b156_1a–b: .98 .98. 常磐 b156_2a–b: .88 .89. H 2 0 1 b156_3a–d: .63 .61 .59 .45. C b156_5: 1.09. B b156_6: 1.14 (map labels, ~45 px, smoothed copy, soft edges) | "." (merged with 1's foot). A (cut by the 北口 label). 京浜東北/山手 (dups). Small map labels |
| b157 | 地上 b157_1a–b: .83 .82. ↓ b157_2 and ↑ b157_3: square, 188 px | Red → (dup), pictogram |
| b158 | プロムナド b158_1a–e: .69 .71 .69 .68 .72. ー b158_2: square, masked. TAD b158_3a–c: .76 .75 .78 | Map lines |
| b159 | – | Video still, blurry. ガムテープ are knock-out tiles whose figure/ground is ambiguous. はじめまして is half hidden by the arm. 中央東口 is behind the person. 修悦体 (dups) |

### Style observations (new relative to batches 1–3)

### Cell shape

- One sign keeps one pitch. TOKYUHANDS is .83–.86 for every letter, and ロケットニュース24 is .43–.47.
- Kanji cells on the Ueno/Nippori boards are near square: b155 .90–.98, b156 .88–.98, b125 谷中銀座 .94–1.09. The Shinjuku boards are portrait (.52–.76).
- Wide cells appear on the poor Nippori posters: 写真展 1.65–1.76 and 旅路編 1.13–1.22. The full range is now 0.29 (I) to 1.76.

### Interlocking

- がとう (b108): と and う share one rounded-rectangle body, split only by a tape seam. が's dakuten overhangs と.
- 新/宿 (b155) have no empty column between them.
- 7〜1 (b141): 〜 tucks under 7's diagonal and 1's flag.
- The separator "." in b139 sits under 甲's box.

### Dots and marks

- The separator "." (b139) is a disc 0.15 of row height, on the baseline.
- ・ comes in three forms:
  - b142: a 7×8 px square, 0.15 row height, centred at mid height.
  - b155: a disc 0.13 of digit height, centred.
  - b116: a vertical bar, 0.08 × 0.23 of row height.
- ー is a block or parallelogram about 0.2 row height thick, sitting at mid height.
- Knocked-out (han)dakuten:
  - プ's ゜ (b158) is a round hole in the end of the top bar.
  - ド's ゛ is two round holes in its side bar.
  - バ's dakuten (b108) is instead one rotated tape piece.
- 急's 心 (b116) is a single block with three narrow slits on top. 西 (b133) has a disc in its right counter.

### Strokes

- 攵 is an X of two full-width strips (改 in b118, plus 修 in b107). 木 legs are long tapered triangles (札, 本, 大, 亲).
- 7 (b141) bends from the diagonal into a vertical with a rounded outer corner. 〜 is two rounded J-hooks.
- ケ (b150) has no diagonal. It is a stub, a top bar and a J-hook.
- Black ↓ and ↑ (b157) are open chevrons: a shaft plus two strips meeting at 90°. The red arrows are filled heads, and in b122 the shaft is 0.75 of the head height.

### Latin and digits

- KIOSK, TOKYU HANDS, TAD, and C/B/H all use rounded rectangles with slot counters. The counter is about 0.22–0.25 of the letter width (O, D, 0).
- S is three bars with rounded outer corners and square inner corners. K and N use full-width diagonal strips. In b119 the lower K leg is laid over the upper arm.
- KIOSK's I and K lean about 3° in the same photo where O and S are upright, so the lean is hand placement.
- Digits:
  - 1 always has a flag and a full-width base slab (b125, b139, b141, b155).
  - 3/5/6 (b142) are built from horizontal bars. 6 has a small spur at its top-left join.
  - 9 (b139) has a square notch at its lower left.
  - 2 and 4 in ロケットニュース24 slant, unlike every other digit set.

### Colour and construction

- 謹賀新年 (b123) changes tape colour at the radical boundary of every kanji (言|堇, 加|貝, 亲|斤, and the two halves of 年).
- 総武 (b115) outlines every tape piece with dark marker.
- アロス (b137) is blue tape edged with a thin white tape outline. The SVG includes the outline.
- b139's digits are white tape laid on a black taped panel, so the glyph is the white layer.

### Tape width (index tape/cell, horizontal strokes)

| row | tape / cell height |
|---|---|
| kanji, b107 佐藤修悦 | 0.094–0.102 |
| kanji, b118 / b125 / b139 / b155 (median) | 0.12 / 0.12 / 0.14 / 0.145 |
| bold kana and Latin: トリオフ, TOKYUHANDS | 0.18–0.35 |

### b154: Sato's pen sketch of a grid plan (not traced)

- A rectangle stands for the board. A red pencil grid covers the glyph area.
- There are 4 vertical guides at uneven spacing (about 60 / 78 / 64 px apart in the 580 px photo) and 6 horizontal guides about 40 px apart.
- Every guide runs past the glyph and carries short hatch ticks (////) at both ends.
- The black strokes lie exactly on guide lines, in this order from the top:
  1. a top bar with short verticals at both ends
  2. a row of three boxes
  3. a wide bar with dropped ends
  4. a bottom with a left J-hook, a right hook, and a red circle one grid cell across in the middle cell
- What this shows about his method:
  - He lays out each sign on a coarse, non-uniform grid and snaps stroke edges to it.
  - A dot is a circle inscribed in one grid cell.
  - Curves appear only at hooks.
