"""Regenerate the README images in docs/images/ (except web_ui.png, a browser screenshot).

usage: .venv/bin/python -I src/showcase.py
Needs build/hand.ttf (src/tape.py) and web/data.js (src/export_web.py). macOS only for the
label font (Hiragino) and src/preview.py's reference font.
"""
import json, subprocess, sys, tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import manual
import raster_web

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "images"
FONT = str(ROOT / "build" / "hand.ttf")
PAPER, INK, MUTED = (244, 241, 232), (22, 22, 22), (120, 116, 106)
LABEL = "/System/Library/Fonts/Hiragino Sans GB.ttc"


def label_font(size):
    try:
        return ImageFont.truetype(LABEL, size)
    except OSError:
        return ImageFont.load_default()


def engine(lines, align=True, k=120):
    with tempfile.TemporaryDirectory() as d:
        js = Path(d) / "l.json"
        subprocess.run(["node", str(ROOT / "web/cli.js"), "|".join(lines), str(js)] + ([] if align else ["--noalign"]), check=True)
        data = json.loads(js.read_text())
    return raster_web.render(data, k), data


def tint(gray, ink=INK, paper=PAPER):
    """Grayscale (0 = ink) -> RGB on paper colour."""
    a = np.array(gray, dtype=np.float32)[..., None] / 255
    return Image.fromarray((np.array(ink) * (1 - a) + np.array(paper) * a).astype(np.uint8))


def pad(img, m, color=PAPER):
    out = Image.new("RGB", (img.width + 2 * m, img.height + 2 * m), color)
    out.paste(img, (m, m))
    return out


def font_lines(lines, size, gap=0.25):
    f = ImageFont.truetype(FONT, size)
    w = max(int(f.getlength(t)) for t in lines) + 2
    h = int(size * (1 + gap))
    img = Image.new("L", (w, h * len(lines)), 255)
    d = ImageDraw.Draw(img)
    for i, t in enumerate(lines):
        d.text((0, i * h + size * 0.1), t, font=f, fill=0)
    return img


def titled(img, title, size=26):
    lf = label_font(size)
    out = Image.new("RGB", (max(img.width, int(lf.getlength(title)) + 4), img.height + int(size * 1.8)), PAPER)
    ImageDraw.Draw(out).text((0, 0), title, font=lf, fill=MUTED)
    out.paste(img, (0, int(size * 1.8)))
    return out


def stack(imgs, gap=36):
    w = max(i.width for i in imgs)
    out = Image.new("RGB", (w, sum(i.height for i in imgs) + gap * (len(imgs) - 1)), PAPER)
    y = 0
    for i in imgs:
        out.paste(i, (0, y))
        y += i.height + gap
    return out


def glyphs():
    out = {}
    for f in sorted((ROOT / "glyphs/manual").glob("*.json")):
        e = json.loads(f.read_text(encoding="utf-8"))
        out[e["ch"]] = e
    return out


def hero():
    img, _ = engine(["新宿駅南口改札", "← 左側通行 →"], k=170)
    pad(tint(img), 70).save(OUT / "hero.png")


def signs():
    lines = ["東口広場 関係者以外立入禁止", "電車が参ります 危険ですので", "黄色い線の内側でお待ちください",
             "改修工事中 ご迷惑をおかけします", "国会議事堂 日本の政治経済", "0123456789 TOKYU HANDS KIOSK"]
    img, _ = engine(lines, k=90)
    pad(tint(img), 40).save(OUT / "signs.png")


def photo_vs_font(G):
    chars = "新宿駅南口改札左側通行東広場関係者以外立入禁止小田急線京王井頭山手日暮里"
    chars = [c for c in chars if G.get(c, {}).get("src")][:30]
    H, W, per = 150, 102, 15
    f = ImageFont.truetype(FONT, int(H * 1.0))
    lf = label_font(22)
    rows = []
    for k in range(0, len(chars), per):
        part = chars[k:k + per]
        row = Image.new("RGB", (per * (W + 14), 2 * H + 18), PAPER)
        for i, c in enumerate(part):
            x = i * (W + 14)
            tr = Image.open(ROOT / "refs/traced" / G[c]["src"].replace(".svg", ".png")).convert("L").resize((W, H))
            row.paste(tint(tr), (x, 0))
            cell = Image.new("L", (H * 2, H * 2), 255)
            ImageDraw.Draw(cell).text((0, 0), c, font=f, fill=0)
            box = Image.eval(cell, lambda v: 255 - v).getbbox()
            row.paste(tint(cell.crop(box).resize((W, H))), (x, H + 18))
        rows.append(row)
    img = stack(rows, 40)
    leg = Image.new("RGB", (img.width, 40), PAPER)
    ImageDraw.Draw(leg).text((0, 4), "每组上：招牌照片描下来的原字　下：本字体（统一胶带宽 0.11、格子 0.68）", font=lf, fill=MUTED)
    pad(stack([leg, img], 10), 30).save(OUT / "photo_vs_font.png")


def wrap(chars, n):
    return ["".join(chars[i:i + n]) for i in range(0, len(chars), n)]


def charts(G):
    hira = sorted((c for c in G if "ぁ" <= c <= "ゟ"), key=ord)
    kata = sorted((c for c in G if "ァ" <= c <= "ヿ"), key=ord)
    kana = stack([titled(tint(font_lines(wrap(hira, 22), 64)), f"平假名 {len(hira)}"),
                  titled(tint(font_lines(wrap(kata, 22), 64)), f"片假名 {len(kata)}")])
    pad(kana, 40).save(OUT / "kana.png")
    kanji = sorted((c for c in G if "一" <= c <= "鿿"), key=ord)
    photo = [c for c in kanji if G[c].get("src")]
    built = [c for c in kanji if not G[c].get("src")]
    k = stack([titled(tint(font_lines(wrap(photo, 30), 46)), f"照片搭的汉字 {len(photo)}"),
               titled(tint(font_lines(wrap(built, 30), 46)), f"照规范补搭的汉字 {len(built)}")])
    pad(k, 40).save(OUT / "kanji.png")
    lat = titled(tint(font_lines(["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "0123456789 ←↑→↓↖"], 96)), "字母、数字、箭头")
    pad(lat, 40).save(OUT / "latin.png")


def alignment():
    line = ["国会議事堂 日本の政治経済"]
    on, _ = engine(line, True, 120)
    off, _ = engine(line, False, 120)
    a, b = np.array(on) < 128, np.array(off) < 128
    diff = np.full(a.shape + (3,), PAPER, np.uint8)
    diff[a & b] = INK
    diff[a & ~b] = (214, 54, 42)
    diff[~a & b] = (40, 110, 220)
    pad(stack([titled(tint(off), "整行对齐关"), titled(tint(on), "整行对齐开"),
               titled(Image.fromarray(diff), "差异：红 = 对齐后才有的墨，蓝 = 对齐前才有的墨")], 30), 40).save(OUT / "alignment.png")


def construction(G):
    chars, H = "口新場あ", 300
    lf = label_font(22)
    tiles = []
    for c in chars:
        e = G[c]
        a = e.get("aspect", 0.68)
        W = int(round(a * H))
        ink = manual.raster(manual.render(e, H), W, H)
        final = tint(Image.fromarray(np.where(ink, 0, 255).astype(np.uint8)))
        plan = tint(Image.fromarray(np.where(ink, 215, 255).astype(np.uint8)))
        d = ImageDraw.Draw(plan)
        P = lambda pts: [(x * H, y * H) for x, y in pts]
        for p in e.get("polys", []):
            d.polygon(P(p), outline=(40, 110, 220), width=3)
        for s in e.get("strips", []):
            d.line(P(s), fill=(22, 22, 22), width=4, joint="curve")
            for x, y in P(s):
                d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=(22, 22, 22))
        for p in e.get("cuts", []):
            d.polygon(P(p), outline=(214, 54, 42), width=3)
        panels = [plan, final]
        if e.get("src"):
            panels.insert(0, tint(Image.open(ROOT / "refs/traced" / e["src"].replace(".svg", ".png")).convert("L").resize((W, H))))
        tile = Image.new("RGB", (3 * (W + 16), H), PAPER)
        for i, p in enumerate(panels):
            tile.paste(p, ((3 - len(panels) + i) * (W + 16), 0))
        tiles.append(tile)
    row = Image.new("RGB", (sum(t.width for t in tiles) + 40 * (len(tiles) - 1), H), PAPER)
    x = 0
    for t in tiles:
        row.paste(t, (x, 0))
        x += t.width + 40
    leg = Image.new("RGB", (row.width, 40), PAPER)
    ImageDraw.Draw(leg).text((0, 4), "每组：照片原字 → 胶带中线（黑）、补块（蓝）、切口（红） → 圆角合并后的字形", font=lf, fill=MUTED)
    pad(stack([leg, row], 10), 30).save(OUT / "construction.png")


def checks():
    out = OUT / "checks.png"
    subprocess.run([sys.executable, "-I", str(ROOT / "src/preview.py"), str(out), "側場以後", "--ja"], check=True, capture_output=True)
    pad(Image.open(out).convert("RGB"), 20, (255, 255, 255)).save(out)


def fallback():
    hand, _ = engine(["東京駅 中央線"], k=110)
    gen, _ = engine(["鷹 鷲 鶴 龍 曜"], k=110)
    pad(stack([titled(tint(hand), "手搭的字"), titled(tint(gen), "没有手搭字时，引擎按格子从骨架结构生成（笔画多的字仍偏黑）")], 30), 40).save(OUT / "fallback.png")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    G = glyphs()
    for step in (hero, signs, lambda: photo_vs_font(G), lambda: charts(G), alignment, lambda: construction(G), checks, fallback):
        step()
    for f in sorted(OUT.glob("*.png")):
        print(f.name, Image.open(f).size, f"{f.stat().st_size // 1024} KB")
