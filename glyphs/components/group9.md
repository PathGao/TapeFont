# Group 9 components (56〜せんプ歩気港自車転)

Coordinates: x in [0, aspect], y in [0, 1], y down, strip centerlines. w = tape width.

## Digits 5, 6 (b142, bold, w ≈ 0.155, aspect ≈ 0.71–0.75)
- Built only from horizontal bars and verticals. Three bar levels: y ≈ 0.12, 0.43, 0.855.
- 5: one strip top bar (right end cut square at x ≈ 0.86·aspect) → left stem down → middle bar → right stem → bottom bar → short left rise cut square at y ≈ 0.59. Top-left outer corner square (`sharp`), other bends rounded.
- 6: top bar with a short right drop (to y ≈ 0.30), stem down the left, closed bowl from the middle bar (y ≈ 0.44) to the bottom bar (y ≈ 0.85). The stem is narrowed between the top bar and the bowl (cut x < 0.11·aspect from y 0.30 to 0.58), which gives the "spur" at the top-left join. Counter is a square cut.
- Shows in: 5, 6.

## 〜 (b141, w ≈ 0.155, square cell)
- One strip: up-arch then U. Centerline (0.31,0.62)→(0.31,0.45)→(0.5,0.45)→(0.5,0.76)→(0.69,0.76)→(0.69,0.60). Sits in the middle half of the cell height. All bends rounded.

## Kana (thin family b048, w ≈ 0.09–0.10, aspect 0.76)
- せ: full-width top bar (y ≈ 0.03), left stem from top to bottom turning right into the bottom bar (y ≈ 0.9, rounded bend), right stem a short straight drop to y ≈ 0.34 (no hook).
- ん: left stem full height (x ≈ 0.095). Hump = bar from the stem at y ≈ 0.62 to x ≈ 0.285, rounded bend down to the bottom bar at y ≈ 0.895, which runs right and turns up into a tall right stem to y ≈ 0.06. Kana curves = straight strips + rounded bends.
- プ (b158, w ≈ 0.14): フ is top bar → right stem → bottom bar going left, the lower-right bend has a large rounding and a small inner fillet. ゜ is a round hole (r ≈ 0.05) knocked out of the right stem just under the top bar, not a separate ring.

## 止 / 少 (歩, b064, w ≈ 0.117, square)
- 止: two stems at x 0.19 and 0.49 hanging from the top, right arm bar at y ≈ 0.15 from the centre stem to the right edge, long bar at y ≈ 0.48 across the cell.
- 少 below: centre stem continues to y ≈ 0.73 with a small left foot wedge. Side dots are L-shapes: left one drops then turns left (to the left edge), right one drops then turns right (to the right edge), both at y ≈ 0.68.
- 丿 of 少: one wedge = bottom bar (y ≈ 0.86–0.97, left end cut vertical) plus a diagonal strip rising to the right edge at y ≈ 0.74, cut flush vertical there.

## 气 / 米 (気, b041, w ≈ 0.10, aspect 0.82)
- 气: top bar y ≈ 0.06 full width, left stem from top to y ≈ 0.27 turning left (rounded) as the 丿. Second bar y ≈ 0.27 starts after a gap right of the stem. 乙 part: bar y ≈ 0.48 from the left, right stem down, bottom bar right, up-tick at the right edge to y ≈ 0.55 (two rounded bottom bends).
- 米 inside is reduced to an X: two diagonal strips, each cut flush to a vertical edge (left ends at x ≈ 0.03 and 0.10, right end at x ≈ 0.49) and flush horizontal at the bottom.

## 氵 / 共 / 巳 (港, b013, w ≈ 0.11, aspect 1.04)
- 氵 = three short horizontal bars (length ≈ 0.16), flush left, at the levels of 共's top bar (0.10), 共's bottom bar (0.50) and the glyph bottom (0.92). No diagonals.
- 共: two full-width bars (0.10, 0.31), two stems poking slightly above the top bar, third bar at 0.50, 八 as two short slanted blocks under it.
- 巳: inverted-U frame (bar y ≈ 0.70, sides down to 0.89) plus inner hook: stem → bottom bar (0.91) → short up-tick.

## 口-type boxes: 自, 田 in 車 (b048, w ≈ 0.09, aspect 0.76)
- 自: box from top bar (cropped, y ≈ 0.03) to bottom bar y ≈ 0.89, inner bars at 0.28 and 0.60, sides x ≈ 0.11 and 0.64. Bottom corners rounded. (Photo crops the top dot.)
- 車: top bar y ≈ 0.02, 田 box y 0.30–0.61 with middle bar 0.45, all four box corners rounded, bottom bar 0.90, centre stem full height through everything. Counters are square cuts.
- 転: 車 squeezed into the left half (x 0.05–0.39), same levels except top bar at 0.10 and bottom bar at 0.80. 云: two bars at 0.02 and 0.30, 厶 = slightly slanted drop into the bottom bar (0.89), and a full-height right stem (from 0.57 to the bottom) crossing the bar end.

## Tool note
- Closed counters with all-rounded corners can rasterize wrong (the hole contour gets rounded into an oval). Cutting the counter rectangle in `cuts` fixes it (used in 6, 車, 転).
