# Licenses of skeleton data

## Make Me a Hanzi `graphics.txt` (src = "mmah")

- Source: https://github.com/skishore/makemeahanzi, file `graphics.txt`. Notice saved in `data/raw/mmah/COPYING`.
- `graphics.txt` is derived from Arphic PL KaitiM GB and Arphic PL UKai. It is under the **Arphic Public License** (APL): http://ftp.gnu.org/non-gnu/chinese-fonts-truetype/LICENSE
- `dictionary.txt` from the same repo is LGPL-3.0+. We do not use it.
- The medians are derived from Arphic glyphs, so a font built from them is a derived work under the APL.

## KanjiVG (src = "kanjivg")

- Source: https://github.com/KanjiVG/kanjivg, release r20260714, `kanjivg-20260714-main.zip`.
- Copyright (C) 2009-2011 Ulrich Apel. **CC BY-SA 3.0**: https://creativecommons.org/licenses/by-sa/3.0/
- The license header is in every SVG in `data/raw/kanjivg/main/kanji/`.

## KANJIDIC2 (coverage list only)

- `data/raw/kanjidic2/kanjidic2.xml.gz` from EDRDG (http://www.edrdg.org/kanjidic/), CC BY-SA 4.0.
- It only supplies the 常用漢字 list for `coverage.md`. Nothing from it goes into the font.

## What this means for a font used privately

- Private use (made and used by you, not given to anyone) has no obligations under either license. Both licenses only trigger on distribution.
- If the font is ever distributed (shared file, published, embedded in a public site or app):
  - APL: the derived font must be released under the APL, with the license text and source, and must not use the Arphic font names.
  - CC BY-SA 3.0: credit KanjiVG / Ulrich Apel, link the license, and release the derived font under CC BY-SA 3.0 or a compatible license.
  - Mixing both in one distributed font is a problem. APL and CC BY-SA are both share-alike and are not known to be compatible. A distributed version would have to be split (e.g. a CN font from MMAH under APL and a JP font from KanjiVG under CC BY-SA) or get legal review.
