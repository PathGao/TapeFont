# Batch 3 tracing notes

Images: a007 a013 a021 a030 a035 a036 a042 a043 a044 a046-a052.
Output: 92 SVGs (36 confirmed Sato, 56 `x_` unconfirmed). H below = cell height in the original photo.
Measurements come from each quad re-warped at its true aspect ratio (no square stretch). The script is
in the session scratchpad, not in the repo.

## Caveat for the generator: most cells are not square

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

## Per image

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

## Style measurements (true aspect)

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

## Are the x_ signs consistent with confirmed Sato work?

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
