# Group 5 components (from hand-built glyphs)

Coordinates: x as fraction of cell width (0..1), y as fraction of cell height (0..1, y down). Tape = w (fraction of height).
Chars in brackets are where it was seen. Glyph JSONs are in glyphs/manual/.

## General
- Aspect can be recovered from a square-stretched trace: aspect = (horizontal-stroke thickness in y) / (vertical-stroke thickness in x). It worked for every sign that has both stroke directions (い さ リ 側 化 営 央 書 田).
- Small counters must be cut, not left as holes. round_corners treats a hole's corners as convex and rounds them with the outer radius, so a counter narrower than ~2 tapes turns into a pill or a slanted oval (治 口, 田, 路 口). Cut the counter rectangle with `cuts` instead. That gives the near-square counter corners seen in photos.
- Diagonal ends cut flush: extend the strip past the target line and cut with a rectangle in `cuts` (キ stem, ム, 京 feet, 央 legs, 文 ×, 禁 legs, 葉 legs, ← head). Cuts run after rounding, so the cut corners stay sharp.
- Heavy strokes (バ slabs, ← shaft) are two parallel strips side by side, as in the notes.
- Closed loops (口 rings): start and end the polyline in the middle of a straight side, not at a corner, or that corner comes out square.
- Square outer corners in the photo: use `sharp` (高 冂 and inner 口 left corners, バ slab tops, 富 一 bar, 関 door tops).

## 口 / ring (京 a040, 営 b137, 謹 b123, 悦 a030, 路 b010, 治 b016)
- Strip loop. Outer corners rounded 1 tape. Photos often show a rounder stadium (京 口 radius ~half the box height, 営 rings), which r = 1 tape underestimates.
- When the counter is a short slit (京 口 counter 0.07 tall, 謹 言 口 oval) the hole rounding happens to match the photo. Otherwise cut the counter.
- Flat, wide 口 can be two stacked strips with one slit cut (富 口 y 0.33-0.57 slit at 0.45, 高 upper 口).

## 田 (田 a038, 富 b015)
- Light tape: loop x 0.185/0.875, y 0.09/0.95 + stem x 0.525 + bar y 0.48, counters cut as rectangles.
- Heavy: a solid rounded block with 4 slits (富 lower half: block x 0.02-0.97, y 0.58-0.98, slits at y 0.71 and 0.845, x 0.17-0.42 and 0.56-0.82).

## 日 inside other chars (書 a021)
- Solid block x 0.15-0.84, y 0.665-0.965 with two thin slits at y 0.77 and 0.87, x 0.33-0.66.

## 亻 (側 a027, 化 b124)
- One vertical, no diagonal. 側: x 0.05, full height. 化: x 0.235 plus a short flag to the left at mid height (y 0.495, x 0.02-0.235).

## 忄 (悦 a030)
- Three parallel full-width verticals separated by thin slits: x 0.105, 0.24 (full height) and 0.385 (top half only, to y 0.53). No dots.

## 氵 (治 b016)
- Two short bars (x 0.14-0.39 at y 0.06 and 0.355) and one 45° diagonal in the lower part, cut flush to x 0.14 and x 0.39 and to the baseline.

## 言 (謹 b123)
- Dot: short vertical x 0.28, y 0.08-0.17. Three bars across x 0.06-0.48 at y 0.215 / 0.385 / 0.555. Ring 口 below (x 0.04-0.47, y 0.66-1.0) with a small oval counter.

## 糸 (総 b115, low confidence)
- 幺 as a "<" (strip from top-right down-left to x 0.09, then down-right) plus two parallel "/" strips; 小 as three near-vertical bars at the bottom. Trace was very blurred.

## 艹 (葉 b138, 謹 b123 堇 top)
- Two short stubs poking above the bar (x 0.27 and 0.66), then one full-width bar. 葉: a second full-width bar directly under it separated by a hairline slit.

## 宀 / 冖 (富 b015, 営 b137)
- Dot stub at center top (x 0.505, y 0.015-0.10), wide bar y 0.125 with rounded outer corners, legs down to y 0.45. 営 冖: same shape, legs to y 0.43. 営's ⺍ is three slanted parallelogram ticks (polys) in the top 0.15.

## 冂 (高 b108, 央 a024)
- 央: top y 0.15, legs x 0.135/0.785, rounded top corners, stem runs through to the top. 高: left top corner square (sharp), right rounded.

## 門 (関 x_a052, unconfirmed)
- Each door: outer stem full height, top bar, inner side to y 0.57, two rungs → two small counters. Outer top corners square, inner top corners rounded.

## 貝 (側 a027)
- Box x 0.155-0.495 with top corners rounded and 3 counters stacked in a center column (rungs y 0.29, 0.455). Bottom: solid block y 0.615-0.98 with an inverted-V cut, apex (0.325,0.655), so the legs taper to points.

## 刂 / hook (側 a027, リ b107)
- Short vertical + long vertical whose foot turns toward the inside with one rounded outer corner (側: x 0.785 to y 0.935, foot to x 0.66).

## 木-type legs
- Stem + two strips from the stem going down-out, ends cut flush to vertical lines (京 feet at x 0.02-0.22 / 0.75-0.96; 禁 left 木 cut at x 0.05 and 0.445; 葉 legs cut at x 0.04 / 0.93).
- In blobby/heavy signs the leg area is solid: a wedge with two triangular notches at the bottom (様 木).
- 水 bottom in 様: an X of two strips crossing on the stem at about 30°.

## 人 / 大 legs (央 a024)
- Two strips from one apex just below the bar (x 0.47, y 0.50), ~58° from horizontal, cut at x 0.02 / 0.92 and y 0.965.

## 文 × (文 a021)
- Each arm starts as a short vertical stub under the bar (x 0.115 and 0.885, y 0.30-0.45), bends with a rounded corner into a diagonal, and crosses to the other side. Ends cut flush to the cell sides.

## 匕 (化 b124)
- Vertical x 0.52 from top, bar right at y 0.185, rounded L-foot at y 0.93 to x 0.96.

## 儿 (悦 a030 兌)
- Two verticals side by side with a hairline slit; left one turns left at the foot, right one turns right and hooks up.

## 止 (路 b010)
- Stem x 0.275 from the 口 down, short bar right at y 0.685, short left vertical x 0.145 from y 0.64, full-width base bar y 0.935.

## 夂 (路 b010)
- Frame: left vertical x 0.555 (y 0.10-0.43), top bar y 0.145, right vertical x 0.895 down to y 0.37, then an X of two strips (/ from the right vertical's foot down-left, \ from inside down-right), both cut flush.

## Kana and Latin strokes
- Kana verticals end in rounded L-feet (い left, リ right, も, セ). Curves never appear.
- さ (b047): full-width top bar, one diagonal from the bar down-right that bends back into a bar going left (y 0.725), separate └ (x 0.09, foot y 0.935).
- ど (b088): stem into a C (bar y 0.52, vertical x 0.155, bar y 0.92). Dakuten are two short vertical bars, not discs.
- を (a021): stub+bar that bends down on the right, then a C whose top bar runs through to the right edge.
- も (a034): two bars crossed by a stem that turns into a U-hook (x 0.365 → 0.795, up to y 0.60).
- キ (a013): two full-width bars, one slightly slanted stem cut flush at top and bottom.
- ト (b107): stem plus a near-horizontal tick, its tip cut at an angle.
- ム (a038): diagonal cut flush at the top, full-width foot bar with a pointed left end, right stroke overshoots the baseline.
- バ (b108): two slabs (each 2 strips), dakuten as a slanted block with two slits.
- 1 (a012): flag + stem as one bent strip (rounded top-right), full-width base slab.
- B (b084): two bowl loops on a stem, lower bowl slightly wider.
- N (a036): left stem slightly slanted, one diagonal, right stem; heavy rounded bottom-right.
- ← (a016): shaft 2 tapes thick, head a triangle about 0.6 cell tall.
