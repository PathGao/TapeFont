"""Hand-built tape glyphs: one JSON per char in glyphs/manual/<codepoint hex>.json.

Entry format (image coords: y down, cell height 1.0, cell width = aspect):
  {"ch": "口", "src": "口_a041_1_0.svg", "aspect": 0.72, "w": 0.11,
   "strips": [[[x, y], [x, y], ...], ...],   # tape centerlines, flat ends, w wide
   "polys":  [[[x, y], ...], ...],           # extra filled shapes: wedges, dots, triangles
   "cuts":   [[[x, y], ...], ...],           # shapes cut out after the union (slits, notches)
   "sharp":  [[x, y], ...],                  # outline corners near these points stay square
   "note": "..."}                           # src is null for glyphs built without a photo
Outer bends of the merged outline are rounded by tape.round_corners; strip ends stay square.

check: .venv/bin/python -I src/manual.py glyphs/manual/53E3.json [OVERLAY.png]
prints IoU against the trace in "src"; with OVERLAY.png also writes an overlay
(black = both, blue = only in photo, red = only in ours).
"""
import json, sys
from pathlib import Path

import numpy as np
import pathops
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import tape

ROOT = Path(__file__).resolve().parent.parent
S = 1024


def poly_path(pts):
    p = pathops.Path()
    p.moveTo(*pts[0])
    for q in pts[1:]:
        p.lineTo(*q)
    p.close()
    return p


def render(e, height=S):
    """Entry -> pathops Path in pixel coords (y down), cell = aspect*height x height."""
    k = height
    tape.P["width"] = e.get("w", 0.11) * k
    out = pathops.Path()
    for s in e.get("strips", []):
        p = pathops.Path()
        p.moveTo(s[0][0] * k, s[0][1] * k)
        for x, y in s[1:]:
            p.lineTo(x * k, y * k)
        p.stroke(tape.P["width"], pathops.LineCap.BUTT_CAP, pathops.LineJoin.MITER_JOIN, 4)
        out = pathops.op(out, p, pathops.PathOp.UNION)
    for s in e.get("polys", []):
        out = pathops.op(out, poly_path([(x * k, y * k) for x, y in s]), pathops.PathOp.UNION)
    out.simplify()
    out = tape.round_corners(out, [(x * k, y * k) for x, y in e.get("sharp", [])])
    for s in e.get("cuts", []):
        out = pathops.op(out, poly_path([(x * k, y * k) for x, y in s]), pathops.PathOp.DIFFERENCE)
    return out


def raster(path, W, H):
    """Even-odd fill of every contour, quads flattened."""
    acc = np.zeros((H, W), bool)
    for c in path.contours:
        pts, cur = [], None
        for verb, q in c.segments:
            if verb in ("moveTo", "lineTo"):
                cur = q[-1]
                pts.append(cur)
            elif verb == "qCurveTo":
                (cx, cy), (ex, ey) = q[0], q[-1]
                sx, sy = cur
                pts += [((1 - t) ** 2 * sx + 2 * (1 - t) * t * cx + t * t * ex,
                         (1 - t) ** 2 * sy + 2 * (1 - t) * t * cy + t * t * ey) for t in np.linspace(0.1, 1, 8)]
                cur = (ex, ey)
        if len(pts) > 2:
            im = Image.new("1", (W, H), 0)
            ImageDraw.Draw(im).polygon(pts, fill=1)
            acc ^= np.array(im, bool)
    return acc


def check(e):
    """IoU in the trace's square-stretched frame, plus overlay image."""
    a = e.get("aspect", 1.0)
    ours = raster(render(e, S), int(round(a * S)), S)
    ours = np.array(Image.fromarray(ours.astype(np.uint8) * 255).resize((512, 512))) > 127
    trace = np.array(Image.open(ROOT / "refs/traced" / e["src"].replace(".svg", ".png")).convert("L")) < 128
    iou = (ours & trace).sum() / max((ours | trace).sum(), 1)
    over = np.full((512, 512, 3), 255, np.uint8)
    over[trace & ~ours] = (60, 110, 255)
    over[ours & ~trace] = (235, 50, 50)
    over[ours & trace] = (20, 20, 20)
    return iou, Image.fromarray(over)


if __name__ == "__main__":
    e = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    iou, over = check(e)
    print(f"{e['ch']} IoU {iou:.3f}")
    if len(sys.argv) > 2:
        over.save(sys.argv[2])
