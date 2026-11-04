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

## Simplified Chinese radicals

- Narrow left parts, ink x 0-0.28. The same centerlines at w 0.11 and at w 0.09 (dense chars).
- 竖提 is a post with a short foot to the right ending at x 0.28 (no up-tick: it would merge with the post).
- Right part starts at about x 0.33-0.34 (0.32-0.33 next to 纟).
- Copy the strips exactly. Examples: 说 计 记 (讠), 经 红 结 (纟), 钱 错 铁 (钅), 饭 (饣).

### 讠
- Dot post x 0.13, y 0.04-0.2. 横折提 as one strip `[[0,0.4],[0.13,0.4],[0.13,0.945],[0.28,0.945]]`.
- Put a right-part bar on 0.40 when it has one there (计 让 记).

### 纟
- Top from 紅: `[[0.055,0.03],[0.055,0.22],[0.18,0.22]]` and `[[0.18,0.03],[0.18,0.31],[0.055,0.41],[0.055,0.52],[0.27,0.52]]`.
- 提 as a rising slab, vertical end cuts: `(0,0.935)(0.27,0.765)(0.27,0.635)(0,0.805)`, all corners sharp.

### 钅
- ノ post into the first short bar (午): `[[0.055,0],[0.055,0.2],[0.27,0.2]]`.
- Bars `[[0,0.44],[0.27,0.44]]` and `[[0.02,0.69],[0.27,0.69]]`.
- 竖提: `[[0.13,0.2],[0.13,0.945],[0.28,0.945]]`.

### 饣
- ノ slab from 彳: `(0.112,0)(0.24,0)(0.128,0.2)(0,0.2)`, sharp.
- 横钩 and 竖提 as one strip: `[[0.28,0.945],[0.07,0.945],[0.07,0.33],[0.22,0.33],[0.22,0.5]]`.

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

## Simplified Chinese components (门 贝 车 见 马 页 鸟)

Built for the GB forms, w 0.11 unless noted. Each keeps fewer strokes than the traditional 門 貝 車 見 馬 頁 鳥 above: no inner rungs, no doubled doors, an open ∩ frame where the traditional part has a closed 目 box. Copy the numbers. Slabs are one-tape parallelograms with horizontal end cuts, corners in `sharp`.

### 门
- Full / enclosure (门 问 间): dot post x 0.13 y 0-0.13. Left post x 0.055 y 0.22-1.0. 𠃌 `[[0.23,0.11],[0.625,0.11],[0.625,0.945],[0.45,0.945]]`.
- Inside part sits at x 0.21-0.46: 口 loop y 0.42-0.76 (问), 日 loop y 0.33-0.84 with bar 0.585 (间).
- Right of 亻 (们): dot x 0.375 y 0-0.13, left post x 0.3 y 0.22-1.0, 𠃌 `[[0.475,0.11],[0.625,0.11],[0.625,0.945],[0.5,0.945]]`.

### 车
- Full (车): top bar y 0.17 x 0.04-0.64. 撇折 as one strip from above the top bar, diagonal into the middle bar: `[[0.40,-0.05],[0.14,0.5],[0.64,0.5]]`, trimmed by a frame cut. Stem x 0.42 y 0.5-1.0 (starts at the middle bar, not at the top). Low bar y 0.8 x 0-0.68.
- Under 冖 (军): same strips with levels 0.36 / 0.62 / 0.85, diagonal from y 0.17. In 连 scaled into x 0.21-0.68, y 0-0.84 (bars 0.14 / 0.42 / 0.68).
- Left (转 轻): top bar y 0.2 x 0-0.34, `[[0.25,-0.05],[0.07,0.48],[0.34,0.48]]`, stem x 0.2 y 0.48-1.0, low bar y 0.78 x 0-0.34. Right part starts at x 0.38. In 载 (w 0.09) the same form sits at y 0.3-1.0 (bars 0.48 / 0.67 / 0.87).

### 见
- Full (见, and 觉 squeezed to y 0.42-1.0): ∩ frame `[[0.1,0.6],[0.1,0.055],[0.58,0.055],[0.58,0.6]]`. ノ post x 0.25 from y 0.22 with a foot left to x 0. 乚 post x 0.43 from y 0.4, foot right to 0.625, up-tick to 0.75. Both legs start inside the open frame.
- Right (现 视 观, x 0.29-0.68): frame `[[0.345,0.56],[0.345,0.08],[0.625,0.08],[0.625,0.56]]`. One center stem x 0.485 from y 0.24 to the base with a foot right to 0.68 (乚). ノ branches off it: `[[0.485,0.62],[0.35,0.945],[0.2,0.945]]`. Left part must end its ink by x 0.29.

### 马
- Full (马): 𠃍 `[[0.045,0.055],[0.55,0.055],[0.55,0.3]]`. ㇉ `[[0.1,0.055],[0.1,0.45],[0.625,0.45],[0.625,0.945],[0.45,0.945]]`. Low bar y 0.72 x 0-0.5. The 𠃍 post stops short of the middle bar, so no box closes.
- Narrow, x0 = 0 (left, 验) or 0.325 (right, 妈): `[[x0,0.06],[x0+0.24,0.06],[x0+0.24,0.27]]`, `[[x0+0.05,0.06],[x0+0.05,0.43],[x0+0.3,0.43],[x0+0.3,0.93],[x0+0.19,0.93]]`, low bar y 0.69 x x0-x0+0.19.

### 贝
- ∩ frame plus 人 (ノ and 丶) as two flush-cut slabs from one apex. Not the 貝 block with slits.
- Bottom (资 负 责 费): frame posts x 0.1 / 0.58 from y0 down to yb = y0 + 0.55 (1 - y0). Stem x 0.34 from y0 + 0.11 to yb. Slabs from apex (0.34, yb) to (0.15, 1) and (0.53, 1). y0: 资 0.55, 负 0.42, 责 0.45 (w 0.09), 费 0.53 (w 0.09).
- Left (则 购): frame `[[0.055,0.58],[0.055,0.07],[0.3,0.07],[0.3,0.58]]`, slabs from apex (0.1775, 0.62) to (0.04, 0.97) and (0.315, 0.97). The interior is too narrow for a stem, so the 人 starts at the opening. Right part starts at x 0.4.

### 页
- 页 = top bar + short stub + the narrow 贝. Right only (题 领 须 顶 顿).
- w 0.11 (领 须 顶): bar y 0.055 x 0.37-0.68, stub x 0.525 y 0.055-0.2, frame posts x 0.425 / 0.625 from y 0.25 to 0.57, slabs from apex (0.525, 0.6) to (0.4, 0.9) and (0.65, 0.9).
- w 0.09 (题 顿): bar y 0.05 x 0.35-0.68, stub x 0.515 y 0.05-0.18, frame posts x 0.4 / 0.635 from y 0.21 to 0.56, slabs from apex (0.5175, 0.59) to (0.39, 0.88) and (0.645, 0.88). Feet end at 0.88 so a base bar (是) can pass under.

### 鸟
- Full 鸟: ノ tick `[[0.4,-0.02],[0.32,0.1]]`; 𠃍 `[[0.12,0.12],[0.56,0.12],[0.56,0.36]]` (stops short of the bar below, box stays open); dot post x 0.33 y 0.22-0.33; ㇉ `[[0.12,0.12],[0.12,0.47],[0.625,0.47],[0.625,0.945],[0.5,0.945]]`; low bar y 0.72 x 0-0.5 (as 马).
- In 岛 the low bar is dropped and 山 sits inside: U `[[0.05,0.62],[0.05,0.86],[0.42,0.86],[0.42,0.62]]` + post x 0.235. Compare 島, which keeps the 目 box.

### Complex characters (w 0.07–0.09): C1
- w 0.08 for the group, 0.07 for 儡 嚇 囊. Same centerlines as below in every char that uses the part. Frame cut on all.
- ⺮: `[[0.04,0.17],[0.04,0.04],[0.28,0.04]]` + tick x 0.17 y 0.09-0.17; same at x 0.39 / 0.66, tick 0.53. Rest starts at y 0.2 (築 篙 篤 篮 篱 篷 簇 簡 簧 簿 籍 籠 篡).
- 口 left: loop on ink x 0-0.22, y 0.3-0.68; right part x 0.27-0.68 (嘴 噬 噪 嚇 嚎 嚏 嚷 嚼).
- 月 left: `[[0.04,1],[0.04,0.04],[0.2,0.04],[0.2,0.96],[0.12,0.96]]`, rungs 0.34 / 0.63; right part from 0.29 (膨 膳 臃 臆). 月 below: `[[0.14,1],[0.14,0.62],[0.56,0.62],[0.56,0.96],[0.46,0.96]]`, rungs 0.74 / 0.85 (臀 臂).
- 土 left: post x 0.11 y 0.2-0.86, bar y 0.38 x 0.01-0.22, rising slab (0,0.93)-(0.23,0.77) (壇 壕 壤). 土 below: bar y 0.72 x 0.12-0.56, stem x 0.34, base 0.955 (壁 墾).
- 亻: post x 0.12, tab y 0.46 (儒 償 儡). 心 below: 意 form at y 0.8, U `[[0.24,0.8],[0.24,0.96],[0.58,0.96],[0.58,0.92]]`, dots x 0.36-0.44 inside, 0.6-0.68 above the hook (憩 憲 懇 懲 懸).
- Shared right parts at x 0.24/0.27-0.68: 需 (儒 孺), 豪 (嚎 壕), 襄 (嚷 壤), 辟 at y 0-0.55 (臂 壁), 豸艮 at y 0-0.62 (墾 懇). Copy them from those glyphs.
- 口 too small for strips becomes a block with slits or a square hole (篡 目, 懸 目, 囊 口, 壇 inner 口). 田 pairs in 儡 share their middle post.

### Complex characters (w 0.07–0.09): C4
- w 0.07 for the whole group. Frame cut on all. Copy centerlines from the glyph named in brackets.
- 言 left (諦 諧 諭 諮 諾 謀): dot x 0.13 y 0-0.09, bars y 0.16 (x 0-0.26), 0.29 / 0.42 (x 0.025-0.235), 口 loop ink x 0.02-0.24, y 0.55-0.94. Right part from x 0.29.
- 糸 left (績 織 繕 繰; 羅 squeezed to y 0.29-1): zigzags `[[0.16,-0.03],[0.035,0.18],[0.18,0.18]]`, `[[0.255,0.07],[0.035,0.44],[0.26,0.44]]`, tick x 0.225 y 0.3-0.44, stem x 0.145 from 0.44, dots x 0.035 / 0.245 y 0.6-0.88. Right part from 0.31.
- 艹 top: bar y 0.06 x 0.02-0.66, posts x 0.2 / 0.48 y 0-0.125. Content starts at ink y 0.155 (蕾 薄 薛 薦 薪 薯 藉 藍 藏 藐 藕 藩 藻 蘑 蘸 繭).
- 氵 under 艹: bars y 0.25 / 0.5 x 0-0.14, rising slab (0,0.93)-(0.16,0.73), cut vertical (薄 藩 藻).
- 耒 left: bars 0.07 / 0.19 / 0.31 of the height under y0, stem x 0.14, leg slabs under the third bar (耪 full height, 藉 藕 from y 0.16).
- 虫 left: box ink x 0-0.28, y 0.18-0.58 split by the stem (counters 0.035), stem from 0.06, base bar 0.93, square dot x 0.215-0.28 between (螟 螺 蠕). Below (蟹 蠢): same with a flat box; 蠢 puts the dot as a tab on the base bar.
- 羽 (翰 翱 翻 翼 耀): two Γ hooks with 0.03 between; each tick is a small square inside the hook. 隹 (罐 羅 耀 蘸): ノ slab, left post, stem from the top, three short bars right of the post, base bar joining the post.
- 臣 (臨 藏, 監 in 艦 藍): top bar, left post, base bar, inner box on the post with a mid bar. Needs about 0.47 of height for open counters, so 藍 gives 臣 0.6 of its height. 皿: ∩ frame with two inner posts on a wider base bar.
- Shared parts: 釆 (翻 藩), 喿 (繰 藻), 亲 left (薪 親), 雨 (蕾 需 in 蠕), 𧘇 (襄 襲).
- Hairline 0.02 slits only where four verticals share 0.33 or less: 酉 in 蘸, 繭 inner 糸 dots and 虫 block, 興 middle.

### Complex characters (w 0.07–0.09): C5
- w 0.07 for the whole group. Left radicals keep ink x 0-0.28; right part ink x 0.31/0.32-0.68. Same centerlines in every char that uses the part.
- 言 left: dot x 0.14 y 0-0.12, bars y 0.16 (x 0-0.28) / 0.31 / 0.46 (x 0.04-0.24), 口 loop x 0.06-0.22, y 0.62-0.94 (謁 謎 謙 講 謝 識 譜).
- 足 left: 口 loop x 0.05-0.23, y 0.05-0.36; stem x 0.165 y 0.36-0.95; tab y 0.62 to 0.28; left post x 0.04 y 0.58-0.95; base y 0.95 x 0-0.28 (蹄 … 躍).
- 金 left: roof slabs from (0.14,0) to (0.03,0.2) / (0.25,0.2); bars 0.30 (x 0.04-0.24) and 0.46 (x 0-0.28); stem x 0.14 y 0.30-0.92; dots as squares x 0-0.065 / 0.215-0.28, y 0.57-0.71; base 0.92 (鋼 … 鎖).
- 酉 left: bar y 0.05, block x 0-0.28 y 0.15-0.97 with two 0.04 slits (x 0.07-0.11, 0.17-0.21, y 0.22-0.56) and a counter x 0.07-0.21 y 0.63-0.90, so the 儿 legs read as posts (醒 醚 醛 醜).
- 貝 left (購 贈): loop x 0.04-0.24, y 0.05-0.71, bars 0.27 / 0.49, foot slabs (0.08,0.78)-(0.03,1) and (0.20,0.78)-(0.25,1). 贝 left (赠 赡): standard 贝 left squeezed to x 0.04-0.24.
- 車 left (轄): bars 0.05 / 0.78 x 0-0.28, stem x 0.14, 田 xs 0.035 / 0.14 / 0.245, ys 0.19 / 0.38 / 0.57 with cut counters. 车 left (辙): standard 车 left squeezed to x 0-0.24.
- 辶 (避 邀 還): dot bar y 0.10 x 0-0.12, L `[[0,0.40],[0.08,0.40],[0.08,0.955]]`, base y 0.955 to 0.68. Right part x 0.17-0.68, y 0-0.86.
- 辛 narrow (辨 辩 辫, and 避 at 0.86 height): 0.2 wide around cx: dot, bars 0.14 / 0.40 / 0.62, 丷 posts at cx±0.06 y 0.23-0.40, stem from 0.40 to the base. cx 0.10 left, 0.58 right; middle part sits in x 0.23-0.45.
- Shared right parts: 冓 (講 購), 曽/曾 (贈 赠 蹭), 迷 (謎 醚), 害 (轄, moved to the left half in 豁).
- 口 too small for strip walls becomes a block with a square counter, walls 0.045 (錮 鍋 譬); 山 in 岡 is a block with two slits (鋼).

### Complex characters (w 0.07–0.09): C2
- w 0.07 for the whole group. Pitch between parallel centerlines 0.1 (white 0.03). Edge centers 0.035 / 0.645. Frame cut on all.
- 忄: posts x 0.035 / 0.135 full height, x 0.235 y 0-0.53. Right part from 0.34 (憶 憾 懈 懒 懦).
- 扌: stem x 0.09, bar y 0.27 x 0-0.2, rising slab (0,0.84)-(0.2,0.65) cut vertical. Right part from 0.27 (撼 擁 擂 擅 操 擞 擦 擬 攒 攘 攫).
- 木 left: bar y 0.17 x 0-0.28, stem x 0.14, legs `[[0.11,0.23],[0.035,0.58],[0.035,0.965]]` and `[[0.17,0.23],[0.25,0.6]]`. Right part from 0.35 (樹 橇 橋 橙 橱 檀 檄 檬 欄).
- 氵: bars x 0-0.16 at y 0.11 / 0.39, rising slab (0,0.93)-(0.17,0.66) cut vertical. Right part from 0.24 (潞 澡 激 濁 濃 濒 濫 濯 瀑 灌).
- 日 left: loop x 0.035-0.175, y 0.2-0.8, bar 0.5. Right part from 0.28 (曖 曙 曜 曝).
- 火 left: dot post x 0.03 y 0.26-0.44, right dot (0.25,0.22)-(0.21,0.4), stem x 0.13 to y 0.58 then diagonal off the bottom left, dot (0.165,0.68)-(0.26,0.84). Right part from 0.34 (燃 燎 燥 爆).
- 心 below a right part: four columns at x 0.34 / 0.44 / 0.54 / 0.64 from y 0.74: left dot, hook post with foot right to the edge, two dots (憶 憾 撼).
- 隹: post L, stem L+0.1, dot L+0.2 at the top, ノ strip from the stem top to the post, three bars right of the stem, base bar from the post (擁 曜 濯 灌 戳 攫).
- Shared right parts drawn with the same construction, x scaled to the region: 感 (憾 撼), 亶 (擅 檀), 喿 (操 澡 燥), 敫 (檄 激), 翟 (曜 濯, narrow in 戳), 暴 (曝 瀑 爆).
- Where three columns do not fit (角 in 懈, 束 in 懒, 目目 in 攫, 柬 in 欄, 负 in 懒) the part is a block with 0.02-0.05 cut counters.

### Complex characters (w 0.07–0.09): C6
- w 0.08 where the part has room, 0.07 for the dense ones. Frame cut on all. Copy centerlines from the glyph named in brackets.
- 金 left: the C5 金 as is, ink x 0-0.28; right part from ink 0.31 (鎮 鏡 鐘 鑑). 钅: the standard one unchanged; right part from 0.33 (镜 … 镶).
- 雨 top, full width, y 0-0.345: bar 0.035, frame `[[0.045,0.345],[0.045,0.15],[0.635,0.15],[0.635,0.345]]`, stem x 0.34, dots as 0.03 bars x 0.13-0.25 / 0.43-0.55 at y 0.22 and 0.285. Lower part ink from y 0.38 (霍 霓 霖 霜 霞 霧 露 霸 霹). Narrow 雨 in 镭 hangs the dots as tabs on the side posts.
- 頁 right (JA): bar y 0.045 x 0.36-0.68, stub x 0.52, loop x 0.41-0.635 y 0.2-0.74, rungs 0.335 / 0.47 / 0.605, foot slabs (0.46,0.8)-(0.42,0.95) and mirror (頰 頻 額 顎 願 類 顧). 页 right (GB): the w 0.09 standard with feet run to 0.94 (颠 颤 颧).
- 革 left: bar 0.1, 廿 posts x 0.07 / 0.24 to a bar at 0.26, 口 loop x 0.04-0.27 y 0.38-0.58 on a stem x 0.155, long bar 0.74 (鞘 鞠 鞭; 霸 squeezes it to y 0.38-1).
- 馬 (JA): post, center stem, four bar levels over the top 62%, the last one bending into the hook post, four square dots below; scaled into the region (騎 left, 騰 and 驚 bottom).
- 隹: ノ strip into the post, stem from the top as the dot, three bars right of the stem, base bar from the post (雕 離; wide under 雨 in 霍; narrow in 顧 颧).
- 麻: 广 frame (dot x 0.40, bar 0.09, post 0.06) with two small 木 at y 0.15-0.46 (靡 魔). 鬼: tick, 田 box across the width, left leg, 乚, ム right of the 乚 (魏 魔).
- 京 right: dot, bar 0.1, 口 loop y 0.22-0.44, hook stem, two square side dots (鯨 鲸). 魚 left copies 鮮; 鱼 left is the same with one base bar at 0.8.
- 口 too small for strip walls becomes a block with a square counter (吅 in 顎 颧, inner 口 of 亶 in 颤).

### Complex characters (w 0.07–0.09): C3
- w 0.07 for the whole group. Pitch between parallel centerlines 0.105 (white 0.035). Edge centers 0.035 / 0.645. Frame cut on all.
- 犭: slab (0,0.02)-(0.15,0.17), post x 0.14 with foot left to 0.02 at 0.965, slab (0.14,0.40)-(0,0.68). Right part from 0.21 (獭 獲).
- 王 left: bars 0.12 / 0.45 / 0.80 x 0-0.2, stem x 0.10. Right part from 0.24 (環). 玉 below: bars 0.595 / 0.76 / 0.965, stem x 0.34, square dot x 0.44-0.50 y 0.835-0.885; upper part ends by 0.525 (璧 璽).
- 疒: dot post x 0.40 y 0-0.10, `[[0.68,0.10],[0.12,0.10],[0.12,0.965],[0,0.965]]`, tabs x 0-0.09 at y 0.22-0.32 / 0.44-0.56. Inside part x 0.19-0.68, y 0.17-1 (瘴 瘸 療 癌 癒 癖 癣). 广 is the same without tabs (磨 糜, 麻 = two 木 at y 0.17-0.52).
- 目 left: loop ink x 0-0.2, y 0.14-0.86, two bars at thirds, square counters. Right part from 0.235 (瞧 瞩 瞪 瞬 瞭 瞳 瞻).
- 石 left: bar y 0.035 x 0-0.25, ノ slab (0.13,0.05)-(0.035,0.42), 口 loop ink x 0.035-0.245 y 0.48-0.90. Right part from 0.28 (磷 磺 礁 礎).
- 禾 left: bars 0.035 / 0.22 x 0-0.25, stem x 0.125, leg triangles on the stem edges to x 0 (y 0.93) and x 0.25 (y 0.80). Right part from 0.285 (穆 積 穗 穫).
- 米 left: stem x 0.12, bar y 0.42 x 0-0.24, dot blocks x 0-0.05 / 0.19-0.24 y 0.12-0.30, leg slabs (0.10,0.46)-(0.01,0.80) and (0.14,0.46)-(0.23,0.76). Right part from 0.275 (糕 糖 糙 糟 糠 糧 糯).
- 糸 left (JA): zigzags `[[0.15,0],[0.035,0.19],[0.17,0.19]]`, `[[0.24,0.08],[0.035,0.43],[0.27,0.43]]`, tick x 0.235 y 0.31-0.43, stem x 0.145 from 0.43, dot posts x 0.035 / 0.255 y 0.6-0.87. Right part from 0.32 (緻 縛 縫 縮). 糸 below: zigzags from y0, stem x 0.34, two slabs (繁 y0 0.58, 纂 y0 0.64 at 0.86 height).
- Shared parts: 焦 (瞧 礁), 蒦 (獲 穫), 尞 (療 瞭), 辟 (璧 wide, 癖 narrow), 瓜 at x 0.40-0.68 (瓢 瓤; narrow in 瓣), 麻 (磨 糜), 广+肀 (糖 糠), 立兄 (競).
- Where open counters do not fit the part is a block with 0.025 slits: 束's 口 in 獭, 目 in 纂 and in each 直 of 矗. 爾's four X are slabs clipped flush to their cells.

### Complex characters (w 0.07–0.09): C7
- w 0.07 for the whole group (龙 is 5 strokes and keeps 0.11). Frame cut on all. Copy centerlines from the glyph named in brackets.
- Reused from other groups unchanged: 金 left from C5 (錬 鎌), 言 left from C5 (謡 譲), JA 頁 right from C6 (頼 顔 顕 瀬). Left parts next to 頁 end their ink by x 0.345.
- 門 (闇 闘): doors `[[0.035,1],[0.035,0.035],[0.245,0.035],[0.245,0.28],[0.035,0.28]]` and mirror at 0.435 / 0.645 with a foot left to 0.56, rungs y 0.1675. Inner part ink x 0.07-0.61, y 0.3-0.95.
- 鳥 right (鶴 鶏, x 0.40-0.645): tick, 目 loop with rows at 0.09 / 0.25 / 0.41 / 0.57 of the height, the bottom row bar runs into the hook post with a foot left, 灬 as a block with three 0.02 slits. Under 广 (鷹): loop rows 0.55 / 0.64 / 0.73, long bar 0.82 into the hook, 灬 as four squares on the hook's foot level. 鸟 under 广 (鹰): tick, 𠃍 y 0.555, square dot, ㇉ bar 0.74, low bar 0.855.
- 亻隹 under 广 (鷹 鹰): 亻 post x 0.15, 隹 post 0.27, stem 0.41, bars 0.17 / 0.265 / 0.36, base 0.455 (white 0.025, the tightest in the group).
- 馬 left (騒 験): post x 0.04, stem 0.165, bars 0.035 / 0.19 / 0.345, ㇉ bar 0.52 into post 0.30 with a foot, 灬 block x 0-0.23 y 0.66-0.84 with three slits.
- 襄 JA (譲 壌 嬢 醸) and 褱 JA (壊 懐) share 𧘇: レ post with an up-tick, a short ノ, a long ㇏ off the lower right. 襄: dot, bar 0.1, 丷 ticks, bars 0.22 / 0.36 / 0.5, two posts 0.1 apart. 褱: 十, 罒 (three cells), long bar 0.45.
- 黑 left (黔 默): loop x 0.035-0.325 y 0.035-0.29 with two 0.05 dots, stem from the loop floor, bar 0.43, rising bar, 灬 as four squares. 鹿 (麓 麗): 广 bar, ∩ with stem and bar, 比 as two 匕. 粦 (鳞 隣): 米, 夕 (dot as a square right of the slant), 㐄 (bar, L, long post). 鱼 GB left (鳃 鳞), bottom (鳖).
- Where strips do not fit: 臣 in 臓 and 束's 口 in 瀬 are blocks with slits; 歯's 米 hangs its dots as tabs on the bar (齢).
