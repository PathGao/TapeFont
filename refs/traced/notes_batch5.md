# Batch 5 tracing notes (b054–b106)

168 SVGs from 37 images. Tags are `<img>_<row>`, plus a letter when a row was split into per-glyph runs.
One dotfile: `._b076_1d_0.svg` (the "." in H20.1). Scratch masks were made in the session scratchpad, not in the repo.
"w/h" below is the true cell width / height in the original photo. Divide x by it to undo trace.py's square stretch.

## Per image

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

## Style measurements (new facts only)

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
