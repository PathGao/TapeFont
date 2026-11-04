"""Quality gate for component assembly (web/compose.js): composed vs skeleton, per char.

usage: .venv/bin/python -I src/compose_gate.py [OUT.png]
Candidates: chars of GB2312 level 1 and JIS X 0208 level 1 with a component tree and no hand
glyph. Each is laid out by the engine twice: assembled from library parts (per tree source,
zh first) and from its skeleton (what the engine shows today). Both are scored with
src/preview.py (strokes covered, holes vs the reference font, thinnest white gap), plus
shape (correlation of the blurred ink box with the reference font's) and blob (share of ink
thicker than 1.6 tapes). A char is composed when the assembled glyph
  - is complete (every stroke covered),
  - takes at most SKEL_SHARE of its strokes from the skeleton,
  - has holes at most HOLE_SLACK further from the reference font and no thinner white gap (or >= 0.02),
  - keeps its shape (correlation at most SHAPE_SLACK below the skeleton's) and adds no blobs.
Writes data/compose_ok.tsv (char, tree source) and build/gate_metrics.tsv, prints the counts,
and with OUT.png saves a sheet of skeleton | composed pairs. Then run src/export_web.py.
"""
import json, subprocess, sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import export_web, preview

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"
K = preview.H
SKEL_SHARE = 0    # most strokes a composed char may build from its skeleton, as a fraction
HOLE_SLACK = 1    # composed may miss the reference hole count by this many more than the skeleton
SHAPE_SLACK = 0.2 # composed shape correlation may be this much below the skeleton's

RUN = r"""
const [dataPath, candPath, outPath] = process.argv.slice(1);
globalThis.TAPE_DATA = require(dataPath);
const E = require(process.env.ENGINE), D = globalThis.TAPE_DATA, fs = require("fs");
const cut = (c) => ({ shapes: c.shapes.map(E.flatten), cuts: c.cuts });
const out = JSON.parse(fs.readFileSync(candPath, "utf8")).map(([ch, src, t]) => {
  D.comp = {};
  const skel = cut(E.layoutLine(ch, D, { align: false, lang: "zh" }).chars[0]);
  D.comp = { [ch]: [src, t] };
  const c = E.layoutLine(ch, D, { align: false, lang: "zh" }).chars[0];
  const g = E.glyphFor(ch, "zh", D) || {};
  return { ch, src, skel, comp: cut(c), n: D[src][ch].length, composed: !!g.composed, fromSkel: g.skel || 0 };
});
fs.writeFileSync(outPath, JSON.stringify(out));
"""


def ink(c, width):
    im = Image.new("L", (width, K), 255)
    d = ImageDraw.Draw(im)
    for s in c["shapes"]:
        d.polygon([(x * K, y * K) for x, y in s], fill=0)
    for s in c["cuts"]:
        d.polygon([(x * K, y * K) for x, y in s], fill=255)
    return np.array(im) < 128


def shape(ink):
    """Ink box scaled to 48x48 and blurred by about a tape: the char's shape at reading
    distance, compared with the reference font's (correlation) as a legibility proxy."""
    ys, xs = np.nonzero(ink)
    if not len(xs):
        return np.zeros((48, 48), np.float32)
    crop = ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.float32)
    return cv2.GaussianBlur(cv2.resize(crop, (48, 48), interpolation=cv2.INTER_AREA), (0, 0), 3)


def ref_shape(ch):
    im = Image.new("L", (2 * K, 2 * K), 0)
    ImageDraw.Draw(im).text((K // 2, K // 2), ch, font=preview.REF, fill=255)
    return shape(np.array(im) > 127)


def common():
    out = []
    for codec, rows in (("gb2312", range(0xB0, 0xD8)), ("euc_jp", range(0xB0, 0xD0))):
        for r in rows:
            for c in range(0xA1, 0xFF):
                try:
                    out.append(bytes([r, c]).decode(codec))
                except UnicodeDecodeError:
                    pass
    return list(dict.fromkeys(out))


def main():
    data, trees = export_web.build()
    data["comp"] = {}
    BUILD.mkdir(exist_ok=True)
    dpath, cpath, opath = BUILD / "gate_data.json", BUILD / "gate_cand.json", BUILD / "gate_out.json"
    dpath.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    cand = [[ch, src, trees[(ch, src)]] for ch in common() if ch not in data["hand"]
            for src in ("zh", "ja") if (ch, src) in trees]
    cpath.write_text(json.dumps(cand, ensure_ascii=False), encoding="utf-8")
    subprocess.run(["node", "-e", RUN, str(dpath), str(cpath), str(opath)], check=True,
                   env={"ENGINE": str(ROOT / "web/engine.js"), "PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin"})
    ref_sk = {"zh": preview.skeletons(False), "ja": preview.skeletons(True)}
    W = round(0.68 * K)
    ok, rows, seen, stats = {}, [], set(), {"chars": 0, "complete": 0, "ok": 0}
    metrics = ["char\tsrc\tskel_cov\tskel_holeerr\tskel_gap\tskel_blob\tskel_corr\tcomp_cov\tcomp_holeerr\tcomp_gap\tcomp_blob\tcomp_corr"]
    for r in json.loads(opath.read_text(encoding="utf-8")):
        ch = r["ch"]
        if ch not in seen:
            seen.add(ch); stats["chars"] += 1
        if ch in ok or not r["composed"]:
            continue
        strokes = ref_sk[r["src"]].get(ch, [])
        ref, rb = preview.holes(preview.ref_ink(ch, W)), ref_shape(ch)
        m = {}
        for k in ("skel", "comp"):
            g = ink(r[k], W)
            _, cov = preview.coverage(g, strokes, 0.11)
            thick = cv2.distanceTransform(g.astype(np.uint8), cv2.DIST_L2, 3) > 0.8 * 0.11 * K  # ink over 1.6 tapes thick
            m[k] = (sum(cov), len(cov), abs(preview.holes(g) - ref), preview.min_gap(g), g,
                    thick.sum() / max(g.sum(), 1), float(np.corrcoef(shape(g).ravel(), rb.ravel())[0, 1]))
        metrics.append(f"{ch}\t{r['src']}\t" + "\t".join(f"{v:.3f}" for k in ("skel", "comp") for v in (m[k][0] / max(m[k][1], 1), m[k][2], m[k][3], m[k][5], m[k][6])))
        s, c = m["skel"], m["comp"]
        complete = c[0] == c[1]
        # the skeleton fallback is far worse to the eye than the metrics say, so a composed
        # glyph only has to be complete and not clearly worse
        good = (complete and c[2] <= s[2] + HOLE_SLACK and (c[3] >= s[3] - 1e-9 or c[3] >= 0.02)
                and c[6] >= s[6] - SHAPE_SLACK and c[5] <= s[5] + 0.01)
        stats["complete"] += complete
        share = r["fromSkel"] / max(r["n"], 1)
        for x in (0, 0.25, 0.5, 1):
            stats[f"good_skel<={x}"] = stats.get(f"good_skel<={x}", 0) + (good and share <= x)
        good = good and share <= SKEL_SHARE
        rows.append((ch, r["src"], s, c, good))
        if good:
            ok[ch] = r["src"]
    stats["ok"] = len(ok)
    (ROOT / "data/compose_ok.tsv").write_text("".join(f"{ch}\t{src}\n" for ch, src in ok.items()), encoding="utf-8")
    (BUILD / "gate_metrics.tsv").write_text("\n".join(metrics) + "\n", encoding="utf-8")
    print(stats)
    sample = sorted(seen)[::max(1, len(seen) // 100)][:100]
    first = {}
    for row in rows:
        first.setdefault(row[0], row)
    sm = [first[ch] for ch in sample if ch in first]
    f = lambda rs, i, j: sum(r[i][j] for r in rs)
    print(f"sample of {len(sample)} chars: {len(sm)} assembled, {sum(r[4] for r in sm)} pass;"
          f" strokes covered skeleton {f(sm, 2, 0)}/{f(sm, 2, 1)} vs composed {f(sm, 3, 0)}/{f(sm, 3, 1)};"
          f" hole error {f(sm, 2, 2)} vs {f(sm, 3, 2)}; mean gap {f(sm, 2, 3) / max(len(sm), 1):.3f} vs {f(sm, 3, 3) / max(len(sm), 1):.3f}")
    if len(sys.argv) > 1:
        picks = [r for r in rows if r[4]][::max(1, len(ok) // 30)][:30] + [r for r in rows if not r[4]][::97][:10]
        tw, cols = 2 * W + 30, 8
        sheet = Image.new("L", (cols * tw, ((len(picks) + cols - 1) // cols) * (K + 30)), 255)
        for i, (ch, src, s, c, good) in enumerate(picks):
            x, y = (i % cols) * tw, (i // cols) * (K + 30)
            sheet.paste(Image.fromarray(np.where(s[4], 40, 255).astype(np.uint8)), (x, y))
            sheet.paste(Image.fromarray(np.where(c[4], 0, 255).astype(np.uint8)), (x + W + 6, y))
            ImageDraw.Draw(sheet).text((x + 4, y + K + 4), f"{ch} skeleton | composed{'' if good else ' (rejected)'}",
                                       font=preview.ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", 16), fill=0)
        sheet.save(sys.argv[1])


if __name__ == "__main__":
    main()
