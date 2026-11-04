# Third-party material

This repository is private and for personal use. It contains or derives from the material below. Nothing here is licensed for redistribution; the project's own code has no open-source license.

## Sign photos (`refs/photos_a/`, `refs/photos_b/`) and traces (`refs/traced/`)

Photos of Sato Shuetsu's tape signs, collected from news articles, blogs and Wikimedia Commons. Each file's source page and image URL is listed in the folder's `manifest.tsv`. Copyright stays with the photographers and with Sato Shuetsu for the lettering. They are kept as reference only and are not part of the font.

## Stroke skeletons (`data/skeletons.jsonl`, `data/skeletons_ja.jsonl`, `web/data.js`)

- Make Me a Hanzi `graphics.txt` — derived from Arphic PL KaitiM GB and Arphic PL UKai, under the Arphic Public License. https://github.com/skishore/makemeahanzi
- KanjiVG, Copyright (C) 2009-2011 Ulrich Apel, CC BY-SA 3.0. https://kanjivg.tagaini.net/
- KANJIDIC2 (EDRDG), CC BY-SA 4.0 — only the 常用漢字 list in `data/coverage.md`.

Glyphs the web engine generates from these skeletons are derived works. The two share-alike licenses are not known to be compatible with each other, so a distributed version would have to keep Chinese (Arphic) and Japanese (KanjiVG) derived glyphs apart. Details: `data/LICENSES.md`.

## Hand-built glyphs (`glyphs/manual/`, `build/hand.ttf`)

Drawn by hand as tape strips after the photos and Sato's published method; they do not contain skeleton data.
