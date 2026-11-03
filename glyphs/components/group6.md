# Group 6 components

Coordinates: true-aspect frame, x in [0, aspect], y in [0, 1] down. w = tape width (fraction of cell height). Glyph JSONs in `glyphs/manual/`.

## General rules seen in this group
- Stroke width is one value per sign: 0.08-0.10 (station signs), 0.13-0.15 (heavy signs), 0.25-0.30 (katakana chart b017, TOKYU HANDS Latin).
- Enclosures with several counters (園 用 白 日 意's 日 甲) read best as one rounded slab minus slits/counters (`polys` + `cuts`). Counters are square-cornered rectangles; the slab's outer corners are round (r ≈ w). Slits between stacked bars are 0.01-0.02 high.
- Shared horizontal levels: all bars of a character sit on 3-4 levels, and a left radical's bars sit on the same levels as the right part's bars (注: 氵 bars at y 0.127/0.485/0.933 = 主 bars at 0.127/0.485/0.937).
- Diagonals: straight slabs, ends cut flush with the cell edge or with the stroke they meet. An X (攵, 水, 秋's 火 legs) is two slabs clipped to a vertical band.
- Tool note: `round_corners` also rounds holes, so small counters closed by strips turn into ovals. Add a `cuts` rectangle for each counter to get Sato's square counters. Polys that almost touch (gap < 0.01) leave slivers that break the union, so overlap them instead.

## Kana and Latin
- う: top bar [0.07-0.505]@0.352; ⊐ strip (0,0.492)→(0.522,0.492)→(0.522,0.932)→(0.078,0.932). Aspect 0.6, w 0.108.
- し: one L-strip: stem x 0.146 from top, bottom bar y 0.945, right up-tick x 0.804 to y 0.61 (aspect 0.95). Both bends rounded.
- な: cross (top bar y 0.062 full width, stem x 0.188 with a left foot at y 0.93); right short bar y 0.385 from x 0.43 to the edge; loop = closed strip rectangle x 0.305-0.43, y 0.73-0.93 (leaves a narrow slit as counter); tail = leg x 0.545 down to baseline, separated from the loop by a thin cut.
- や: full-height stem x 0.316; bar y 0.15 → ⊐ down to y 0.66 → back left to x 0.525; small tick at top right is a parallelogram.
- ア: top bar y 0.085, right stem to y 0.45 then a short bar back left (hook tab); main stroke = vertical x 0.28 from 0.22 with a rounded foot to the left at y 0.925 (aspect 0.55, w 0.14).
- ク / ヒ (b017 heavy chart, aspect ~1.1): ク = left tab column + top bar → right stem → bottom bar back left (big rounded bottom-right). ヒ = ⊏ strip (top bar, left stem, bottom bar), top-left tab.
- メ: main stroke as vertical down then rounded L to the bottom-left; crossing stroke as one slanted slab from top-left to right.
- ル: two strips: left vertical with rounded foot to the left; right U = stem + bottom bar + up-tick (x 0.69), rounded bottom corners.
- ゼ / ド: dakuten. In ゼ (a034) the dakuten are two round holes (r ≈ 0.035) cut out of the slanted right stroke. In ド they are two discs r ≈ 0.06 at x ≈ 0.82·aspect, y 0.175 and 0.335.
- 2: stub down left (x 0.108, 0.085-0.275), top bar 0.085, right stem to 0.39, middle bar back left, left stem down to 0.932, base bar, right up-tick to 0.74. aspect 0.51.
- C: ⊏ strip with both arms ending in short down/up ticks (aspect ~1.05). O: heavy rounded rectangle, w 0.25, square counter.
- ↑: one polygon: apex, two barbs, shaft 0.26 wide; head edges at 45° when aspect is 0.66.

## Kanji components
- 宀 (字 察): ∩ strip: legs at x≈0.08/0.53 (字, aspect 0.6), top bar y 0.2, legs down to ~0.38; tick = short vertical at center from y 0 to the bar. In 察 the legs stop at 0.275 and the part below has its own boxes.
- 子 (字): ⊐ hook at the top (bar y 0.326 → down at x 0.415 → back left at y 0.48), stem x 0.3 from 0.43 to 0.927 with rounded hook foot to the left, cross bar y 0.64 full width.
- 口 / ロ as a small enclosure (常, 句 in 警): closed strip rectangle + square counter cut.
- ⺌ (常): three short pieces above the cover bar: left slab slanting in, middle vertical tab, right slab slanting in.
- 冖-like cover (常): ∩ with legs down to ~0.46, bar at y 0.16.
- 巾 (常): ∩ bar at y ~0.54 with legs to the bottom, stem through the middle from the 口 to the bottom.
- 立 (意): tick, top bar, two short verticals forming a square counter, bottom bar. Bars full width.
- 日 inside a stack (意): rounded slab x full width, two horizontal slits ending short of the right side (stadium look).
- 心 (意): ㄩ strip (left hook stem x 0.342, base bar 0.937, right stem 0.696), two square dots in between, left dot is a slanted block with diagonal foot.
- 亲 (新): 立 = top bar, two verticals, bar; 木 = bar, stem to the bottom, two wedge legs cut flush at the cell edge (left leg ends on x=0.011, right leg on x=0.441).
- 斤 (新): stem with rounded top-left corner into a top bar, mid bar y 0.39, right stem from mid bar to bottom.
- 月 (月): one strip (left stem → top bar → right stem → short hook foot left), two cross bars at y 0.388/0.628. Top-left and bottom-right bends rounded.
- 北: two verticals at x 0.24/0.5 (aspect 0.72, w 0.14); each has a short arm at y 0.16 (left arm to the left edge, right arm to the right edge); left foot is a T bar across the stem at y 0.91, right foot an L into a bar to the right edge.
- 止: two verticals and a base bar; top flag to the right on the right stem.
- 氵: three short bars (no wedge) at the character's main bar levels (注 x 0.09-0.26; 蒲 x 0.097-0.283 at y 0.302/0.523/0.943).
- 主 (注): tick+stem through, three equal bars.
- 甲 / 田: rounded box strip, cross bar at the middle level, stem through and below; counters cut square.
- 艹 (蒲 警): full-width bar at y ~0.1 with two short verticals crossing it from y 0 to ~0.2.
- 甫 / 用 (蒲 通): open-bottom ∩ with rounded top corners, stem through the middle, two inner bars; in 通 the 用 is a rounded slab with 4 square counter cuts. 甫's dot is a small square.
- 糸 (線, a038 aspect 0.6): top-left short stem joined into a center column (Z-shape), diagonal down-left, full-width bar at y ~0.48, then three equal legs x 0.065/0.166/0.263 from 0.6 to bottom.
- 白 (線 階): rounded slab with tick on top, two counters (線) or two slits (階).
- 水 (線): stem from 白 down to bottom, X of two slabs clipped to the column x 0.316-0.591, crossing at the stem.
- 禾 (秋): top tab, bar, stem, left wedge leg, right leg forming a V with 火's left leg.
- 火 (秋): stem, right dot block, left V, right diagonal leg cut at the cell edge.
- 攵 (警): short vertical top-left, top bar, X of two slabs clipped to the right half.
- 言 (警 bottom): tick, full bar, two shorter bars, rounded 口 slab at the bottom.
- 辶 (通): top tick bar at the top level (y 0.113), L (short bar y 0.453 → stem down x 0.142), full-width base bar at y 0.94 under the right part.
- マ (通): top bar with rounded right corner turning into a diagonal down-left, plus a V tick meeting it.
- 阝 (階): left stem full height; top bar → down → step left → down → step right → down → foot left (one zig-zag strip, rounded bends).
- 比 (階): two verticals each with a short arm at y 0.2 and a foot bar at y 0.48 to the right.
- 袁 inside 囗 (園): inner block separated from the frame by a thin gap; rows separated by slits; bottom row has a diagonal notch.
- 人 roof of 今: replaced by a rounded ∩ box (legs to y 0.36) with 一 inside it.
- 元: two bars full width; 儿 = left leg with rounded foot left, right leg into an L foot with an up-tick (rounded bottom).

## Square vs round corners (with `sharp`)
- Square outer corners in the photos: free bar ends that meet the cell edge (2's base bar bottom-left, ア/ヒ/ク top-left tabs), and every block corner in 秋 (b138 cuts its blocks square). Round: bends of hooks and loops, box tops, U bottoms.
