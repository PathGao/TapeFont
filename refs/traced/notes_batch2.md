# Batch 2 tracing notes (a011–a041 subset)

98 SVGs from 11 images. Tags are `<img>_<row>` plus a letter when a row was split into per-glyph runs
(perspective rows, or uneven spacing). One file is a dotfile: `._a012_4a_0.svg` (the full stop).

## Conventions used

- Normal glyphs: quad = the glyph's cell (its own pitch slot × row height), so trace.py stretches
  portrait cells to square. Undo with the cell aspect listed per image below.
- Small/narrow marks (ー 一 、 。 . ! の and arrows in a016/a040/a041/a038 ー/a031 ー):
  square cell of row height, centered on the glyph, neighbours masked out in a scratch copy.
  These keep their true proportion and vertical position in the row.
- Perspective rows (a017, a022, a031, a034) were split per glyph along the row's top/bottom edges
  (a022 via the row homography so foreshortening is handled).
- a034 rows 1/3 were binarized from derived channels (R−max(0,B−R), R−B) in scratch to kill blue
  glare; row 2 from a redness channel. The SVGs only depend on the mask, not on the source colours.

## Per image

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

## Style measurements

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
