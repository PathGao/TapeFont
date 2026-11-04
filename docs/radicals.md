# Radicals and strokes

How to build a radical, kana stroke or component the way the current glyphs in `glyphs/manual/` do.
Open `glyphs/manual/<HEX>.json` (HEX = 4-digit uppercase codepoint) of any example to copy its strips.

## Conventions

- Cell: kana and kanji use `"aspect": 0.68`, `"w": 0.11`. x runs 0..0.68, y runs 0..1 down.
  All coordinates below are in these units. Latin and digits keep a narrower aspect (see Latin).
- Strip points are tape centerlines. Strip ends are butt cut at the point, so a strip from x 0 starts its ink at x 0.
- Examples marked (P) are built from a photo (`"src"` is set). They are the authority. Others were built without a photo.
- JSON keys: `strips` (tape), `polys` (filled shapes), `cuts` (removed after rounding), `sharp` (corners within one tape of these points stay square).

## General rules

### Weight and levels
- Tape is 0.11. Use 0.09 for dense kanji: 6 or more horizontal levels, 5 or more posts, or a half that needs a box split by a stem (調 性 減 得 後 側 題 職 境 連).
- Edge-to-edge strip centers: x 0.055 and 0.625, y 0.055 and 0.945. A bar that runs to the cell side ends at x 0 or 0.68.
- Middle bar sits at y 0.45-0.5. A top bar under a dot or tick sits at 0.1-0.17.
- All bars of a character share 3-4 levels. A left radical's bars sit on the levels of the right part's bars (注: 氵 bars 0.127 / 0.485 / 0.933, 主 bars 0.127 / 0.485 / 0.937).
- Left radical takes x 0-0.30. The right part starts at about 0.25-0.40 (given per radical below). Keep at least 0.03 of gap.
- Verticals may poke above the top bar to y 0 (地 也, 年's left post).

### Corners
- Outer bends are rounded about one tape automatically. Inner bends are almost square. Strip ends stay square.
- Put a corner point in `sharp` when the photo shows it square: box tops in 高 冂, joints where a diagonal meets a vertical (女 in 安), flush-cut slab corners.
- A closed loop (口 box) starts and ends in the middle of a straight side, overlapping by 0.01: `[[0.34,0.14],[0.595,0.14],...,[0.085,0.14],[0.35,0.14]]` (口). Starting at a corner leaves that corner square.
- A small counter (narrower than about 2 tapes) rounds into an oval. Cut it with a rectangle in `cuts` to keep it square (車 田: four cuts inset w/2 from the strips).

### Diagonals
- Diagonals are rare. Most ノ and 払い become a post with a foot, or a flat bar (佐's 左, 手 top, 禾 top).
- When a diagonal is needed, draw it as a one-tape slab (poly parallelogram). Cut its ends flush: vertical cut at a cell side, horizontal cut at the cell top or bottom or at the bar it hits. Put its corners in `sharp`.
- Steep slabs (ノ of 力, 又 legs) get horizontal end cuts. Shallow ones (木 legs, 扌 tick, 氵 rising stroke) get vertical end cuts.
- Alternative: a strip that runs past the cell edge, trimmed by a frame cut (four rectangles just outside the cell: x<0, x>0.68, y<0, y>1). Used in 人 会 金 式 後 代.

### Blocks with slits
- Simple glyphs use real strip outlines with open counters (口 日 田 kana).
- In dense glyphs a small 日 / 目 / 口 / 貝 becomes one solid block (poly) with hairline slits in `cuts`. Slits are 0.02-0.03 tall and stop about one tape short of the block sides.
- 書 (P): 日 = block x 0.086-0.605, y 0.64-0.98, slits y 0.745-0.765 and 0.855-0.875, x 0.221-0.47.
- 賀 (P): 貝 = block x 0.03-0.67, y 0.41-0.86, three slits x 0.13-0.57 at y 0.50 / 0.62 / 0.74.
- 東 (P): 日 = octagon block x 0.005-0.673, y 0.285-0.588, two slit rows split by the stem.
- Other examples: 暮 (P), 霊 (P), 繊 (P), 理 (田 as one block), 増.

### Dots
- A dot is a short post (about 0.1 tall) or a small square of 0.07-0.14. Never a disc in kanji.
- Dot over a roof or bar: post at the center x 0.34, y 0 to the bar (宀, 言, 方).
- Side dots (楽 率) are squares. 心's dots are short posts or squares.

### Feet and hooks
- A vertical ending at the baseline on the left of a part turns left into a foot: `[[x,top],[x,0.945],[x-0.15..0.2,0.945]]` (方 (P), 寸 in 寺 (P), 月 (P)).
- 亅 hooks (可, 寸, 刂) turn left the same way.
- 乚 hooks turn right and rise: post, base bar right, short up-tick (札 (P), 元 (P), 也).

## Left radicals

### 亻
- One post plus a short left tab at mid height. No ノ.
- Post x 0.13, y 0.03-0.99 (x 0.11 at w 0.09). Tab bar y 0.49 from x 0 to the post. Right part starts at x 0.21-0.27.
- Examples: 体 (P), 化 (P, post 0.16, tab 0.495), 佐 (P, tab 0-0.12 at 0.47, post 0.15), 何 作 信.

### 扌
- Stem x 0.12, y 0-0.99. Bar y 0.306, x 0-0.245. Rising slab poly `(0,0.777)(0.25,0.557)(0.25,0.703)(0,0.923)`, sharp at (0,0.77) and (0,0.93).
- Right part starts at x 0.29. When it starts closer, shorten the bar to 0.2 and the slab to 0.21 (提).
- Examples: 持 打 投 提. 掛 (P) is the same idea at x 0.092 with a short bar at y 0.12.

### 彳
- Two stacked ノ slabs and a post from mid height.
- Slabs: `(0.112,0)(0.24,0)(0.128,0.2)(0,0.2)` and the same shifted down to y 0.3-0.5, all corners sharp. Post x 0.185, y 0.4-1.0 (x 0.195 at w 0.09).
- Right part starts at x 0.29.
- Examples: 待 役 得 後.
- Photo variant in 行 (P), 術 (P), 街 (P): short post x 0.055 y 0.055-0.47, long post x 0.188 full height, left stub bar to the long post at y 0.6-0.8. Keep it in those glyphs.

### 忄
- Three posts, pitch w + 0.025. First two full height, third y 0-0.53. No dots.
- w 0.11: x 0.055 / 0.19 / 0.325. w 0.09: x 0.045 / 0.16 / 0.275. Right part starts at about 0.39.
- Examples: 悦 (P), 性, 情.

### 氵
- Two forms, both current.
- Three bars: short bars x 0-0.181 on the right part's top, middle and base levels (y 0.127 / 0.485 / 0.933). No dots, no diagonal. Use it when the right part has bars at those levels.
  Examples: 注 (P), 池 (P), 浜 (P), 港 (P), 法, 消.
- Two bars and a rising slab: bars x 0-0.181 at y 0.127 and 0.46, slab `(0,0.848)(0.19,0.638)(0.19,0.802)(0,1.012)`, sharp. Use it next to a dense right part.
  Examples: 江 (P, slab x 0.05-0.235), 活, 流, 派, 減.
- Right part starts at x 0.255.
- 治 (P) and 河 (P) end in a near-vertical wedge instead of the rising slab. 湖 (P) uses two small squares and a wedge.

### 言
- Dot post x 0.19, y 0.08-0.17. Bars y 0.215 (x 0.045-0.326), 0.385 and 0.555 (x 0.04-0.326). 口 loop x 0.078-0.264, y 0.725-0.93.
- Right part starts at x 0.36.
- Examples: 謹 (P), 訪, 調 (w 0.09), 認 (w 0.09, levels 0.17 / 0.35 / 0.53 / box 0.71-0.955).
- 言 at the bottom (警 (P)) or right (信) uses the same order of dot, long bar, two shorter bars, box.

### 糸
- Copy 紅.
- Strips: `[[0.055,0.07],[0.055,0.22],[0.18,0.22]]`; zigzag `[[0.18,0.07],[0.18,0.31],[0.055,0.41],[0.055,0.5],[0.36,0.5]]`; tick x 0.305 y 0.22-0.62; post x 0.18 y 0.5-0.88; dots x 0.055 y 0.64-0.88 and x 0.305 y 0.66-0.88.
- Right part starts at x 0.39.
- Examples: 紅 (P), 約, 終, 経, 統, 続.
- 組 and 結 use a w 0.09 糸 of two zigzags `[(0.18,0),(0.045,0.2),(0.2,0.2)]` and `[(0.29,0.1),(0.045,0.47),(0.33,0.47)]`. Photo signs differ: 総 (P), 線 (P, blocks), 編 (P), 維 (P, solid blob). Do not copy those for new builds.

### 木 (left)
- Bar y 0.1-0.18, x 0-0.32. Stem x 0.15-0.17 full height. Left leg: tapered wedge from under the bar down to the bottom-left, outer edge vertical at x 0.013. Right leg: shorter wedge ending about y 0.6 at x 0.3.
- 札 (P) legs: `(0.112,0.126)(0.013,0.595)(0.013,0.959)(0.112,0.547)` and `(0.209,0.126)(0.325,0.379)(0.325,0.595)(0.209,0.341)`.
- Examples: 札 (P), 格, 校. 松 (P) draws the legs as strips.

### 禾
- ノ is a full top bar the same length as the crossbar. Bars y 0.055 and 0.244, x 0.013-0.3. Stem x 0.156 full height.
- Legs are long thin triangles: inner edge vertical on the stem side, outer end vertical at the cell side: `(0.115,0.326)(0.115,0.664)(0.013,0.981)(0.013,0.643)` and mirror at x 0.196 / 0.3.
- Examples: 和 (P), 利, 税.

### 礻 / 衤
- Dot post x 0.15 y 0-0.13. Bar y 0.19-0.2 that bends into a diagonal to the left edge at y 0.58, or a short bar to x 0.24. Post x 0.15-0.17 from y 0.36 to 1.0. Short right tab at y 0.5-0.56.
- 衤 adds a second tab at y 0.76.
- Examples: 社, 神, 視, 補.

### 土 / 王 (left)
- 土: post x 0.12-0.14, top bar y 0.12-0.3, bottom stroke a short bar or a rising slab `(0,0.93)->(0.26,0.74)`.
- 地 (P): top bar shared with 也 at y 0.125, bottom bar y 0.58, post x 0.142.
- 王: three bars x 0-0.27 and a stem x 0.135. 理: bars 0.1 / 0.45 / 0.8. 現 (P): bars 0.12 / 0.35 / 0.585 (top 60% only).
- Examples: 地 (P), 現 (P), 境, 理.

### 阝 (left)
- One zigzag strip with the post: `[[0.055,0.973],[0.055,0.1],[0.245,0.1],[0.245,0.33],[0.185,0.33],[0.185,0.6],[0.245,0.6],[0.245,0.905],[0.15,0.905]]`.
- Right part starts at x 0.33.
- Examples: 階 (P), 院, 防.

### 阝 (right)
- Post x 0.40-0.41 full height. "3" strip from the top: bar right to x 0.61-0.625, down to 0.40-0.42, jog left 0.06, down from 0.50-0.52, foot left at 0.86.
- 部 (P): `[[0.03,0.08],[0.61,0.08],[0.61,0.42],[0.55,0.42],[0.55,0.52],[0.61,0.52],[0.61,0.86],[0.4,0.86]]`, top bar shared with 立.
- Examples: 部 (P), 都.

### 月 (left) and 方 (left)
- 月 left: one strip `[(0.055,1),(0.055,0.06),(0.22,0.06),(0.22,0.945),(0.13,0.945)]` plus bars y 0.36 / 0.64 (勝, w 0.09).
- 方 left: dot, bar y 0.1, post x 0.09 with left foot, 𠃌 from y 0.38 to the base with a foot left (放 施).

### 車 (left)
- 転 (P) strips squeezed into x 0.05-0.39: top bar, 田 box with middle bar, bottom bar, center stem full height. Counters cut square. At w 0.09 fill the box and cut four slits (輸).

## Top components

### 宀
- Dot post at x 0.34 from y 0 to the roof bar. Roof: one strip leg-bar-leg `[[0.055,yl],[0.055,yb],[0.625,yb],[0.625,yl]]`.
- Roof bar yb 0.09-0.2. Legs end at yl 0.28-0.54 (shorter when a box follows below).
- Examples: 安 (P, bar 0.094, legs to 0.29), 室 (P, bar 0.113, legs to 0.544), 字 (P, bar 0.2), 富 (P), 宿 (P), 定.
- Over a box: roof at 0.094 with legs only to 0.23-0.25, so the box can start at 0.3 (官 容).

### 冖
- Same as 宀 without the dot: `[[0.055,0.38],[0.055,0.055],[0.625,0.055],[0.625,0.38]]` (写 (P)).
- 営 (P): bar y 0.232, legs to 0.434. Over 車 (運 軍): w 0.09, legs at x 0.24 / 0.66 to y 0.2.

### 艹
- One full-width bar y 0.1-0.155 with two short posts crossing it from y 0 to 0.1-0.3.
- 夢 (P): bar y 0.115, posts x 0.163 / 0.46 from y 0. 藤 (P): bar 0.155, posts x 0.347 / 0.613, y 0.03-0.29. 暮 (P): posts as small blocks above the bar.

### 人 / 𠆢 roof
- Four forms are in use. Pick by the part below.
- Two diagonals from an apex post, run past the sides and trimmed by a frame cut: `[[0.34,0],[0.34,0.05],[-0.04,0.44]]` and `[[0.34,0.05],[0.72,0.44]]` (会 合 金).
- Two flush-cut slabs from the apex (y 0) to the sides at y 0.21-0.35, ends cut vertical (食; 領 at half width x 0-0.33).
- Two Γ shapes with a gap at the center: `[[0.3,0.075],[0.055,0.075],[0.055,0.28]]` and mirror (全 (P)).
- A ∩ box `[[0.056,0.366],[0.056,0.055],[0.614,0.055],[0.614,0.366]]` with the 一 floating inside at y 0.27 (今 (P), 令 (P)).
- Small 人 inside 座 (P): short post splitting into two short diagonals.

### 立 / ⺌ / 丷
- 立: dot, top bar, two posts forming a box, bottom bar. Bars full width (部 (P), 意 (P)).
- ⺌ / ⺍: three short ticks y 0-0.13 (学: three short slanted strips).
- 丷 on a bar: two small tabs on the top bar (前 (P): x 0.21-0.29 and 0.39-0.46, y 0.01-0.06), or two flush-cut parallelograms y 0.02-0.14 with the box starting at 0.19 (増).

### 广 / 疒
- Dot post at x 0.4-0.42 above the bar. Bar y 0.095-0.175 from the post to the right edge. Post x 0.08-0.18 down to y 0.86-0.93 with a rounded foot to the left edge.
- 広 (P): `[[0.177,0.095],[0.177,0.856],[0.055,0.856]]`. 府 (P): one strip from the right edge `[[0.68,0.175],[0.08,0.175],[0.08,0.93],[0,0.93]]`.
- 疒 adds two dots as small tabs on the left of the post (疲 (P), 病).
- Examples: 広 (P), 府 (P), 店.

### ⺮
- Two L's `[(0.06,0.22),(0.06,0.06),(0.3,0.06)]` and the same at x 0.4, plus tick posts x 0.2 / 0.54, y 0.12-0.22 (第 策).

## Enclosures and boxes

### 口
- Closed loop started mid-top. 口 (P): x 0.085-0.595, y 0.14-0.915.
- As a small part: loop plus a square cut counter (品 (P), 部 (P) 口 x 0.11-0.26). Too small for strips: block with one slit (減's 咸).

### 日 / 目
- Loop at the edge-to-edge centers plus middle bars. 日 (P): loop x 0.055-0.625, y 0.055-0.945, bar 0.456.
- 目: bars at thirds. 見: 目 loop y 0.055-0.6, bars 0.24 / 0.42.
- Inside a dense glyph: block with slits (see General rules).
- Examples: 日 (P), 明 (P), 見, 書 (P).

### 田
- Loop plus center stem and middle bar, all one tape. 田 (P): loop x 0.055-0.625, y 0.055-0.945, stem 0.34, bar 0.5.
- Small 田: cut the four counters square (車 (P): box x 0.09-0.574, y 0.297-0.609).
- In a 0.36-wide part or a dense glyph: one block with four slits (理, 増).
- Examples: 田 (P), 里 (P), 界 (P), 車 (P).

### 冂 / 囗
- 冂: left post to y 1, top bar, right post ending in a foot (同 内).
- 囗: closed loop at the edge-to-edge centers. Inner parts stay about 0.05 off the frame (国 回 四).
- 冂 corners: 高 (P) keeps the top-left square.

### 門
- Each door is one strip: outer post full height, top bar, inner post to y 0.5, bar back to the outer post. One middle rung each.
- Left door `[[0.055,0.99],[0.055,0.059],[0.269,0.059],[0.269,0.513],[0.055,0.513]]` plus rung y 0.289. Right door mirrors at x 0.407 / 0.625.
- Inner part sits at x 0.19-0.49, y 0.6-0.93.
- Examples: 開 (P), 関 (P, doors to y 0.4), 間, 問.

### 貝
- Strip form: loop y 0.36-0.8 with bars 0.507 / 0.653, two foot slabs `(0.1,0.85)(0.24,0.85)(0.16,0.99)(0.02,0.99)` and mirror (員).
- Block form: solid block with three slits plus the two foot slabs (賀 (P), 資).
- 賢 (P) and 側 (P) use variants (hairline slits, inverted-V cut). Prefer the 賀 block.

### 頁
- Top bar, short stub to the box, 目 box with two bars and three cut counters, two foot slabs under it.
- 領: top bar from x 0.37, stub x 0.525, box x 0.425-0.625, y 0.235-0.70, feet end at y 0.87.
- Examples: 頭 (P), 領, 題.

## Right and bottom components

### 刂
- Short post x 0.47, y 0.12-0.66. Long post x 0.625, y 0-0.945 with a foot left to x 0.45.
- Left part must end by x 0.37.
- Examples: 利, 判, 別. 側 (P) uses the same at w 0.09 (x 0.475 / 0.62).

### 攵
- Short post x 0.43 y 0.015-0.28. Bar y 0.11, x 0.36-0.665. X of two slabs filling x 0.36-0.665 from y 0.27 down, cut at the base.
- 改 (P) slabs: `(0.36,0.267)(0.665,0.817)(0.665,1.043)(0.36,0.493)` and the mirror. They run below y 1 and the outline clip trims them.
- Examples: 改 (P), 教, 政.

### 又 / 夂 / 殳
- 又: bar, then two crossing slabs cut at the base and the right edge (取: bar y 0.1, slabs from y 0.15 / 0.32 to y 1).
- 殳 / 又 as one strip: bar, short drop, long diagonal down-left, plus a crossing diagonal that starts at the bar's left end. 段 (P): `[[0.352,0.479],[0.605,0.479],[0.605,0.604],[0.356,0.921]]` and `[[0.356,0.583],[0.644,0.934]]`. 几 above as an inverted U with a right foot.
- 夂: ク strip (short start, top bar, long diagonal to the bottom-left) plus one crossing ㇏ strip, ends trimmed by the frame (各 変 終). 路 (P) draws the frame as a ∩ with an X below.
- Examples: 段 (P), 路 (P), 取, 投, 役, 各.

### 戈
- Copy 式. Post x 0.44 from y 0 to 0.45, then the same strip bends into a diagonal to (0.7,1.02), trimmed by the frame cut. Dot: short strip (0.56,0.02)-(0.64,0.13). Bar y 0.25 crosses the post.
- Examples: 式, 職 (post at 0.5).
- 成 (P) keeps its photo form: post x 0.466 to y 0.8, a separate slab from the lower left to the right edge, dot bar, small hook.

### 心
- Left short post (dot), an L-hook strip with an up-tick, two dots as short posts or squares between them.
- Full size: 心 `[[0.21,0.2],[0.21,0.945],[0.5,0.945],[0.5,0.7]]`, left post x 0.055 y 0.42-0.8, dots x 0.37 and 0.625.
- As a bottom: copy 意 (P) at y 0.783-0.994 (slanted left dot block, U strip `[[0.26,0.783],[0.26,0.944],[0.62,0.944],[0.62,0.783]]`, two square dots). Or 窓 (P) / 思 style: left L with foot to the left edge, middle U, two short posts.
- Examples: 意 (P), 窓 (P), 急 (P), 心, 思, 念.

### 女
- Full bar, then two crossing strips, each vertical → diagonal → horizontal foot. Put the vertical/diagonal joints in `sharp`.
- 女: bar y 0.42, `[[0.17,0.03],[0.17,0.62],[0.47,0.945],[0.68,0.945]]` and `[[0.51,0.03],[0.51,0.64],[0.24,0.945],[0,0.945]]`.
- Examples: 安 (P), 女, 要, 数.

### 木 / 大 / 八 legs (bottom)
- Two slabs from the stem just under the bar to the bottom corners, outer ends cut vertical or flush with the base.
- 大 (P): bar y 0.22, stem 0-0.5, legs `(0.34,0.4)(0.34,0.578)(0.016,0.99)(0,0.99)(0,0.832)` and mirror.
- 本 (P): A-frame slabs from y 0.27 to the base, crossbar y 0.835. 東 (P): flat legs from the block to the sides. 界 (P): shallow legs to y 0.74-0.88.
- Examples: 大 (P), 本 (P), 東 (P), 界 (P), 条, 楽.

### 儿
- Two posts with feet turned opposite ways: left post foot left, right post foot right and an up-tick.
- 元 (P): `[[0.251,0.453],[0.251,0.945],[0,0.945]]` and `[[0.426,0.453],[0.426,0.945],[0.62,0.945],[0.62,0.635]]`.
- Examples: 元 (P), 完 (P), 見, 先.

### 小
- Center stem full height, one flush-cut left slab, one right post (小 (P)). Under another part: center stem plus two small wedges.

### 寸 / 寺
- 寺 (P): three full bars y 0.092 / 0.306 / 0.51, top stem only between bar 1 and 2, hook post x 0.467 from 0.413 with a foot left, dot as a short post at the left.

### 方
- 方 (P): dot post x 0.324, bar y 0.078 full width, post x 0.177 with a foot to the left edge, 𠃌 `[[0.177,0.333],[0.623,0.333],[0.623,0.945],[0.454,0.945]]`.
- On the right (防 訪): dot, bar y 0.17, 𠃌 from y 0.47 with foot left, ノ as a slab flush at both ends.

### ム
- One slanted strip or slab into a base bar, plus a short post on the right crossing the bar. Keep the post 0.1 clear of the slant top.
- Examples: 広 (P) `[[0.41,0.375],[0.315,0.86],[0.613,0.86]]` + post x 0.613, 治 (P), 窓 (P), 統, 流.

### 月 (right or whole)
- One strip: left post full height, top bar, right post down with a short foot left. Two rungs.
- 月 (P): `[[0.078,0.984],[0.078,0.167],[0.628,0.167],[0.628,0.925],[0.5,0.925]]`, rungs 0.388 / 0.628.
- Examples: 月 (P), 前 (P), 有.

### 辶
- Dot bar at the top left, an L or post down to the base, and a full-width base bar at y 0.94 under the right part.
- 通 (P): dot bar y 0.113 x 0-0.193, L `[[0,0.453],[0.131,0.453],[0.131,0.94]]`, base bar y 0.94. Right part starts at x 0.21 and stays above y 0.84.
- 道 (P): dot bar y 0.15, plain post x 0.095 from 0.27, base bar 0.945.
- Examples: 通 (P), 道 (P), 送, 近, 連 (w 0.09).

### Other parts
- 也: bar from the top, right column turning back left, left stem turning into a bottom bar with an up-tick (池 (P), 地 (P)).
- 匕: post from the top, bar right, rounded foot right at the base (化 (P): `[[0.353,0.03],[0.353,0.93],[0.653,0.93]]` + bar y 0.185).
- 子: ⊐ hook at the top, stem with a foot left, full crossbar (字 (P)).
- 山: three posts, outer ones joined by the base bar (山 (P), 崎 (P)).
- 火: stem, two side dots as short posts or blocks, two leg slabs (秋 (P), 談).
- 金: copy 金 (roof diagonals, bars 0.4 / 0.62, stem, two short dot strips, base bar).
- 食: slab roof, three bars on a ∩ box, left post down with a foot, tail slab (食).
- 隹: two posts and four bars stacked with thin gaps, a stub bar to the left edge for 亻 (集 (P)).

## Kana strokes

- Curves are polylines of horizontal and vertical strips with rounded outer bends. Inner bends are square.
- Left stem x 0.055. Right edge strip x 0.625. Top bar 0.055, or 0.15-0.17 when a stem pokes above it. Base 0.945.
- Hook / bowl (つ コ フ ワ): bar, rounded bend, post, rounded bend, base bar back left. プ (P): `[[0,0.055],[0.625,0.055],[0.625,0.945],[0.19,0.945]]`.
- Loops are boxes, not curves. Small loop left of a stem (す む): `[[sx,0.38],[0.14,0.38],[0.14,0.66],[sx,0.66]]`. Inner tail loop (る ぬ ね) closes at the bottom right.
- お / よ / ば loop: one strip, right leg up from the base, band left, left leg down, bottom bar right, up into the stem. The right leg hangs free (ば (P)).
- ノ in katakana (ナ ケ ソ): a post that bends into a foot running left along the bottom.
- ツ ッ ソ ン ticks: parallelograms cut vertical at both ends (ッ (P)).
- く: one strip `(0.6,-0.1)->(0.08,0.5)->(0.6,1.1)` cut flat at y 0 and 1.
- 、: one slab cut vertical at both ends, sloping down to the right (、 (P)).
- Examples: か (P), ら (P), つ (P), ど (P), ば (P), ぷ (P), ア (P), ブ (P).

### Dakuten
- Hiragana: two vertical strips at the top right, x 0.475-0.54 and 0.625, y 0-0.25 to 0.33 (ど (P), ば (P)). が (P) uses two small blocks.
- Katakana: two discs r 0.06 at (0.48,0.075) and (0.615,0.075) (ブ (P), ガ).
- Make room by moving the base, never the mark. Keep base ink out of x > 0.42, y < 0.29. Lower the top bar to about 0.22-0.23 (ブ (P), ガ グ ダ). Start verticals at the top right at y 0.2-0.24 (パ, ゾ). Move stems left (ザ: stems 0.09 / 0.355, discs r 0.055).

### Handakuten
- A ring: disc outer r 0.1 with a hole r 0.035-0.04 in `cuts`.
- Hiragana: center (0.565,0.13) (ぷ (P)). Katakana: center (0.58,0.1) with the top bar lowered to 0.28 (パ ピ ポ).
- プ (P) knocks the ring into the right stem at (0.58,0.33).

### Small kana
- Draw at about 0.65 of the cell, sitting on the baseline, tape still 0.11. Map the full-size centerlines: x' = 0.34 + 0.65 (x - 0.34), y' = 1 - 0.65 (1 - y).
- Redraw slabs one tape wide after scaling. Shorten hook ends near stems, since gaps shrink by about 0.04.
- Examples: ァ ャ ゃ ぁ. っ (P) and ッ (P) are photo forms with their own aspect.

## Marks
- ー (P): one bar y 0.5, x 0.068-0.612.
- 。 (P): small loop x 0.095-0.285, y 0.715-0.905 at the lower left.
- ・ (P): one square of one tape at y 0.432 (aspect 1.0).
- Marks in `tape.MARKS` keep their own size and place. Everything else is stretched up to 1.15x to fill the cell.

## Latin and digits
- Natural narrow aspect 0.45-0.68, full cell height, w 0.11. Strip centers at 0.055 from the cell edges.
- Built from bars and posts with rounded bends. Diagonals are one-tape slabs with horizontal end cuts at y 0 and 1.
- E (P, aspect 0.5): `[[0.5,0.055],[0.055,0.055],[0.055,0.945],[0.5,0.945]]` + bar y 0.5.
- O (P, aspect 0.6): closed loop x 0.07-0.53, y 0.07-0.93.
- S (P, aspect 0.58): one zigzag strip, top bar, left down, middle bar 0.463, right down, base bar.
- A (P): inverted U plus a crossbar at 0.453. K (P): post plus two slabs. V: two slabs meeting at a flat foot.
- F L P are E or R minus strips. M is A plus a middle post.
- Examples: A E H O S K (P), 0-9 (P, aspect 0.58).
