"""Component library for web/compose.js: tape parts cut out of the hand glyphs.

For every hand glyph whose char has a component tree (data/components.jsonl), the char's
skeleton strokes are mapped onto the glyph (stroke box -> tape centerline box), every tape
segment / poly / cut goes to the stroke it lies on, and each named component of the tree
takes the tape of its strokes. A cut-out part is kept when it covers all of its strokes.
and holds no tape far from them. Per component and position the library keeps the part most
like the other versions (mean IoU), with a small bonus for photo glyphs and top-level parts.

A part: {"w", "strips", "polys", "cuts", "sharp" (glyph frame), "box" (its ink box),
"rel" (box as fractions of the parent's box: the cell, or the enclosing part),
"sib" (the other part's rel when the parent splits in two), "from" (source char)}.
"""
import cv2
import numpy as np
from PIL import Image, ImageDraw

ALIAS = {"⻌": "辶", "⻍": "辶", "⻎": "辶"}


def key(node):
    return ALIAS.get(node[0], node[0]) + "|" + node[1]


def leaves(n):
    return n[3] if not n[3] or isinstance(n[3][0], int) else [i for k in n[3] for i in leaves(k)]


def dense(pts, step=0.008):
    out = [np.asarray(pts[0], float)]
    for a, b in zip(pts, pts[1:]):
        a, b = np.asarray(a, float), np.asarray(b, float)
        n = max(1, int(np.hypot(*(b - a)) / step))
        out += [a + (b - a) * t for t in np.linspace(0, 1, n + 1)[1:]]
    return np.array(out)


def seg_dist(P, a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    d = b - a
    t = np.clip(((P - a) @ d) / (d @ d or 1e-12), 0, 1)
    return np.hypot(*(P - (a + t[:, None] * d)).T)


def box_of(runs, polys, h, a):
    pts = [(x + dx, y + dy) for s in runs for x, y in s for dx in (-h, h) for dy in (-h, h)] + [p for q in polys for p in q]
    if not pts:
        return None
    xs, ys = [min(max(p[0], 0), a) for p in pts], [min(max(p[1], 0), 1) for p in pts]
    return [min(xs), min(ys), max(xs), max(ys)]


def rel(b, p):
    pw, ph = (p[2] - p[0]) or 1, (p[3] - p[1]) or 1
    return [round((b[0] - p[0]) / pw, 3), round((b[1] - p[1]) / ph, 3), round((b[2] - p[0]) / pw, 3), round((b[3] - p[1]) / ph, 3)]


def clean(e):
    """strips, polys, cuts, sharp of a glyph. Cell-frame cuts (rectangles outside the cell that
    trim slabs flush with its edge) would cut across neighbouring parts once a part moves, so
    they are dropped and the polys are trimmed at the cell edge instead."""
    a = e.get("aspect", 0.68)
    strips, polys, cuts, sharp = (e.get(k) or [] for k in ("strips", "polys", "cuts", "sharp"))
    out = lambda q: all(x <= 0 for x, _ in q) or all(x >= a for x, _ in q) or all(y <= 0 for _, y in q) or all(y >= 1 for _, y in q)
    return strips, [[[min(max(x, 0), a), min(max(y, 0), 1)] for x, y in q] for q in polys], [q for q in cuts if not out(q)], sharp


def cut(e, tree, strokes):
    """Hand glyph entry + its char's component tree + skeleton strokes (thousandths) ->
    [(key, depth, part)] for every named component that the glyph's tape covers."""
    a, w = e.get("aspect", 0.68), e.get("w", 0.11)
    h = w / 2
    strips, polys, cuts, sharp = clean(e)
    ink = box_of(strips, polys, h, a)
    cx0, cy0, cx1, cy1 = ink[0] + h, ink[1] + h, ink[2] - h, ink[3] - h
    sp = [p for s in strokes for p in s]
    sx0, sx1, sy0, sy1 = min(p[0] for p in sp), max(p[0] for p in sp), min(p[1] for p in sp), max(p[1] for p in sp)
    mp = lambda p: (cx0 + (p[0] - sx0) / ((sx1 - sx0) or 1) * (cx1 - cx0), cy0 + (p[1] - sy0) / ((sy1 - sy0) or 1) * (cy1 - cy0))
    S = [dense([mp(p) for p in s]) for s in strokes]
    allS, lab = np.concatenate(S), np.concatenate([[i] * len(s) for i, s in enumerate(S)])
    near = lambda P: lab[np.argmin(((np.asarray(P, float)[:, None, :] - allS[None]) ** 2).sum(-1), axis=1)]
    seg_owner = [[np.bincount(near(dense([s[k], s[k + 1]])), minlength=len(S)).argmax() for k in range(len(s) - 1)] for s in strips]
    cen = lambda q: [np.mean(np.asarray(q, float), axis=0)]
    poly_owner = [near(cen(q))[0] for q in polys]
    cut_owner = [near(cen(q))[0] for q in cuts]
    sharp_owner = [near([p])[0] for p in sharp]

    def part(node):
        N = set(leaves(node))
        runs = []
        for s, own in zip(strips, seg_owner):
            run = None
            for k, o in enumerate(own):
                if o in N:
                    run = run or [s[k]]
                    run.append(s[k + 1])
                elif run:
                    runs.append(run); run = None
            if run:
                runs.append(run)
        pq = [q for q, o in zip(polys, poly_owner) if o in N]
        box = box_of(runs, pq, h, a)
        if box is None:
            return None, None
        def dist(P):  # stroke samples -> distance to this part's tape centerlines / poly ink
            d = np.full(len(P), np.inf)
            for r in runs:
                for p, q in zip(r, r[1:]):
                    d = np.minimum(d, seg_dist(P, p, q))
            for q in pq:
                c = np.asarray(q, np.float32)
                d = np.minimum(d, [max(0.0, -cv2.pointPolygonTest(c, (float(x), float(y)), True)) + h for x, y in P])
            return d

        covered = all(np.mean(dist(S[i]) <= 0.9 * w) >= 0.6 for i in N)
        # and nothing in it strays from its strokes (tape the vote gave it from a neighbour)
        own = np.concatenate([S[i] for i in N])
        stray = lambda pts: np.mean(np.sqrt(((dense(pts)[:, None, :] - own[None]) ** 2).sum(-1)).min(1)) > 1.2 * w
        covered = covered and not any(stray(r) for r in runs) and not any(stray(q + q[:1]) for q in pq)
        return box, {"w": w, "strips": runs, "polys": pq, "cuts": [q for q, o in zip(cuts, cut_owner) if o in N],
                     "sharp": [p for p, o in zip(sharp, sharp_owner) if o in N]} if covered else None

    out = []

    def walk(node, pbox, depth):
        if not node[3] or isinstance(node[3][0], int):
            return
        got = [part(k) for k in node[3]]
        for i, (k, (box, p)) in enumerate(zip(node[3], got)):
            if box is None:
                continue
            if k[0] and p:
                p.update(box=[round(v, 4) for v in box], rel=rel(box, pbox), from_=e["ch"])
                if len(node[3]) == 2 and got[1 - i][0]:
                    p["sib"] = rel(got[1 - i][0], pbox)
                out.append((key(k), depth, p))
            walk(k, box, depth + 1)

    walk(tree, [0, 0, a, 1], 1)
    return out


def raster(p, n=32):
    b = p["box"]
    sx, sy = n / ((b[2] - b[0]) or 1), n / ((b[3] - b[1]) or 1)
    m = lambda q: [((x - b[0]) * sx, (y - b[1]) * sy) for x, y in q]
    im = Image.new("1", (n, n), 0)
    d = ImageDraw.Draw(im)
    for s in p["strips"]:
        d.line(m(s), fill=1, width=max(1, round(p["w"] * min(sx, sy))))
    for q in p["polys"]:
        d.polygon(m(q), fill=1)
    return np.array(im, bool)


def library(hand, trees, skel):
    """hand: {ch: entry with "src"}; trees: {(ch, src): tree}; skel: {src: {ch: strokes}} -> {key: part}."""
    cands = {}
    for (ch, src), t in trees.items():
        e = hand.get(ch)
        if not e or ord(ch) < 0x3400 or ch not in skel[src]:
            continue
        for k, depth, p in cut(e, t, skel[src][ch]):
            cands.setdefault(k, []).append((bool(e.get("src")), depth, p))
    lib = {}
    for k, cs in sorted(cands.items()):
        R = [raster(p) for _, _, p in cs]
        iou = lambda i: np.mean([(R[i] & R[j]).sum() / max((R[i] | R[j]).sum(), 1) for j in range(len(R))])
        # consistency first: a photo glyph's part can be a squeezed one-off (扌 in 掛)
        best = max(range(len(cs)), key=lambda i: iou(i) + 0.1 * cs[i][0] + 0.05 * (cs[i][1] == 1))
        p = cs[best][2]
        r4 = lambda v: [[round(x, 4), round(y, 4)] for x, y in v]
        lib[k] = {"w": p["w"], "strips": [r4(s) for s in p["strips"]], "polys": [r4(q) for q in p["polys"]],
                  "cuts": [r4(q) for q in p["cuts"]], "sharp": r4(p["sharp"]), "box": p["box"], "rel": p["rel"],
                  "from": p["from_"], **({"sib": p["sib"]} if "sib" in p else {})}
    for ch, e in hand.items():  # whole hand glyphs, "<char>|*"
        if ord(ch) >= 0x3400 and abs(e.get("aspect", 0.68) - 0.68) < 1e-6:
            s, p, c, sh = clean(e)
            lib[ch + "|*"] = {"w": e.get("w", 0.11), "strips": s, "polys": p, "cuts": c, "sharp": sh,
                              "box": [round(v, 4) for v in box_of(s, p, e.get("w", 0.11) / 2, 0.68)], "from": ch}
    return lib
