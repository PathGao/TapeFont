# TapeFont

复刻佐藤修悦的胶带字（修悦体）。每个字照招牌照片用胶带条手工搭出来，再生成 TTF。仅供个人使用。

## 现状

`build/hand.ttf` 收录 297 个字：汉字 166、平假名 36、片假名 57、拉丁字母和数字 30、符号 8。只有照片里出现过的字。

## 构建

```bash
uv venv .venv && uv pip install -p .venv fonttools skia-pathops pillow opencv-python-headless numpy
ALL=$(.venv/bin/python -I -c "import json,glob;print(''.join(json.load(open(f))['ch'] for f in glob.glob('glyphs/manual/*.json')))")
.venv/bin/python -I src/tape.py build/hand.ttf "$ALL" --ja advance=680
.venv/bin/python -I src/sample.py build/hand.ttf build/hand.png "新宿駅南口改札・左側通行|0123456789 TOKYU"
```

## 目录

- `glyphs/manual/<码位>.json`：手搭字形（胶带中线、补块、切口），格式见 `src/manual.py`。
- `glyphs/components/`：各部首的搭法记录。
- `src/`：`tape.py` 生成字体，`manual.py` 渲染并和照片比对，`trace.py` 从照片描字，`compare.py` 和 `sample.py` 出对比图和样张。
- `refs/`：招牌照片（`photos_a`、`photos_b`）和描出来的字（`traced`）。照片版权归原作者，仅作参考。
- `docs/`：佐藤书中的做法（`book_method.md`）和搭字规范。
- `data/`：骨架数据，来自 Make Me a Hanzi（APL）和 KanjiVG（CC BY-SA 3.0），见 `data/LICENSES.md`。原始下载在 `data/raw/`，不入库。
