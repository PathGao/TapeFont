"""Rasterize web/cli.js output: .venv/bin/python -I src/raster_web.py in.json out.png [px_per_line]"""
import json, sys
from PIL import Image, ImageDraw


def render(d, k=120, ink=0, paper=255):
    """Engine layout (cli.js JSON) -> grayscale image, k px per line height."""
    pad = k // 6
    W = int(max(L["width"] for L in d["lines"]) * k) + 2 * pad
    img = Image.new("L", (W, len(d["lines"]) * (k + pad) + pad), paper)
    for li, L in enumerate(d["lines"]):
        oy = pad + li * (k + pad)
        for c in L["chars"]:
            cw = max(1, round(c["width"] * k))
            cell = Image.new("L", (cw, k), 0)  # mask: 255 = ink
            dr = ImageDraw.Draw(cell)
            for s in c["shapes"]:
                dr.polygon([(x * k, y * k) for x, y in s], fill=255)
            for s in c["cuts"]:
                dr.polygon([(x * k, y * k) for x, y in s], fill=0)
            ox = pad + round(c["x"] * k)
            img.paste(ink, (ox, oy, ox + cw, oy + k), cell)
            if c["missing"]:
                ImageDraw.Draw(img).rectangle([ox + 1, oy + 1, ox + cw - 2, oy + k - 2], outline=160)
    return img


if __name__ == "__main__":
    render(json.load(open(sys.argv[1])), int(sys.argv[3]) if len(sys.argv) > 3 else 120).save(sys.argv[2])
