# Group 4 components (from hand builds of 0AKYあことみれカステハミラ・井修募喫大寄川急改暮業河用磐維者西足開駅)

Coordinates: x in [0, aspect], y in [0, 1], y down, centerlines unless "edge". w = tape width / cell height.

## How aspect was found
Most b-tags have no aspect in the notes. Sato keeps horizontal and vertical tape equal, so
aspect = (horizontal-stroke height in px) / (vertical-stroke width in px), measured on the 512 trace.
This agreed with photo measurement for the b017 katakana chart (1.25) and failed only for glyphs with no
horizontals (Y, ハ), where the photo was measured instead.

## Rules found

R1. Closed boxes (口 日 0 西 足's 口, 用 top). One closed polyline started mid-edge and ended at the same point,
so there is no butt-cap seam at a corner. Outer corners get rounded by the tool (~1 tape).
  口 (足): [[0.39,0.119],[0.633,0.119],[0.633,0.48],[0.145,0.48],[0.145,0.119],[0.39,0.119]] at aspect 0.77, w 0.098.
  0: [[0.354,0.105],[0.611,0.105],[0.611,0.9],[0.097,0.9],[0.097,0.105],[0.354,0.105]] at aspect 0.71, w 0.17.

R2. Small 日 / 目 inside a dense kanji = solid block with hairline slits, not a box with counters.
Slits are ~0.1 tape tall and stop ~1 tape short of the block's left edge. Seen in 暮 (both 日), 駅 (馬 top, 6 slits
in two columns around a solid central vertical), 磐 (石's 口 has a 0.035 counter), 募.
  暮 日: block x 0.104-0.442, y 0.174-0.418, slits x 0.145-0.40 at y 0.266-0.277 and 0.318-0.328 (aspect 0.52, w 0.09).

R3. Feet. A vertical that ends at the baseline on the left of a component turns left into a short foot with a
rounded outer corner (井 left leg, 川 left stroke, 石 丿 in 磐, 用 left leg, 开 left leg in 開, 足 人 left).
Polyline [[x,y_top],[x,0.92],[x-0.2,0.92]]. Hooks of 可 and 尺 do the same to the left/right respectively:
  可 hook (寄, 河): [[x,bar],[x,0.92],[x-0.1..0.17,0.92]]. 尺 leg (駅): [[0.829,0.528],[0.829,0.917],[0.987,0.917]].

R4. Diagonals are polygons, not strips: parallelograms whose ends are cut flush to the cell edge or to the
stroke they hit (vertical cut at the cell side, horizontal cut at the cell top/bottom).
  大 legs (aspect 0.96, w 0.156): [[0.017,0.785],[0.477,0.371],[0.477,0.58],[0.017,0.992]] and mirror.
  業 legs are shallow (slope 0.35): [[0.043,0.895],[0.51,0.73],[0.51,0.83],[0.043,0.995]].
  Y arms (aspect 0.75): [[0.02,0.095],[0.384,0.506],[0.384,0.83],[0.02,0.42]] and mirror, stem strip below.
  K arms: upper [[0.385,0.11],[0.621,0.11],[0.28,0.62],[0.044,0.62]], lower [[0.213,0.45],[0.413,0.45],[0.649,0.98],[0.449,0.98]] (aspect 0.65).

R5. 攵 (修, 改) is an X: two flush-cut parallelograms filling the right column below a top bar + short vertical.
  改 (aspect 0.56, w 0.068): vertical [[0.315,0.01],[0.315,0.31]], bar [[0.281,0.083],[0.516,0.083]],
  X [[0.283,0.33],[0.283,0.48],[0.518,0.99],[0.518,0.84]] + [[0.518,0.33],[0.518,0.48],[0.283,0.99],[0.283,0.84]].
  修 (aspect 1.0): X in box x 0.57-0.99, y 0.16-0.54, slope ~0.5, under the top bar, then 3 full bars (彡 as bars).

R6. 亻 (修): plain vertical with a hairline horizontal slit at mid height plus a 0.5-tape nub to the left at the slit.
彡 under 攵 in 修 = three equal bars spaced 1.2 tape.

R7. 氵 (河): two short bars (0.11 wide at aspect 0.77, at y 0.07 and 0.325) + a vertical wedge with the point up:
[[0.132,0.56],[0.132,0.985],[0.017,0.985],[0.017,0.9]].

R8. 門 (開): each half is one polyline: outer vertical full height, top bar, inner vertical down to ~0.6,
bottom bar back to the outer vertical; plus one middle bar. Left: [[0.08,1.0],[0.08,0.168],[0.405,0.168],[0.405,0.574],[0.08,0.574]] + [[0.08,0.373],[0.405,0.373]]; right mirrors.

R9. 艹 (暮, 募, 業's top): one full bar near the top, two short ticks poking up through it. In 暮 the ticks are only
half a tape wide. 業's outer ticks are slanted flush-cut polys.

R10. 宀 (寄): inverted U [[0.067,0.27],[0.067,0.087],[0.592,0.087],[0.592,0.27]] with a block "dot" through the top, and an
inner bar 1 slit below it.

R11. 灬 (駅): four equal vertical blocks 1 tape wide with hairline gaps, the leftmost one taller.

R12. 心 (急): left short vertical, then a U [[0.19,0.566],[0.19,0.948],[0.38,0.948],[0.38,0.598]], two discs 0.8 tape inside the U.
彐 (急): three bars with hairline slits closed by a vertical on the right.

R13. 糸 (維): two short verticals (Y top) merging into a solid trapezoid/blob, then three short leg blocks below a slit.

R14. 隹 (維): two verticals, four full-width bars; a wedge on the left for 亻.

R15. Kana:
  - Bends are polylines with rounded outer corners; no curves (あ, こ, と, み, れ).
  - こ: two L's: [[0.09,0.155],[0.762,0.155],[0.762,0.295]] and [[0.14,0.73],[0.14,0.946],[0.815,0.946]] (aspect 0.9, w 0.095).
  - と: C [[0.82,0.51],[0.068,0.51],[0.068,0.9],[0.815,0.9]] + vertical from top to the C.
  - み: one polyline [[0.13,0.097],[0.57,0.097],[0.57,0.922],[0.19,0.922],[0.19,0.532],[1.08,0.532]] + full-height right vertical (aspect 1.2).
  - あ: top bar, vertical, rounded loop, ノ as a straight strip at ~25 deg, small triangle tip.
  - Katakana chart b017 (カステハミラ): cells are wide (aspect 1.25) and tape very heavy (0.28-0.30). Bends turn
    toward the outside with a big rounded corner: カ/テ feet turn left [[x,mid],[x,0.84],[0.08,0.84]], ハ feet turn outward.
    ス main stroke is a flush-cut parallelogram from the bar end to the bottom-left corner; second leg a flush-cut poly to the right edge.

R16. Latin/digits: A = inverted U + crossbar 1 slit below the top (counter is the slit). 0 = R1 loop with tape 0.17.

R17. Dot ・: a single square of 1 tape (rounded by the tool), centred slightly above mid height.
