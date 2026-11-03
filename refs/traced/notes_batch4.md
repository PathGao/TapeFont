# Batch 4 tracing notes (refs/photos_b b001–b053)

220 SVGs from 27 images. Tags are `<img>_<row><letter>`: one letter per glyph, and each glyph is its own single-cell run.
b017 uses `<row><column a–k>`, so the letter is the chart column. `b017_r1..r5` are the red hiragana column.

## How cells were made

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

## True cell w/h per tag

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

## Per image

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

## Measurements

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

## New style facts

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
