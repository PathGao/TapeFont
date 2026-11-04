/* Sato's lattice generator: a glyph for a char without a hand glyph, built the way Sato builds
 * letters (docs/book_method.md): equally spaced horizontal and vertical strips first, then cut.
 *
 * The stroke skeleton (web/data.js zh/ja, 0..1000, y down) is used for structure only:
 *   1. parse: each stroke becomes legs, H (横), V (竖) or D (撇 捺 提), or a dot (点).
 *      Turning strokes (折) are a run of H/V legs; hook tails (钩) are dropped or become a foot.
 *   2. lattice: H legs cluster into levels, V legs into columns (dots join both). Levels are
 *      laid equally spaced in the cell, keeping at least G.white tapes of white between facing
 *      strips; if the cell cannot hold that, the tape gets thinner, and at G.wMin the white
 *      becomes a hairline slit (Sato's dense block with slits). A level near the middle row
 *      line snaps to it. Everything else (diagonal ends, free tips) follows a monotone warp
 *      through the levels/columns.
 *   3. geometry: H/V legs are strips on their level/column, a turning stroke is one strip with
 *      bends; ends that touch another strip stop on its line, L corners of separate strokes
 *      merge into one strip (so the bend is rounded). D legs are one-tape slabs cut flush
 *      (horizontal cuts when steep or meeting a bar, vertical when shallow or meeting a post).
 *      Short shallow 撇 become bars, dots become square blocks.
 * Output: the glyphs/manual JSON format (strips/polys/cuts/sharp).
 * Classic <script> sets globalThis.TapeGrid; Node: module.exports.
 */
(function (root) {
  const G = {
    eps: 0.03,      // RDP tolerance on the skeleton (em)
    hv: 24,         // degrees: a leg this close to horizontal/vertical is H/V
    dot: 0.11,      // a stroke shorter than this (em) is a dot
    serif: 0.045,   // a first leg shorter than this is an entry serif, dropped
    hook: 0.14,     // a last leg shorter than this that turns sharply is a hook tail
    bar: 0.3,       // a shallow 撇/提 shorter than this (em) becomes a flat bar
    join: 0.1,      // a leg end this close (em) to another strip's line touches it
    tolNear: 0.03,  // overlapping bars this close (em) share one level
    tolFar: 0.07,   // bars side by side this close share one level (left radical on the right part's levels)
    equal: 0.5,     // level spacing: 0 = as in the skeleton, 1 = equally spaced
    white: 0.3,     // least white between facing strips, in tapes
    poke: 0.4,      // least distance from the outer strip to a free tip beyond it, in tapes
    slit: 0.02,     // dense trick: white between strips becomes a hairline slit this wide
    wDense: 0.09,   // tape for 16+ strokes
    wMin: 0.07,     // thinnest tape
    mid: 0.48,      // middle row line
    midSnap: 0.05,  // a level this close to the middle row line moves onto it
    foot: 0.17,
    kanaD: 0.15,    // kana: a diagonal longer than this (em) becomes an H/V run     // length of a foot that replaces a hook (cell units)
    markH: 0.27,    // ゛: two posts from the top to this
    markGap: 0.035, // white between the two posts
    ringR: 0.1,     // ゜: ring radius
    ringHole: 0.035,
    markSqueeze: 0.8, // least sideways squeeze of the base to fit the marks right of its posts
  };

  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const lineDist = (p, a, b) => Math.abs((b[1] - a[1]) * (p[0] - a[0]) - (b[0] - a[0]) * (p[1] - a[1])) / (dist(a, b) || 1e-9);
  const len = (pts) => pts.reduce((s, p, i) => (i ? s + dist(p, pts[i - 1]) : 0), 0);

  function rdp(pts, eps) {
    if (pts.length < 3) return pts;
    const [a, b] = [pts[0], pts[pts.length - 1]];
    const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1e-9;
    let best = -1, bi = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs(dy * (pts[i][0] - a[0]) - dx * (pts[i][1] - a[1])) / n;
      if (d > best) { best = d; bi = i; }
    }
    if (best <= eps) return [a, b];
    return rdp(pts.slice(0, bi + 1), eps).slice(0, -1).concat(rdp(pts.slice(bi), eps));
  }

  // ---------- 1. parse ----------

  function kind(a, b) {
    const ang = (Math.atan2(Math.abs(b[1] - a[1]), Math.abs(b[0] - a[0])) * 180) / Math.PI;
    return ang < G.hv ? "H" : ang > 90 - G.hv ? "V" : "D";
  }

  function parse(stroke, kana) {
    const raw = stroke.map((p) => [p[0] / 1000, p[1] / 1000]);
    const pts = rdp(raw, G.eps);
    if (len(pts) < G.dot) {
      const c = raw.reduce((s, p) => [s[0] + p[0] / raw.length, s[1] + p[1] / raw.length], [0, 0]);
      return { dot: c };
    }
    let legs = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], t = kind(a, b), L = legs[legs.length - 1];
      const same = L && L.t === t && Math.sign(b[0] - a[0]) === Math.sign(L.b[0] - L.a[0]) && Math.sign(b[1] - a[1]) === Math.sign(L.b[1] - L.a[1]);
      if (same) { L.mid.push(L.b); L.b = b; } else legs.push({ t, a, b, mid: [] });
    }
    while (legs.length > 1 && dist(legs[0].a, legs[0].b) < G.serif) legs.shift();
    let foot = 0;
    if (legs.length > 1) {
      const h = legs[legs.length - 1], p = legs[legs.length - 2];
      const u = [h.b[0] - h.a[0], h.b[1] - h.a[1]], v = [p.b[0] - p.a[0], p.b[1] - p.a[1]];
      const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v) || 1);
      if (dist(h.a, h.b) < G.hook && cos < 0.5) {
        legs.pop();
        if (p.t === "V" && u[0] < 0) foot = -1;                          // 亅: post turns left into a foot
        else if (p.t === "H" && u[1] < 0) legs.push({ t: "V", a: h.a, b: [h.a[0], Math.min(h.b[1], h.a[1] - 0.08)] });  // 乚: up-tick
      }
    }
    // a short D between two H/V legs is a rounded corner of the skeleton
    legs = legs.filter((l, i) => !(l.t === "D" && i > 0 && i < legs.length - 1 && dist(l.a, l.b) < 0.08));
    // short shallow 撇/提 alone: a flat bar (禾 手 top)
    if (legs.length === 1 && legs[0].t === "D") {
      const l = legs[0], dx = Math.abs(l.b[0] - l.a[0]), dy = Math.abs(l.b[1] - l.a[1]);
      if (dx > 1.4 * dy && dist(l.a, l.b) < G.bar) legs[0] = { t: "H", a: l.a, b: [l.b[0], l.a[1]] };
    }
    // kana: Sato builds curves and long diagonals as H/V runs with rounded bends; the corner
    // goes on the side the curve bulges to (straight: down first)
    if (kana) {
      const nD = legs.filter((l) => l.t === "D" && dist(l.a, l.b) >= G.kanaD).length;
      legs = legs.flatMap((l) => {
        if (l.t !== "D" || dist(l.a, l.b) < G.kanaD) return [l];
        const c1 = [l.a[0], l.b[1]], c2 = [l.b[0], l.a[1]];
        const m = l.mid.reduce((best, q) => (lineDist(q, l.a, l.b) > lineDist(best, l.a, l.b) ? q : best), l.mid[0] || null);
        const curved = m && lineDist(m, l.a, l.b) > 0.02;
        // straight 捺 (さ き) and zigzags of straight diagonals (く へ) stay slabs
        if (!curved && ((l.b[0] > l.a[0] && l.b[1] > l.a[1]) || nD > 1)) return [l];
        const c = curved && dist(m, c2) < dist(m, c1) ? c2 : c1;
        return [{ t: kind(l.a, c), a: l.a, b: c, mid: [] }, { t: kind(c, l.b), a: c, b: l.b, mid: [] }];
      }).reduce((out, l) => {  // merge runs of the same kind
        const L = out[out.length - 1];
        if (L && L.t === l.t && l.t !== "D") L.b = l.b; else out.push(l);
        return out;
      }, []);
    }
    for (const l of legs) {  // H/V legs are exactly H/V from here on
      if (l.t === "H") { const y = (l.a[1] + l.b[1]) / 2; l.a = [l.a[0], y]; l.b = [l.b[0], y]; }
      if (l.t === "V") { const x = (l.a[0] + l.b[0]) / 2; l.a = [x, l.a[1]]; l.b = [x, l.b[1]]; }
    }
    return { legs, foot };
  }

  // ---------- 2. lattice ----------

  // items: {v, lo, hi} (position on this axis, span on the other). Returns clusters.
  function cluster(items) {
    const cl = [];
    [...items].sort((p, q) => p.v - q.v).forEach((it) => {
      const c = cl[cl.length - 1];
      if (c) {
        const over = c.items.some((o) => Math.min(o.hi, it.hi) - Math.max(o.lo, it.lo) > -0.02);
        if (it.v - c.v < (over ? G.tolNear : G.tolFar)) {
          c.items.push(it); it.c = c;
          const wt = c.items.reduce((s, o) => s + o.hi - o.lo + 0.01, 0);
          c.v = c.items.reduce((s, o) => s + o.v * (o.hi - o.lo + 0.01), 0) / wt;
          return;
        }
      }
      const n = { v: it.v, items: [it] };
      it.c = n; cl.push(n);
    });
    return cl;
  }

  // Knots on one axis (levels/columns plus free tips beyond them) -> cell positions.
  // Returns null when the cell cannot hold them with `white` (in tapes) between facing strips.
  function place(cl, tips, size, w, white, isY) {
    const lo = Math.min(...tips), hi = Math.max(...tips);
    const k = cl.map((c) => ({ v: c.v, level: true, c }));
    if (!k.length || lo < k[0].v - G.join / 2) k.unshift({ v: lo, level: false });
    if (!k.length || hi > k[k.length - 1].v + G.join / 2) k.push({ v: hi, level: false });
    if (k.length === 1) { k[0].p = size / 2; return k; }
    const faces = (A, B) => A.c.items.some((p) => B.c.items.some((q) => Math.min(p.hi, q.hi) - Math.max(p.lo, q.lo) > -0.02));
    const gaps = [], min = [], ll = [];
    for (let i = 0; i + 1 < k.length; i++) {
      const A = k[i], B = k[i + 1], both = A.level && B.level;
      gaps.push(Math.max(B.v - A.v, 1e-3));
      ll.push(both);
      min.push(both ? (faces(A, B) ? w * (1 + white) : 0.3 * w) : G.poke * w + w / 2);
    }
    const llg = gaps.filter((g, i) => ll[i]), eq = llg.length ? llg.reduce((s, g) => s + g, 0) / llg.length : 0;
    const t = gaps.map((g, i) => (ll[i] ? G.equal * eq + (1 - G.equal) * g : g));
    const p0 = k[0].level ? w / 2 : 0, p1 = size - (k[k.length - 1].level ? w / 2 : 0), T = p1 - p0;
    if (min.reduce((s, m) => s + m, 0) > T + 1e-9) return null;
    // water-fill: gaps below their minimum are pinned there, the rest share what is left
    const fixed = t.map(() => false);
    let g;
    for (;;) {
      const free = t.reduce((s, v, i) => s + (fixed[i] ? 0 : v), 0), left = T - min.reduce((s, m, i) => s + (fixed[i] ? m : 0), 0);
      g = t.map((v, i) => (fixed[i] ? min[i] : (v * left) / (free || 1)));
      const bad = g.findIndex((v, i) => !fixed[i] && v < min[i] - 1e-12);
      if (bad < 0) break;
      fixed[bad] = true;
    }
    k[0].p = p0;
    for (let i = 0; i < g.length; i++) k[i + 1].p = k[i].p + g[i];
    if (isY) {  // middle row line
      k.forEach((n, i) => {
        if (!n.level || !i || i === k.length - 1 || Math.abs(n.p - G.mid) > G.midSnap) return;
        if (G.mid - k[i - 1].p >= min[i - 1] && k[i + 1].p - G.mid >= min[i]) n.p = G.mid;
      });
    }
    return k;
  }

  function warper(k) {  // monotone piecewise-linear map through the knots
    return (v) => {
      if (k.length === 1) return k[0].p + (v - k[0].v);
      let i = 0;
      while (i < k.length - 2 && v > k[i + 1].v) i++;
      const a = k[i], b = k[i + 1];
      return a.p + ((v - a.v) / (b.v - a.v || 1e-9)) * (b.p - a.p);
    };
  }

  // ---------- 3. build ----------

  // ---------- dakuten / handakuten ----------

  // The marks are the last strokes of a kana: two short strokes (dakuten) or one zero-length one
  // (handakuten, a circle in the skeleton), at the top right.
  function marksOf(strokes) {
    const n = strokes.length, at = (s) => s.map((p) => [p[0] / 1000, p[1] / 1000]);
    const topRight = (s) => { const c = at(s).reduce((m, p, i, A) => [m[0] + p[0] / A.length, m[1] + p[1] / A.length], [0, 0]); return c[0] > 0.6 && c[1] < 0.45; };
    if (n >= 2 && len(at(strokes[n - 1])) < 0.03 && topRight(strokes[n - 1])) return { kind: "o", n: 1 };
    if (n >= 3 && [1, 2].every((i) => len(at(strokes[n - i])) < 0.14 && topRight(strokes[n - i]))) return { kind: "d", n: 2 };
    return null;
  }

  // Hand glyphs keep the base letter and clear the top-right corner for the marks: two short
  // posts (hiragana dakuten), two discs (katakana) or a ring (handakuten). The marks fit right of the base's tall posts when
  // there is room (thinner posts, a smaller ring); else base strips that run into the corner
  // are lowered (a bar that turns down, a free post top) or shortened (a free bar end), and
  // slabs and dots there move down or left, whichever is less.
  function addMarks(g, kind) {
    const a = g.aspect, w = g.w, gap = Math.max(G.white * w, 0.03);
    const tall = g.strips.flatMap((s) => s.slice(1).filter((q, i) => Math.abs(q[0] - s[i][0]) < 1e-6
      && Math.min(q[1], s[i][1]) < G.markH && Math.abs(q[1] - s[i][1]) > 0.45).map((q) => q[0] + w / 2 + gap));
    let right = Math.max(0, ...tall.filter((x) => x > a / 2));
    const kata = /[\u30a0-\u30ff]/.test(g.ch);
    const need = a - (kind !== "d" ? 0.16 : kata ? 0.26 : 2 * 0.06 + G.markGap);
    if (right > need && need / right >= G.markSqueeze) {  // squeeze the base sideways to make room
      const f = (need - w / 2 - gap) / (right - w / 2 - gap), sx = (P) => P.map(([x, y]) => [x * f, y]);
      g.strips = g.strips.map(sx); g.polys = g.polys.map(sx); right = need;
    }
    const room = a - right;
    const marks = [];
    let x0, y1;
    const circle = (c, r) => Array.from({ length: 20 }, (_, i) => [c[0] + r * Math.cos((i * Math.PI) / 10), c[1] + r * Math.sin((i * Math.PI) / 10)]);
    if (kind === "d" && !kata) {
      const bw = Math.min(w, (room - G.markGap) / 2) >= 0.055 ? Math.min(w, (room - G.markGap) / 2) : w;
      const rect = (x) => [[x - bw, 0], [x, 0], [x, G.markH], [x - bw, G.markH]];
      marks.push(rect(a), rect(a - bw - G.markGap));
      x0 = a - 2 * bw - G.markGap; y1 = G.markH;
    } else if (kind === "d") {  // katakana: two discs
      marks.push(circle([a - 0.065, 0.075], 0.06), circle([a - 0.2, 0.075], 0.06));
      x0 = a - 0.26; y1 = 0.135;
    } else {
      const R = Math.max(0.07, Math.min(G.ringR, (room - 0.01) / 2)), c = [a - R - 0.01, R + 0.02];
      marks.push(circle(c, R)); g.cuts.push(circle(c, G.ringHole * R / G.ringR));
      x0 = c[0] - R; y1 = c[1] + R;
    }
    const X = x0 - gap - w / 2, Y = y1 + gap + w / 2;  // centerline limits
    const out = [];
    for (let s of g.strips) {
      s = s.map((p) => p.slice());
      const closed = dist(s[0], s[s.length - 1]) < 0.02;
      for (let i = 0; i + 1 < s.length; i++) {  // bars first
        const p = s[i], q = s[i + 1];
        if (Math.abs(p[1] - q[1]) > 1e-6 || p[1] >= Y || Math.max(p[0], q[0]) <= X + 1e-6) continue;
        const free = closed ? -1 : i === 0 && p[0] > q[0] ? 0 : i + 2 === s.length && q[0] > p[0] ? 1 : -1;
        if (free >= 0 && Math.min(p[0], q[0]) < X - w && Math.max(p[0], q[0]) - X < Y - p[1]) (free ? q : p)[0] = X;
        else { p[1] = Y; q[1] = Y; }
      }
      for (let i = 0; i + 1 < s.length; i++) {  // then free post tops
        const p = s[i], q = s[i + 1];
        if (closed || Math.abs(p[0] - q[0]) > 1e-6 || p[0] <= X + 1e-6) continue;
        if (i === 0 && p[1] < Y && q[1] > p[1]) p[1] = Math.min(Y, q[1]);
        if (i + 2 === s.length && q[1] < Y && p[1] > q[1]) q[1] = Math.min(Y, p[1]);
      }
      s = s.filter((p, i) => !i || dist(p, s[i - 1]) > 1e-6);
      if (s.length > 1 && len(s) > w / 2) out.push(s);
    }
    g.strips = out;
    g.polys = g.polys.map((P) => {
      if (!P.some(([x, y]) => x > x0 - gap && y < y1 + gap)) return P;
      const dy = y1 + gap - Math.min(...P.map((p) => p[1])), dx = Math.max(...P.map((p) => p[0])) - (x0 - gap);
      return P.map(([x, y]) => (dy <= dx ? [x, y + dy] : [x - dx, y]));
    });
    g.sharp = g.polys.flat();
    g.polys.push(...marks);
    return g;
  }

  function build(ch, strokes, P) {
    const m = /[\u3040-\u30ff]/.test(ch) && marksOf(strokes);
    if (!m) return buildBase(ch, strokes, P);
    return addMarks(buildBase(ch, strokes.slice(0, -m.n), P), m.kind);
  }

  function buildBase(ch, strokes, P) {
    const a = P.aspect;
    const kana = /[\u3040-\u30ff]/.test(ch);
    const parsed = strokes.map((s) => parse(s, kana));
    const dots = parsed.filter((s) => s.dot).map((s) => s.dot);
    const st = parsed.filter((s) => s.legs && s.legs.length);
    const legs = st.flatMap((s) => s.legs);
    const hs = legs.filter((l) => l.t === "H"), vs = legs.filter((l) => l.t === "V");
    // touches: a leg end close to another strip's line stops on it
    const touch = (pt, self, axis) => {  // axis 0: look for a column (x), 1: a level (y)
      let best = null;
      for (const l of axis ? hs : vs) {
        if (l === self) continue;
        const v = l.a[axis], lo = Math.min(l.a[1 - axis], l.b[1 - axis]) - G.join, hi = Math.max(l.a[1 - axis], l.b[1 - axis]) + G.join;
        const d = Math.abs(pt[axis] - v);
        if (d < G.join && pt[1 - axis] > lo && pt[1 - axis] < hi && (!best || d < best.d)) best = { d, l };
      }
      return best && best.l;
    };
    for (const s of st) {
      const f = s.legs[0], l = s.legs[s.legs.length - 1];
      const ends = [[f, "a"], [l, "b"]];
      for (const [leg, e] of ends) {
        const pt = leg[e];
        if (leg.t === "H") leg[e + "x"] = touch(pt, leg, 0);
        else if (leg.t === "V") leg[e + "y"] = touch(pt, leg, 1);
        else { leg[e + "x"] = touch(pt, leg, 0); if (!leg[e + "x"]) leg[e + "y"] = touch(pt, leg, 1); }
      }
    }
    const d0 = 0.03;
    const yItems = hs.map((l) => ({ v: l.a[1], lo: Math.min(l.a[0], l.b[0]), hi: Math.max(l.a[0], l.b[0]), l }))
      .concat(dots.map((c) => ({ v: c[1], lo: c[0] - d0, hi: c[0] + d0, dot: c })));
    const xItems = vs.map((l) => ({ v: l.a[0], lo: Math.min(l.a[1], l.b[1]), hi: Math.max(l.a[1], l.b[1]), l }))
      .concat(dots.map((c) => ({ v: c[0], lo: c[1] - d0, hi: c[1] + d0, dot: c })));
    const levels = cluster(yItems), cols = cluster(xItems);
    const lvOf = new Map(yItems.map((it) => [it.l || it.dot, it.c])), colOf = new Map(xItems.map((it) => [it.l || it.dot, it.c]));
    // free tips: every end point that is not on a level (y) / column (x)
    const tipsY = levels.map((c) => c.v), tipsX = cols.map((c) => c.v);
    for (const l of legs) for (const e of ["a", "b"]) {
      if (l.t !== "H" && !l[e + "y"]) tipsY.push(l[e][1]);
      if (l.t !== "V" && !l[e + "x"]) tipsX.push(l[e][0]);
    }
    // tape width: the widest that leaves visible white everywhere, else the thinnest with slits
    let w = strokes.length >= 16 ? Math.min(P.w, G.wDense) : P.w, ky, kx;
    for (; ; w = Math.round((w - 0.005) * 1000) / 1000) {
      ky = place(levels, tipsY, 1, w, G.white, true); kx = place(cols, tipsX, a, w, G.white, false);
      if ((ky && kx) || w <= G.wMin + 1e-9) break;
    }
    const slitW = G.slit / w - 1;  // white = hairline
    if (!ky) ky = place(levels, tipsY, 1, w, slitW, true) || place(levels, tipsY, 1, w, -1, true);
    if (!kx) kx = place(cols, tipsX, a, w, slitW, false) || place(cols, tipsX, a, w, -1, false);
    const wy = warper(ky), wx = warper(kx);
    const pos = (c, kk) => kk.find((n) => n.c === c).p;
    const lvY = (l) => pos(lvOf.get(l), ky), colX = (l) => pos(colOf.get(l), kx);
    // end points in the cell
    const endPt = (l, e) => {
      const p = l[e];
      if (l.t === "H") return [l[e + "x"] ? colX(l[e + "x"]) : wx(p[0]), lvY(l)];
      if (l.t === "V") return [colX(l), l[e + "y"] ? lvY(l[e + "y"]) : wy(p[1])];
      return [l[e + "x"] ? colX(l[e + "x"]) : wx(p[0]), l[e + "y"] ? lvY(l[e + "y"]) : wy(p[1])];
    };
    const corner = (A, B) => {  // shared point of consecutive legs A -> B
      if (A.t === "H" && B.t === "V") return [[colX(B), lvY(A)]];
      if (A.t === "V" && B.t === "H") return [[colX(A), lvY(B)]];
      if (A.t === "H" && B.t === "H") { const x = wx(A.b[0]); return [[x, lvY(A)], [x, lvY(B)]]; }
      if (A.t === "V" && B.t === "V") { const y = wy(A.b[1]); return [[colX(A), y], [colX(B), y]]; }
      if (A.t === "H") return [[wx(A.b[0]), lvY(A)]];
      if (A.t === "V") return [[colX(A), wy(A.b[1])]];
      if (B.t === "H") return [[wx(B.a[0]), lvY(B)]];
      if (B.t === "V") return [[colX(B), wy(B.a[1])]];
      return [[wx(A.b[0]), wy(A.b[1])]];
    };
    const strips = [], polys = [], sharp = [];
    const slab = (p, q, cp, cq) => {  // one-tape band p->q, each end cut 'h' or 'v'
      const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
      if (L < 1e-6) return;
      const n = [-dy / L, dx / L];
      const fix = (c) => (c === "h" && Math.abs(dy) < 0.3 * L ? "v" : c === "v" && Math.abs(dx) < 0.3 * L ? "h" : c);
      cp = fix(cp); cq = fix(cq);
      const off = (c) => (c === "h" ? [(Math.sign(n[0]) * w * L) / (2 * Math.abs(dy)), 0] : [0, (Math.sign(n[1]) * w * L) / (2 * Math.abs(dx))]);
      const [op, oq] = [off(cp), off(cq)];
      const poly = [[p[0] + op[0], p[1] + op[1]], [q[0] + oq[0], q[1] + oq[1]], [q[0] - oq[0], q[1] - oq[1]], [p[0] - op[0], p[1] - op[1]]];
      polys.push(poly); sharp.push(...poly);
    };
    for (const s of st) {
      const L = s.legs;
      const pts = [endPt(L[0], "a")];
      const segs = [];  // segs[i]: leg of pts[i] -> pts[i+1]
      L.forEach((l, i) => {
        const nx = i + 1 < L.length ? corner(l, L[i + 1]) : [endPt(l, "b")];
        nx.forEach((p, j) => { pts.push(p); segs.push(j ? { t: L[i + 1].t === "H" ? "V" : "H" } : l); });
      });
      if (s.foot && L[L.length - 1].t === "V") {
        const e = pts[pts.length - 1];
        pts.push([Math.max(e[0] - G.foot, 0), e[1]]); segs.push({ t: "H" });
      }
      // split at D legs: H/V runs become strips, D legs slabs
      let run = [pts[0]];
      segs.forEach((l, i) => {
        const p = pts[i], q = pts[i + 1];
        if (l.t !== "D") { run.push(q); return; }
        if (run.length > 1) strips.push(run);
        // cut along the strip it meets: a bar -> horizontal, a post -> vertical; free: by slope
        const cut = (nb, e) => (nb ? (nb.t === "H" ? "h" : "v") : l[e + "y"] ? "h" : l[e + "x"] ? "v"
          : Math.abs(q[1] - p[1]) >= Math.abs(q[0] - p[0]) ? "h" : "v");
        slab(p, q, cut(segs[i - 1], "a"), cut(segs[i + 1], "b"));
        run = [q];
      });
      if (run.length > 1) strips.push(run);
    }
    for (const c of dots) {
      const cx = colOf.has(c) ? pos(colOf.get(c), kx) : wx(c[0]), cy = levels.length && lvOf.has(c) ? pos(lvOf.get(c), ky) : wy(c[1]), h = w / 2;
      polys.push([[cx - h, cy - h], [cx + h, cy - h], [cx + h, cy + h], [cx - h, cy + h]]);
    }
    // ponytail: rare extrapolated tips (11 of 11190 chars) can leave the cell; clamp instead of solving them
    const clamp = (s) => s.map(([x, y]) => [Math.min(Math.max(x, 0), a), Math.min(Math.max(y, 0), 1)]);
    return { ch, aspect: a, w, strips: mergeCorners(strips, w).map(clamp), polys, cuts: [], sharp, hand: false };
  }

  // Strips whose ends meet at one point (an L corner of two strokes) become one strip, so the
  // bend is rounded; a closed loop restarts mid-side (a loop closed at a corner leaves a notch).
  // Other ends that stop on a strip's line run on by half a tape so the corner is filled.
  function mergeCorners(strips, w) {
    const S = strips.map((s) => s.filter((p, i) => !i || dist(p, s[i - 1]) > 1e-6)).filter((s) => s.length > 1);
    const key = (p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
    for (let changed = true; changed; ) {
      changed = false;
      const ends = new Map();
      S.forEach((s, i) => { if (!s.closed) for (const e of [0, 1]) { const k = key(e ? s[s.length - 1] : s[0]); ends.set(k, (ends.get(k) || []).concat([[i, e]])); } });
      for (const [, list] of ends) {
        if (list.length !== 2 || list[0][0] === list[1][0]) {
          if (list.length === 2 && list[0][0] === list[1][0]) S[list[0][0]].closed = true;
          continue;
        }
        const [[i, ei], [j, ej]] = list;
        let A = S[i], B = S[j];
        if (!ei) A = A.slice().reverse();
        if (ej) B = B.slice().reverse();
        S[i] = A.concat(B.slice(1)); S[j] = null;
        changed = true;
        break;
      }
      for (let i = S.length - 1; i >= 0; i--) if (!S[i]) S.splice(i, 1);
    }
    const onLine = (p, self) => S.some((o) => o !== self && o.some((a, i) => {
      const b = o[i + 1];
      if (!b) return false;
      const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1e-12;
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2));
      return dist(p, [a[0] + t * dx, a[1] + t * dy]) < 1e-4;
    }));
    for (const s of S) {
      if (s.closed) continue;
      for (const [e, nb] of [[0, 1], [s.length - 1, s.length - 2]]) {
        if (!onLine(s[e], s)) continue;
        const L = dist(s[e], s[nb]);
        if (L > 1e-6) s[e] = [s[e][0] + ((s[e][0] - s[nb][0]) / L) * w / 2, s[e][1] + ((s[e][1] - s[nb][1]) / L) * w / 2];
      }
    }
    return S.map((s) => {
      if (s.closed || (s.length > 3 && dist(s[0], s[s.length - 1]) < 1e-6)) {  // loop: restart mid-side
        const r = s.slice(0, -1);
        let bi = 0;
        r.forEach((p, i) => { if (dist(p, r[(i + 1) % r.length]) > dist(r[bi], r[(bi + 1) % r.length])) bi = i; });
        const a = r[bi], b = r[(bi + 1) % r.length], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const o = r.slice(bi + 1).concat(r.slice(0, bi + 1));
        const L = dist(a, b), m2 = [m[0] + ((b[0] - a[0]) / L) * 0.01, m[1] + ((b[1] - a[1]) / L) * 0.01];
        return [m].concat(o, [m2]);
      }
      return s;
    });
  }

  const api = { G, build, parse, marksOf };
  root.TapeGrid = api;
  if (typeof module !== "undefined") module.exports = api;
})(globalThis);
