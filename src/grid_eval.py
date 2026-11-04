"""Score the skeleton generators against the hand glyphs.

usage: .venv/bin/python -I src/grid_eval.py [--split tune|test|all] [--gens trace,grid] [--sheet] [--worst N]
       [--prev DIR]   DIR holds web/*.js of an earlier commit; --gens prev,grid compares against it

Every char that has a hand glyph (glyphs/manual, marks and Latin left out) is generated from its
skeleton (ja first, then zh) by each generator (web/cli.js --glyphs) and compared with the hand glyph:
  iou    pixel IoU in the cell, generated centerlines drawn at the hand glyph's tape width
         (so a thinner tape is not counted against it)
  f      F-score of ink within a quarter tape of the other's ink (tolerates small offsets)
  cover  share of skeleton strokes on ink (src/preview.py), at the generator's own width
  hole   |holes(generated) - holes(hand)|
  thin   share of glyphs whose thinnest enclosed white is under 0.02 (blobs, hairlines)
A fixed random 20% of the chars is the held-out test set (seed below); tune on --split tune only.
Per-char rows go to build/grid_eval_<split>.tsv. --sheet writes build/grid_compare.png
(hand | gens for ~80 chars: the SHOW chars, tune, held-out, and chars without a hand glyph; use
--gens prev,grid --prev DIR for hand | previous | new).
"""
import json, random, statistics, subprocess, sys, tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import manual, preview, tape

ROOT = Path(__file__).resolve().parent.parent
H = preview.H
SEED = 20261104
NO_HAND = "鷹語論識議護響驚灣聽歡麗織職鬱讓龍纏驗戀釁永必書飛乘為"
SHOW = "がどぶブぷパゴジいルと広府原座病方言計主賀里曜題贈錯"


def hand_glyphs():
    out = {}
    for f in sorted((ROOT / "glyphs/manual").glob("*.json")):
        e = json.loads(f.read_text(encoding="utf-8"))
        if ord(e["ch"]) >= 0x3000 and e["ch"] not in tape.MARKS:
            out[e["ch"]] = e
    return out


def split(chars):
    chars = sorted(chars)
    test = set(random.Random(SEED).sample(chars, len(chars) // 5))
    return [c for c in chars if c not in test], sorted(test)


GOPT = []
PREV = [None]  # --prev DIR: a copy of web/ from an earlier commit, scored as generator "prev"


def generate(chars, gen):
    with tempfile.TemporaryDirectory() as d:
        out = Path(d) / "g.json"
        cli, opts = (Path(PREV[0]) / "cli.js", ["--gen=grid"]) if gen == "prev" else (ROOT / "web/cli.js", [f"--gen={gen}"] + GOPT)
        subprocess.run(["node", str(cli), "--glyphs", "".join(chars), str(out), "--lang=ja"] + opts, check=True)
        return json.loads(out.read_text(encoding="utf-8"))


def ink(e, w=None):
    e = dict(e, w=w or e.get("w", 0.11))
    W = int(round(e.get("aspect", 0.68) * H))
    return manual.raster(manual.render(e, H), W, H)


def near(a, r):
    return cv2.distanceTransform((~a).astype(np.uint8), cv2.DIST_L2, 3) <= r


def score(hand, g, strokes):
    ref, at_ref, own = ink(hand), ink(g, hand.get("w", 0.11)), ink(g)
    iou = (ref & at_ref).sum() / max((ref | at_ref).sum(), 1)
    r = hand.get("w", 0.11) * H / 4
    p = (at_ref & near(ref, r)).sum() / max(at_ref.sum(), 1)
    q = (ref & near(at_ref, r)).sum() / max(ref.sum(), 1)
    _, ok = preview.coverage(own, strokes, g["w"])
    return dict(iou=iou, f=2 * p * q / max(p + q, 1e-9), cover=sum(ok) / max(len(ok), 1),
                hole=abs(preview.holes(own) - preview.holes(ref)), thin=float(preview.min_gap(own) < 0.02))


def bucket(n):
    return "simple" if n <= 8 else "medium" if n < 16 else "dense"


def report(rows, gens):
    keys = ["iou", "f", "cover", "hole", "thin"]
    print(f"{'bucket':8} {'n':>4} {'gen':6} " + " ".join(f"{k:>11}" for k in keys) + "   (mean/median)")
    for b in ["all", "simple", "medium", "dense"]:
        sel = [r for r in rows if b == "all" or r["bucket"] == b]
        for gen in gens:
            vals = [r[gen] for r in sel]
            cells = " ".join(f"{statistics.mean(v[k] for v in vals):5.3f}/{statistics.median(v[k] for v in vals):5.3f}" for k in keys) if vals else ""
            print(f"{b:8} {len(sel):4} {gen:6} {cells}")


def tile(e, label):
    W = int(round(e.get("aspect", 0.68) * H))
    im = Image.new("L", (W, H + 22), 255)
    im.paste(Image.fromarray(np.where(ink(e), 20, 245).astype(np.uint8)), (0, 0))
    ImageDraw.Draw(im).text((4, H + 3), label, fill=0, font=FONT)
    return im


FONT = ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", 16)


def sheet(hand, tune, test, gens, out, picks=None):
    rng = random.Random(1)
    show = [c for c in SHOW if c in hand]  # known failure patterns: kana marks, 广 厂, top dots, dense blocks
    picks = picks or show + rng.sample([c for c in tune if c not in show], 16) + rng.sample([c for c in test if c not in show], 16) + [c for c in NO_HAND if c not in hand][:12]
    gl = {gen: generate(picks, gen) for gen in gens}
    W = int(0.68 * H)
    cols, cw = 4, (len(gens) + 1) * (W + 4) + 16
    rows = (len(picks) + cols - 1) // cols
    im = Image.new("L", (cols * cw, rows * (H + 30)), 200)
    for i, c in enumerate(picks):
        x, y = (i % cols) * cw, (i // cols) * (H + 30)
        tag = "tune" if c in tune else "held-out" if c in test else "no hand"
        panels = [tile(hand[c], f"{c} hand ({tag})") if c in hand else tile({"strips": []}, f"{c} no hand glyph")]
        panels += [tile(gl[g][c], g) if c in gl[g] else tile({"strips": []}, f"{g}: none") for g in gens]
        for j, p in enumerate(panels):
            im.paste(p, (x + j * (W + 4), y))
    im.save(out)
    print("sheet ->", out)


def main():
    a = sys.argv[1:]
    which = a[a.index("--split") + 1] if "--split" in a else "tune"
    gens = (a[a.index("--gens") + 1] if "--gens" in a else "trace,grid").split(",")
    if "--G" in a:  # grid parameter overrides for tuning, e.g. --G equal:0.5,white:0.4
        GOPT.append("--G=" + a[a.index("--G") + 1])
    if "--prev" in a:
        PREV[0] = a[a.index("--prev") + 1]
    hand = hand_glyphs()
    gl = {gen: generate(list(hand), gen) for gen in gens}
    chars = [c for c in hand if all(c in gl[g] for g in gens)]
    tune, test = split(chars)
    (ROOT / "build").mkdir(exist_ok=True)
    if "--dev" in a:  # tuning sheet: given chars (tune set only) -> build/grid_dev.png
        picks = [c for c in a[a.index("--dev") + 1] if c not in test]
        sheet(hand, tune, test, gens, ROOT / "build/grid_dev.png", picks)
        return
    if "--sheet" in a:
        sheet(hand, tune, test, gens, ROOT / "build/grid_compare.png")
    sk = preview.skeletons(True)
    sel = {"tune": tune, "test": test, "all": tune + test}[which]
    rows = []
    for c in sel:
        r = {"ch": c, "n": gl[gens[0]][c]["n"], "bucket": bucket(gl[gens[0]][c]["n"])}
        for gen in gens:
            r[gen] = score(hand[c], gl[gen][c], sk.get(c, []))
        rows.append(r)
    print(f"split {which}: {len(rows)} chars ({len(tune)} tune / {len(test)} held-out)")
    report(rows, gens)
    with open(ROOT / f"build/grid_eval_{which}.tsv", "w", encoding="utf-8") as f:
        f.write("ch\tn\t" + "\t".join(f"{g}_{k}" for g in gens for k in ("iou", "f", "cover", "hole")) + "\n")
        for r in rows:
            f.write(f"{r['ch']}\t{r['n']}\t" + "\t".join(f"{r[g][k]:.3f}" for g in gens for k in ("iou", "f", "cover", "hole")) + "\n")
    if "--worst" in a:
        n = int(a[a.index("--worst") + 1])
        g = gens[-1]
        print("worst", g, "".join(r["ch"] for r in sorted(rows, key=lambda r: r[g]["f"])[:n]))


if __name__ == "__main__":
    main()
