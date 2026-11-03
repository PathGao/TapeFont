# 修悦体 construction method: what is publicly visible

Research date: 2026-11-03. The book 『ガムテープで文字を書こう！』(世界文化社, 2009, B5, 95 p, ISBN 978-4-418-09205-5) has no online preview (no Google Books entry, no なか見!検索 text found). Everything below comes from the book's table of contents, reader reviews, and two photo-documented live demos by Sato (RocketNews24 2016, ジモコロ 2023). Photos were looked at directly. Confidence: H = seen in Sato's own demo photos or stated by him, M = one secondary source, L = inference.

## The main finding: it is subtractive, not stroke-by-stroke

Sato does not lay one strip per stroke. He works like this:

1. Cover the whole board with a background color of tape, strips laid side by side (red or black in the demos). (H)
2. Mark reference lines first. RocketNews says this is the most important step, because if they are off every letter is off. (H)
3. Lay letter-color tape over a whole character block, or along every needed horizontal and vertical line across the row, so the strips run through several characters at once. (H)
4. Cut away with a cutter everything that is not the letter, then peel it off. Reviews call this "引き算" and "掘り出す". (H)
5. Round the corners and patch inner corners with the offcuts. (H)

A 読書メーター reviewer summarises the book the same way: split the character into vertical and horizontal lines, drop them into a pre-built 字枠, then peel off the frame and the rest. (M)

For a generator this means the shape is "union of straight bands, clipped, then corner-filleted", not "one strip per skeleton stroke".

## 1. Tape

- Type: cloth gum tape (布ガムテープ). The 2016 demo rolls are SLIONTEC colored cloth tapes, about 50 mm. (H for type, M for 50 mm, judged from photos)
- Color: originally black, white, yellow from the site. Later red, blue, green allowed to match train-line colors. Black is the default, other primaries as needed. Source: ja.wikipedia. (M)
- Width per stroke: not fixed to the tape width. In the ジモコロ demo the rule is "cut all horizontal strokes of katakana to the same width", estimated by eye. So stroke width is a design choice made by cutting, and it is kept equal inside a word. (H)
- Same width at every sign size: not found. Since width is cut, not given by the roll, it presumably scales with the sign. (L)

## 2. Grid / frame

- Measure the board, divide by the number of characters, make one tape frame (字枠) per character. ジモコロ demo: 4 characters ジモコロ, each frame 5 cm wide. (H)
- Inside a frame the letter tape is laid as vertical strips, then horizontal strips across the top, bottom and middle (photo 1b80a4…). Narrow slits between strips become counters. (H)
- 共通ライン: where characters share a horizontal stroke at the same height, lay one long strip across all of them. Sato says choosing its height is the hardest part. Book section "基本テクニック" is about aligning horizontals of several characters to the same height. (H)
- Number of tape widths per frame, spacing between characters: not found. In the 2023 demo the black gap between characters is roughly one narrow slit, much less than a stroke width. (L, from photo)

## 3. Strokes

- Built from straight bands only, before rounding. Horizontals and verticals dominate. (H)
- Diagonals are allowed at any angle the letter needs, not only 45°. In the 2016 demo he lays black guide strips on the diagonal first, then lays letter tape along them (K, N, W, ス, ト). (H)
- Where a diagonal meets another stroke, its end is cut along that stroke, which leaves sharp blade-like tips. Wikipedia lists 京 浜 東 赤 大 and the × of 文 刈 as examples. (M, consistent with demo photos of N and K)
- Curves (kana like の, あ, る; 払い; hooks): no description found. Reviewers say the 50音 pages show finished kana with no written steps, and that diagonals and curves are the hard part. Visible results suggest curves are rectangles with large rounded corners (ロ, ジ, コ, O, C, 2 in the demos). (L)

## 4. Corners and ends

- Outer corner: cut into a quarter-circle ("扇形") with the cutter, freehand. In photos the radius is about one stroke width. (H for method, L for radius)
- Inner corner: take the cut-off sliver from the outer corner, trim it to a curved triangle, stick it into the inner corner so the stroke looks constant-width around the bend. Sato calls this the key point. (H, both demos, photo jshuetsu16 shows it with arrows)
- The book says equal inner and outer radii look wrong and must be fine-tuned (linker journal review). (M)
- Rounding is the signature of the style. Some sources say it was done so passers-by feel safe. (M)
- Stroke ends: square cut. Free ends of diagonals pointed (see 3). (H from photos)
- Overlaps: strips simply overlap where lines cross. The asayoru reviewer notes overlaps show through with thin masking tape, which is one reason to use opaque cloth tape. (M)

## 5. Order of work and tips

1. Measure the board, decide characters per row. (H)
2. Lay background, then reference/guide lines. (H)
3. Frames per character, trim tape sticking out beyond the frames. (H)
4. 共通ライン. (H)
5. Cut out letters, keep horizontal widths equal. (H)
6. Round corners, refill inner corners with offcuts. (H)
7. Peel frame and waste. (H)
- No pencil draft. Freehand cutter. (M, Tokyo Weekender)
- Mistakes are fixed by re-taping. (H, ジモコロ)
- Time: 4 characters about 1 h (book editor), 12-letter Latin banner about 1.5 h. (M)
- Tools: cloth tape, cutter (no preference), triangle ruler, tape measure, ruler optional, cutting mat for offcuts. (H)

## 6. Latin, digits, arrows

- Latin and digits: same method (RocketNews24 demo, "ROCKETNEWS24"). Mixed case look: R, O, C, K, E, T, N, W, S, 2, 4 made of straight bands with diagonals; O, C, S, 2 get rounded outer corners. Each letter a different tape color. (H)
- Arrows and pictograms: made the same way, cut from blocks. No specific rules found. (M, Yokogao)

## 7. Step-by-step examples of specific characters

- ジモコロ (ジモコロ demo, 2023): four frames, one 共通ライン, cut out, corners rounded, offcut triangles inside. Full photo sequence below. (H)
- 夢 (RocketNews 2016 interview): tape laid at equal spacing vertically and horizontally over the area, unneeded parts cut away. (H)
- ROCKETNEWS24 and ロケットニュース24 (RocketNews 2016 demo). (H)
- Hiragana and kanji step-by-step: not found.

## Not found

Tape width count per frame, exact spacing, any rule for curves in hiragana, 払い/はね/点 handling, book's 道具 list contents.

## Image URLs (demo photos, not book scans)

ジモコロ demo, 2023, https://www.e-aidem.com/ch/jimocoro/entry/yoshino10/2/ , prefix `https://jimocoro-cdn.com/ch/jimocoro/assets/uploads/2023/03/`:
- `1b80a4d3bb1602015c35ce16d229ef89-1200x800.jpg` vertical strips + horizontal strips laid over four 5 cm frames
- `62019413946706963d2d95e3ff602972-1200x800.jpg` frames trimmed, white blocks with slit counters
- `a4b030cfe37f86ef435b484da79c240e-1200x795.jpg` laying the 共通ライン
- `84ea8da20a08d2510ff0047763bc48d7-1200x800.jpg` ジ モ emerging after cuts
- `6768f75c5e11e9a997c671a1b0cb3f16-1200x800.jpg` cutting an outer corner into a fan shape
- `dc933f6dfd6bd81fef8db6dc91e9d25a-1200x800.jpg` trimming the offcut into a curved triangle
- `b9758b0981b361a0ae731dddbcf1de56-1200x800.png` offcut placed into the inner corner (marked)
- `bdcffb90415c7830abbd7addf4f3ec78-1200x800.jpg` finished ジモコロ

RocketNews24 demo, 2016, https://rocketnews24.com/2016/09/13/799931/ , video https://www.youtube.com/watch?v=hKFgLQVX86U , prefix `https://rocketnews24.com/wp-content/uploads/sites/2/2016/09/`:
- `jshuetsu2.jpg` board fully covered with red tape
- `jshuetsu5.jpg` tape rolls used (cloth tape, about 50 mm)
- `jshuetsu6.jpg` tools: cutter, triangle, tape measure
- `jshuetsu7.jpg` black diagonal guide strips
- `jshuetsu8.jpg`, `jshuetsu10.jpg` letter tape laid along guides
- `jshuetsu12.jpg`, `jshuetsu13.jpg` letters cut out, before rounding
- `jshuetsu14.jpg` cutting a rounded corner
- `jshuetsu16.jpg` outer-corner offcut moved into inner corner (arrows)
- `jshuetsu17.jpg` finished Latin banner
- `jshuetsu19.jpg`, `jshuetsu20.jpg`, `jshuetsu21.jpg` katakana: white line grid across the row, then cut
- `jshuetsu23.jpg` rounding ロ
- `jshuetsu25.jpg` finished ロケットニュース24
- `shuetsu11.jpg` (from https://rocketnews24.com/2016/09/13/798848/) 夢 example

## Sources

- ja.wikipedia 佐藤修悦: https://ja.wikipedia.org/wiki/佐藤修悦
- ジモコロ demo: https://www.e-aidem.com/ch/jimocoro/entry/yoshino10/2/
- RocketNews24 interview: https://rocketnews24.com/2016/09/13/798848/
- RocketNews24 demo: https://rocketnews24.com/2016/09/13/799931/
- 紀伊國屋 (TOC + 読書メーター reviews): https://www.kinokuniya.co.jp/f/dsg-01-9784418092055
- linker journal review: https://linkerdesign.github.io/journal/2009/04/post-21.html
- asayoru review: https://asayoru.net/shuuetsutai-1
- J-CAST 2009: https://www.j-cast.com/2009/03/31038512.html?p=all
- Tokyo Weekender: https://www.tokyoweekender.com/?p=292436
- Yokogao: https://www.yokogaomag.com/editorial/shuetsu-sato-tokyo-king-of-tape-calligraphy
- はてなニュース (no method content): https://hatenanews.com/articles/200903/75
- Dead or unreachable: wakuteka.ascii.ne.jp step-by-step article (domain gone, not in Wayback), ueno.keizai.biz, asahi.com (blocked), nikkei.com (paywall).
