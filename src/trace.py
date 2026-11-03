"""Trace one row of tape letters from a photo into per-character SVGs.

usage: .venv/bin/python -I src/trace.py IMG --quad x1,y1,x2,y2,x3,y3,x4,y4 --text 左側通行
           [--ink dark|light|R,G,B] [--tol 60] [--tag a001_1]
--quad: corners of the row's outer frame, clockwise from top-left, in image pixels.
        The frame should hug the character cells (Sato's letters fill equal square cells).
--text: one char per cell, left to right; use _ for a cell to skip.
Writes refs/traced/<char>_<tag>_<i>.svg (1024 box, y down) + .png (binarized cell),
and appends a line to refs/traced/index.tsv: file, char, tape_width_ratio (tape width / cell height).
"""
import argparse, sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "refs" / "traced"
CELL = 512

a = argparse.ArgumentParser()
a.add_argument("img")
a.add_argument("--quad", required=True)
a.add_argument("--text", required=True)
a.add_argument("--ink", default="dark")
a.add_argument("--tol", type=float, default=60, help="color distance for --ink R,G,B")
a.add_argument("--tag", default=None)
args = a.parse_args()

img = cv2.imread(args.img)
if img is None:
    sys.exit(f"cannot read {args.img}")
q = np.array([float(v) for v in args.quad.split(",")], np.float32).reshape(4, 2)
n = len(args.text)
W, H = CELL * n, CELL
M = cv2.getPerspectiveTransform(q, np.float32([[0, 0], [W, 0], [W, H], [0, H]]))
row = cv2.warpPerspective(img, M, (W, H), flags=cv2.INTER_CUBIC)

if args.ink in ("dark", "light"):
    g = cv2.GaussianBlur(cv2.cvtColor(row, cv2.COLOR_BGR2GRAY), (5, 5), 0)
    mode = cv2.THRESH_BINARY_INV if args.ink == "dark" else cv2.THRESH_BINARY
    _, ink = cv2.threshold(g, 0, 255, mode + cv2.THRESH_OTSU)
else:
    rgb = np.array([float(v) for v in args.ink.split(",")])[::-1]  # to BGR
    d = np.linalg.norm(cv2.GaussianBlur(row, (5, 5), 0).astype(float) - rgb, axis=2)
    ink = np.where(d < args.tol, 255, 0).astype(np.uint8)
ink = cv2.morphologyEx(ink, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))

OUT.mkdir(parents=True, exist_ok=True)
tag = args.tag or Path(args.img).stem
idx = open(OUT / "index.tsv", "a", encoding="utf-8")
cv2.imwrite(str(OUT / f"_row_{tag}.png"), np.hstack([cv2.cvtColor(ink, cv2.COLOR_GRAY2BGR), row]) if n <= 4 else ink)
for i, ch in enumerate(args.text):
    if ch == "_":
        continue
    cell = ink[:, i * CELL:(i + 1) * CELL]
    cs, hier = cv2.findContours(cell, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    d = []
    for c in cs:
        if cv2.contourArea(c) < 150:
            continue
        p = cv2.approxPolyDP(c, 2.0, True).reshape(-1, 2) * (1024 / CELL)
        d.append("M" + " L".join(f"{x:.0f},{y:.0f}" for x, y in p) + "Z")
    # tape width: twice the typical max distance to background along the strokes
    dist = cv2.distanceTransform(cell, cv2.DIST_L2, 5)
    ridge = dist[(dist > 2) & (dist >= cv2.dilate(dist, np.ones((3, 3))) - 1e-6)]
    ratio = 2 * float(np.median(ridge)) / CELL if ridge.size else 0
    name = f"{ch}_{tag}_{i}"
    (OUT / f"{name}.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">'
        f'<path fill-rule="evenodd" d="{" ".join(d)}"/></svg>\n', encoding="utf-8")
    cv2.imwrite(str(OUT / f"{name}.png"), 255 - cell)
    idx.write(f"{name}.svg\t{ch}\t{ratio:.3f}\n")
    print(name, f"tape/cell={ratio:.3f}", f"contours={len(d)}")
