# Group 8 components

Coordinates: true-aspect frame, x in [0, aspect], y in [0, 1] down. Strips are centerlines of width w.
"Slab" = one tape-wide diagonal with ends cut flush to a horizontal line (poly parallelogram).
Source glyph JSONs: glyphs/manual/<HEX>.json.

## General rules seen in this group

- Tape width per sign varies a lot: 0.057 (部), 0.08 (旅), 0.10-0.13 (most), 0.17 (武), 0.23-0.32 (S, b017 kana ウ コ ニ ヤ).
  The cell narrows rather than the tape thinning.
- For b-series traces (no notes), aspect = (horizontal-stroke thickness) / (vertical-stroke thickness in the stretched trace).
  Works when both stroke directions exist. Fails on ニ (no verticals) and on clipped bars (タ).
- Heavy or dense glyphs collapse sub-components into solid blocks with thin slits (0.02-0.03 high) instead of open counters:
  白 in 原, 月 in 湖, 加 and 貝 in 賀, 止 in 武, 雨 and 亚 in 霊, most of 繊.
- Verticals often poke above the top bar to y=0 (地, 全's 王 does not; 年's left post does).
- Two components side by side share one top bar when their tops are level (地: 土+也, 部: 立+阝).

## Kana

- Loop (お よ ば): one strip: right leg up from the bottom -> band left -> left leg down -> bottom bar right -> up into the stem.
  お: `[[0.47,0.95],[0.47,0.45],[0.07,0.45],[0.07,0.9],[0.262,0.9],[0.262,0.03]]` at aspect 0.54, plus top bar y 0.125 and a disc dot r 0.045 at (0.49,0.29).
  よ: same loop with band at y 0.715 and a right tab bar on the stem at y 0.255. ば: same loop in the right half.
  The right leg hangs free and is not closed back to the bottom bar.
- Dakuten, two forms: two short vertical bars beside the stem top (ば, y 0.025-0.25, gap about 0.02);
  a disc (r about 0.075) cut out of the end of the top bar at the corner, leaving a crescent (ブ, a012).
- コ ウ っ: one 3-segment strip (bar, vertical, bottom bar) with rounded outer bends. ウ adds a short left leg from the top bar
  and a stub above the top bar's middle. っ is the same as コ at about half height (y 0.3-0.9) in a wide cell.
- ヤ: one slanted slab for the long stroke (top x 0.30-0.55, bottom x 0.225-0.475 at aspect 1.07) plus bar -> down -> short left hook.
- タ (b070): boxy. Left post from the top bar down to the middle bar, right post full height, three bars,
  and a left stub block hanging below the middle bar instead of the diagonal.
- ニ: two bars, the lower one slightly longer to the left.
- ロ: closed rectangle strip, start it mid-side so the corners overlap.

## Latin and digits

- E (small caps, a036): C-shaped strip `[[0.4,0.257],[0.048,0.257],[0.048,0.928],[0.4,0.928]]` + middle bar at 0.5, aspect 0.4.
- S: one zigzag strip with 5 legs (top bar, left down, middle bar, right down, bottom bar). Gaps between bars are under 1 tape.
- 4: vertical at x 0.715 full height, crossbar at y 0.85, diagonal slab from the top of the vertical down to the crossbar's left end.

## Kanji components

- 口 (as a box): closed strip, corners rounded (ロ, 部's 口 at x 0.11-0.26, y 0.545-0.935).
  In heavy signs 口 is a solid rounded block with a short slit (賀's 加, 0.2 x 0.26).
- 日 / 白: solid rounded block with one or two horizontal slits (原: block x 0.245-0.72, y 0.34-0.735, slit at y 0.6).
  白's top tick is a short vertical above the block.
- 月 (湖): solid block x 0.475-0.73 with three thin vertical slits (x 0.585-0.615) between the bars; the bottom slit opens at the baseline.
- 氵 (湖): two small squares (about 1 tape, at y 0.02-0.11 and 0.27-0.36, x 0.025-0.125) plus a wedge widening
  to the baseline (x 0.10-0.145 at y 0.55 to x 0.025-0.145 at y 0.95).
- 土 (地 left): stem x 0.155 from y 0 to the bottom bar; top bar shared with the right component; short bottom bar at y 0.58 (not at the baseline).
- 也 (地 right): stem from y 0 down into a U foot (bottom bar y 0.92, hook up to y 0.77); short middle post (y 0-0.46);
  right post from the top bar to y 0.625 with a small block jutting left at its foot.
- 宀 (完): bar y 0.165 with two short legs down to 0.35, stub above at the middle-left. Top corners rounded.
- 穴 (窓): wide ㄇ (bar y 0.06, legs to 0.43) with two inner Γ shapes for 八: left `[[0.31,0.34],[0.31,0.205],[0.55,0.205]]`,
  right mirrored `[[0.675,0.205],[0.915,0.205],[0.915,0.34]]` (aspect 1.24).
- ム (窓): one wedge from the upper right down-left to the bar, bar at y 0.49, short right post through the bar.
- 心 (窓): left L (post down, foot to the left edge), middle U (post down, bottom bar right, hook up at the right edge),
  two short vertical bars as the dots between them.
- 儿 (完): left = post down then foot to the left; right = post down, foot right, short hook up.
- 人 roof (全): two Γ shapes with a gap at the center: `[[0.4,0.09],[0.125,0.09],[0.125,0.28]]` and mirror. Not a diagonal pair.
- 王 (全): three bars of different lengths (top 0.125-0.775, middle 0.2-0.75, bottom 0.1-0.83) and one stem.
- 大 legs (本): two slabs from just under the crossbar to the baseline, ends cut flat on the baseline; 一 of 本 crosses them at y 0.835.
- 小 (a038): three near-vertical slabs; middle one has a tiny left foot. 小 under 原: center stem plus two small wedges.
- 厂 (原): top bar, left post down with a slanted foot slab at the baseline.
- 戸 / 户: tick, box top (bar, right post to a lower bar), long left post with a slanted foot.
- 疒 (疲): tick, 广 (top bar + left post with slanted foot), two dots as small tabs stuck to the left of the post.
- 皮 (疲): top bar, left post, stem through, a solid band, then 又 as a bar plus two crossing slabs.
- 方 (旅): top bar, stem with hook to the left at mid-height, and 𠃌 drawn as bar -> post -> U back up at the bottom.
- 彳 (行): two verticals (short left one to y 0.45, long one full height) plus a left bar at y 0.805 joining the long one.
- 亍 (行): two bars (y 0.14, 0.415) and a stem from the lower bar down with a short foot to the left.
- 阝 right (部): long left post full height plus a "3"-shaped strip: top bar right, down, jog left 0.05, down, foot left.
- 立 (部): shared top bar, two posts, bottom bar (box with posts), thin tape.
- 糸 (繊, dense): top as an M-shaped block, middle block, bottom block plus a separate right dot post. Guessed.
- 雨 (霊): heavy top bar, solid band, three short posts, and four short bars as dots between the posts.
- 貝 (賀): solid rounded block with three internal horizontal slits, legs as two outward slabs.
- 力 (賀, heavy): small tick plus a solid block with a slit opening at the bottom.
- 止 (武): solid block with a notch on the right and a slit on the left; 弋's dot is separated from the bar end by a thin slit.
