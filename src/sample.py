"""Render a text sheet from a font: .venv/bin/python -I src/sample.py FONT.ttf OUT.png "line1|line2" """
import sys
from PIL import Image, ImageDraw, ImageFont

font, out, text = sys.argv[1], sys.argv[2], sys.argv[3]
lines = text.split("|")
size = 96
f = ImageFont.truetype(font, size)
img = Image.new("L", (int(max(map(f.getlength, lines))) + 40, (size + 24) * len(lines) + 40), 235)
d = ImageDraw.Draw(img)
for i, line in enumerate(lines):
    d.text((20, 20 + i * (size + 24)), line, font=f, fill=20)
img.save(out)
