# Group 7 components

Coordinates: y in [0,1] down (cell height), x in true-aspect units (a = cell w/h). w = tape width / cell height. Strip coordinates are centerlines.

## How aspect was found for b-tags (no notes exist for them)
Sato keeps one tape width per sign, so true aspect = (horizontal-stroke thickness in trace, fraction of 512) / (vertical-stroke thickness in trace, fraction of 512). This mode-of-run-lengths estimate gives a041 0.70 (notes 0.72), x_a046 0.69 (0.68–0.71), a013 0.61 (0.61). It fails on glyphs with few verticals or many diagonals (そ, 谷, 浜, 界/空 inner bits), so check against the photo.
Measured: b017 katakana chart 1.25, its red hiragana column 1.05, b053 世界の空 1.7–1.75, b016 令和/平成/大正 1.0–1.1, b108 高円寺 1.1, b010 この道 0.9–0.95, b007 京浜/上野 0.85–0.9, b024 未完成 0.85, b025 そ 0.48.

## 宀 (安 空)
Dot: short vertical strip centered, from top (y≈0.01–0.04) down into the roof bar.
Roof: one strip leg-bar-leg, `[[xl,0.30],[xl,yb],[xr,yb],[xr,0.30]]`, yb = 0.1 (安) – 0.2 (空), legs end at about y 0.29–0.56 (longer in wide cells). Legs run at the outer edge of the cell.
空 a=1.75 w=0.132: dot x 0.873, roof bar y 0.205 x 0.12–1.61, legs to 0.56/0.53.

## 冖-like frames: 令's 人 roof
人 roof of 令 is not a diagonal V: a flat 冂 frame, `[[0.095,0.32],[0.095,0.066],[1.005,0.066],[1.005,0.32]]` (a=1.1 w=0.135), with the 一 inside as a shorter floating bar (x 0.29–0.81, y 0.25).

## 卩 (令)
Rounded hook: bar from the left edge across, down the right side, back left: `[[0.03,0.416],[1.005,0.416],[1.005,0.788],[0.59,0.788]]`, plus a full-height center vertical (x 0.51 from 0.416 to 1.0). The return bar stops one slit short of the vertical.

## 人 / 八 legs (界 未 浜 谷 集 平)
Every leg is one straight strip (poly), never curved. Outer end is cut vertical at the cell side (or flush with the cell bottom), inner end disappears into a bar or the stem. Slopes seen: dy/dx ≈ 0.3–0.4 (wide cells 界, 集 木), 0.6 (谷), 1.4–2 (浜 八, 未).
- 界 a=1.7: left leg poly `(0.129,0.787),(0.47,0.65),(0.81,0.65),(0.129,0.922)`, right mirrored to x 1.561.
- 未 a=0.84: left leg `(0.06,0.84),(0.245,0.67),(0.35,0.67),(0.35,0.73),(0.06,0.985)`.
- 浜 八: legs pointed at the bottom (blade tips), outside edge vertical.
- 谷 人: inverted V of two strips meeting at the center (apex y≈0.11 top edge), outer ends cut vertical at x≈0.035 / 0.963, y 0.39–0.57.
- 平 丷: two wedges from the cell sides (y 0.26–0.39) down to the middle bar, inner edge turning vertical at x 0.33/0.67.

## 八 on top (谷)
The small 八 above 人 in 谷 becomes two flat bars at y 0.14 (x 0.045–0.34 and 0.655–0.965).

## 木 bottom (集)
Bar y 0.706 full width, stem x center, legs as flat diagonals (slope 0.3) cut vertical at both ends: left `(0,0.837),(0.22,0.768),(0.22,0.892),(0,0.962)` in a=0.6.

## 隹 (集)
Two full-height verticals (x 0.138 and 0.397 in a=0.6, y 0.035–0.615) and four horizontal bars stacked with only thin slits (y 0.138 0.278 0.417 0.553, w 0.123). The 亻 slash is a short stub bar out to the left edge at the third bar level.

## 氵 (浜 藤)
Three short horizontal bars, one tape tall, at the top / middle / bottom (浜: y 0.153, 0.60, 0.945, x 0.061–0.214 in a=0.85). No dots, no diagonal. The top bar shares the level of the right part's top bar (藤: y 0.152 with 艹 bar 0.155).

## 糸 (編)
a=1.1 w=0.087: U hook top-left `[[0.062,0.078],[0.062,0.29],[0.216,0.29]]`, right stem `[[0.216,0.078],[0.216,0.36]]`, a short diagonal wedge down-left from the stem into the bar `[[0.013,0.552],[0.397,0.552]]`, a right stub vertical x 0.36 (0.26–0.69), and three legs below: x 0.048 (0.715–0.95), 0.203 (from the bar to 0.953), 0.351 (0.72–0.955).

## 辶 (道)
a=0.9 w=0.097: dot = square bar at top-left (x 0.093–0.19, y 0.153). Then a plain vertical x 0.146 from 0.27 down to the base, and a full-width base bar y 0.94 from x 0.084 to the cell right. No wave, no sweep.

## 首 / 目 box (道)
Box = one closed strip with all four outer corners rounded, inner bars as separate strips touching both walls. Horns: two short verticals above the top bar; short vertical neck from top bar to box.

## 亻-like vertical + bend (在 方)
丿 is a vertical that bends into a horizontal to the left at a bar level: 在 `[[0.318,0.014],[0.318,0.585],[0.023,0.585]]`, 方 `[[0.19,0.075],[0.19,0.925],[0,0.925]]` (rounded foot).

## 土 / 寸 sharing bars (在 寺)
土 is vertical + two bars. In 寺 the 土 and 寸 bars run the full width as three equally spaced strips (y 0.14 0.34 0.53, a=1.1); top stem only between bar 1 and 2. 寸 stem: vertical with a rounded foot to the left `[[0.72,0.44],[0.72,0.937],[0.438,0.937]]`; 寸 dot is a vertical bar at the left edge.

## 戈 (成)
a=0.85 w=0.115: frame top bar full width, left wall full height. Stem x 0.563 from top to 0.8. Diagonal is one strip cut vertical at the right edge and flush at the bottom: `(0.375,0.99),(0.787,0.413),(0.787,0.603),(0.516,0.99)`. Dot = short bar at upper right. Hook = short vertical bent left under the diagonal.

## 冂 + 丷 slab (南)
a=0.72 w=0.14: 冂 strip `[[0.07,1.0],[0.07,0.402],[0.618,0.402],[0.618,0.99]]`. Under the top, one solid slab (x 0.174–0.513, y 0.47–0.717) with a downward triangle cut `(0.31,0.472),(0.38,0.472),(0.343,0.575)`; thin slits separate it from the walls. Then a bar y 0.838 and the center stem to the bottom.

## 艹 (藤)
Full-width bar y 0.155 with two short verticals crossing it (x 0.511 and 0.901, y 0.03–0.29).

## 田 (界)
One closed box strip plus a middle bar and center vertical, all one tape; walls at the cell sides.

## 女 (安)
Two crossing strips, each vertical then diagonal then horizontal foot: `[[0.252,0.264],[0.252,0.6],[0.58,0.925],[0.81,0.925]]` and `[[0.642,0.38],[0.642,0.62],[0.32,0.93],[0.084,0.93]]` under a full-width bar at y 0.38 (a=0.9).

## Kana strokes
- Chart kana (b017) use a huge tape: 0.22–0.35 H. Every curve is a straight strip with a rounded outer bend.
- ノ in katakana (ナ ケ ソ): vertical that bends into a foot running left along the bottom: ナ `[[0.605,0],[0.605,0.8],[0.107,0.8]]` (a 1.25). ソ's ノ is the same, foot full width.
- イ's ノ: a horizontal arm from the left into the stem at mid height.
- ケ's ク-stroke: short vertical stub at top-left over the bar.
- ソ dot / ン-style tick: parallelogram cut vertical on both sides, `(0.12,0.04),(0.334,0.25),(0.334,0.635),(0.12,0.425)`.
- フ: a reversed コ (top bar, right side, full foot back left). Looks the same as コ in this chart.
- モ: two full bars, stem bending right into a heavy foot.
- レ: slightly slanted stem with a rounded bottom, then one straight diagonal strip to the top right, cut vertical there.
- の (b010): rounded rectangle split by a center vertical, bottom-right foot left open (a 0.95, w 0.097).
- え: top dot + bar, diagonal from the bar's right end into a slab, left leg straight down, right leg with a foot to the right.
- ゆ: two verticals, left top joined by a bar, right a rounded box with a tiny counter.
- そ (b025, narrow a=0.48): top split into a short bar and a long bar, one diagonal down-left, then a zigzag of bars with rounded U-turns ending in a foot bar.

## Square vs rounded outer corners ("sharp")
I checked every corner that would be rounded against the trace by sampling the ink just inside it. I kept a square corner only where the trace is square and the IoU did not drop.
- Diagonal strips cut at the cell edge keep square ends: レ top-right tip, the right end of 成's 戈 diagonal, the outer leg ends of 未.
- Feet and bar ends at the cell side are square in the chart kana: モ's foot, フ's top-right corner.
- Some joints where a diagonal meets a vertical are square: both 女 joints in 安.
- 編's 戸 right side and 冊 top-left are square. So are 藤's 月 top-left and the 夫 slab corner.
- 谷's leg ends and の's counter stay rounded, because the trace is rounded there.
