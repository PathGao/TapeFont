# Batch 6 tracing notes (b107–b159)

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

## Per image

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

## Style observations (new relative to batches 1–3)

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

## b154: Sato's pen sketch of a grid plan (not traced)

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
