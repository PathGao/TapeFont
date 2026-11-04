/* Sato's lattice generator: a glyph for a char without a hand glyph, built the way Sato builds
 * letters (docs/book_method.md): equally spaced horizontal and vertical strips first, then cut.
 *
 * The stroke skeleton (web/data.js zh/ja, 0..1000, y down) is used for structure only:
 *   1. parse: each stroke becomes legs, H (横), V (竖) or D (撇 捺 提), or a dot (点).
 *      Turning strokes (折) are a run of H/V legs; hook tails (钩) are dropped or become a foot.
 *   2. lattice: H legs cluster into levels, V legs into columns (dots join both). Levels are
 *      laid equally spaced in the cell, keeping at least G.white tapes of white between facing
 *      strips (also across non-facing levels between them); if the cell cannot hold that, the
 *      white inside enclosures (口 日 目) becomes a hairline slit, so they read as Sato's solid
 *      block with slits, and only then the tape gets thinner; at G.wMin all white may become
 *      slits. A level near the middle row
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
    join: 0.055,    // a leg end this close (em, half a tape) to another strip's line touches it
    joinSpan: 0.1,  // ... if it is within this of the strip's span
    skelW: 0.025,   // holes: the skeleton drawn this wide (em) has as many holes as the char
    skelExt: 0.03,  // ... with its stroke ends grown by this (em)
    holeRows: 120,  // holes are counted on a grid this many rows high
    near: 0.1,      // an end that stops short of a line this close (em) keeps G.white tapes of white to it
    tolNear: 0.03,  // overlapping bars this close (em) share one level
    tolFar: 0.07,   // bars side by side this close share one level (left radical on the right part's levels)
    equal: 0.5,     // level spacing: 0 = as in the skeleton, 1 = equally spaced
    white: 0.3,     // least white between facing strips, in tapes
    poke: 0.4,      // least distance from the outer strip to a free tip beyond it, in tapes
    slit: 0.02,     // dense trick: white between strips becomes a hairline slit this wide
    wDense: 0.09,   // tape for 16+ strokes
    wMin: 0.07,     // thinnest tape
    blockW: 0.11,   // at this tape or thinner, enclosures that cannot keep the white become blocks with slits
                    // (at 0.07 a 0.3-tape white is as thin as a slit, so blocks only matter above it)
    mid: 0.48,      // middle row line
    midSnap: 0.05,  // a level this close to the middle row line moves onto it
    foot: 0.17,
    kanaD: 0.15,    // kana: a diagonal longer than this (em) becomes an H/V run     // length of a foot that replaces a hook (cell units)
    kanaTick: 0.25, // kana: a lone diagonal shorter than this (em) is a tick, built as a short bar or post
    pieTail: 0.15,  // 撇 tail longer than this after a post: the stroke becomes one post with a foot
    pieX: 0,        // where that post goes: 0 = the post, 1 = the tail end
    dotMid: 0.2,    // ... and this close to the bar's middle (in bar lengths)
    dotPost: 0.25,  // a top dot this close (em) above a bar is a post down to it
    dotLen: 0.2,    // a lone diagonal shorter than this (em) is a dot (氵 灬 点)
    dotNear: 0.06,  // a dot whose end is this close (em) to a bar or post it points at is joined to it
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
      return { dot: c, dir: [raw[raw.length - 1][0] - raw[0][0], raw[raw.length - 1][1] - raw[0][1]] };
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
    // 广 厂 方: a 撇 that starts as a post is a candidate for one post with a left foot (see build)
    let pie = false;
    if (!kana && legs.length === 2 && legs[0].t === "V" && legs[1].t === "D") {
      const [v, d] = legs;
      pie = d.b[0] < d.a[0] - 0.05 && d.b[1] > d.a[1] && v.b[1] > v.a[1] && dist(d.a, d.b) > G.pieTail;
    }
    // short shallow 撇/提 alone: a flat bar (禾 手 top)
    if (legs.length === 1 && legs[0].t === "D") {
      const l = legs[0], dx = Math.abs(l.b[0] - l.a[0]), dy = Math.abs(l.b[1] - l.a[1]);
      if (dx > 1.4 * dy && dist(l.a, l.b) < G.bar) legs[0] = { t: "H", a: l.a, b: [l.b[0], l.a[1]] };
      // kana ticks (シ ン ツ ソ): a short bar or post, whichever the tick is closer to
      else if (kana && dist(l.a, l.b) < G.kanaTick) {
        const m = [(l.a[0] + l.b[0]) / 2, (l.a[1] + l.b[1]) / 2];
        legs[0] = dx >= dy ? { t: "H", a: [l.a[0], m[1]], b: [l.b[0], m[1]] } : { t: "V", a: [m[0], l.a[1]], b: [m[0], l.b[1]] };
      }
    }
    // kana: Sato builds curves and long diagonals as H/V runs with rounded bends; the corner
    // goes on the side the curve bulges to (straight: the lower corner, so ticks turn up)
    if (kana) {
      // a steep lead-in into a post is part of the post (い right)
      if (legs.length > 1 && legs[0].t === "D" && legs[1].t === "V" && Math.abs(legs[0].b[1] - legs[0].a[1]) >= 0.8 * Math.abs(legs[0].b[0] - legs[0].a[0]))
        legs.splice(0, 2, { t: "V", a: [legs[1].a[0], legs[0].a[1]], b: legs[1].b, mid: [] });
      const nD =legs.filter((l) => l.t === "D" && dist(l.a, l.b) >= G.kanaD).length;
      legs = legs.flatMap((l, i) => {
        if (l.t !== "D" || dist(l.a, l.b) < G.kanaD) return [l];
        const c1 = [l.a[0], l.b[1]], c2 = [l.b[0], l.a[1]];
        const m = l.mid.reduce((best, q) => (lineDist(q, l.a, l.b) > lineDist(best, l.a, l.b) ? q : best), l.mid[0] || null);
        const curved = m && lineDist(m, l.a, l.b) > 0.02;
        // straight 捺 (さ き) and zigzags of straight diagonals (く へ) stay slabs; a 捺 after a post is its foot (い)
        if (!curved && ((!i && l.b[0] > l.a[0] && l.b[1] > l.a[1]) || nD > 1)) return [l];
        const c = curved ? (dist(m, c2) < dist(m, c1) ? c2 : c1) : c1[1] >= c2[1] ? c1 : c2;
        // a stroke that starts with a curve over the top starts with a bar at mid height (と)
        if (curved && !i && legs.length > 1 && c === c2 && l.b[1] > l.a[1] + 0.1) {
          const y = (l.a[1] + l.b[1]) / 2;
          return [{ t: "H", a: [l.a[0], y], b: [l.b[0], y], mid: [] }, { t: "V", a: [l.b[0], y], b: l.b, mid: [] }];
        }
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
    return { legs, foot, pie };
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
  // enc(A, B): facing clusters inside one enclosure (口 日 目); in the dense pass they get only a
  // hairline slit, so the enclosure reads as one solid block with slits (book_method.md).
  function place(cl, tips, size, w, white, isY, enc) {
    const lo = Math.min(...tips), hi = Math.max(...tips);
    const k = cl.map((c) => ({ v: c.v, level: true, c }));
    if (!k.length || lo < k[0].v - G.joinSpan / 2) k.unshift({ v: lo, level: false });
    if (!k.length || hi > k[k.length - 1].v + G.joinSpan / 2) k.push({ v: hi, level: false });
    if (k.length === 1) { k[0].p = size / 2; return k; }
    const faces = (A, B) => A.c.items.some((p) => B.c.items.some((q) => Math.min(p.hi, q.hi) - Math.max(p.lo, q.lo) > -0.02));
    const gaps = [], min = [], ll = [];
    for (let i = 0; i + 1 < k.length; i++) {
      const A = k[i], B = k[i + 1], both = A.level && B.level;
      gaps.push(Math.max(B.v - A.v, 1e-3));
      ll.push(both);
      min.push(both ? (faces(A, B) ? (enc && enc(A.c, B.c) ? w + G.slit : w * (1 + white)) : 0.3 * w) : G.poke * w + w / 2);
    }
    // facing levels with non-facing ones between them still keep the white (sum of the gaps)
    for (let i = 0; i < k.length; i++) for (let j = i + 2; j < k.length; j++) {
      if (!k.slice(i, j + 1).every((n) => n.level) || !faces(k[i], k[j])) continue;
      const need = enc && enc(k[i].c, k[j].c) ? w + G.slit : w * (1 + white), have = min.slice(i, j).reduce((s, m) => s + m, 0);
      if (have < need) for (let g = i; g < j; g++) min[g] *= need / have;
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

  function warper(k, size) {  // monotone piecewise-linear map through the knots, within the cell
    return (v) => {
      if (k.length === 1) return k[0].p + (v - k[0].v);
      let i = 0;
      while (i < k.length - 2 && v > k[i + 1].v) i++;
      const a = k[i], b = k[i + 1];
      return Math.min(Math.max(a.p + ((v - a.v) / (b.v - a.v || 1e-9)) * (b.p - a.p), 0), size);  // a tip past the outer level without a knot: at most to the edge
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
    if (!m) return buildHoles(ch, strokes, P);
    return addMarks(buildHoles(ch, strokes.slice(0, -m.n), P), m.kind);
  }

  // ---------- holes ----------

  // Ink mask of a glyph or a skeleton on a coarse grid (rows x cols, cell x 0..a, y 0..1).
  function raster(g, a, rows) {
    const cols = Math.round(a * rows), m = new Uint8Array(rows * cols);
    const fill = (inside, x0, x1, y0, y1) => {
      for (let r = Math.max(0, Math.floor(y0 * rows)); r < Math.min(rows, Math.ceil(y1 * rows)); r++)
        for (let c = Math.max(0, Math.floor(x0 * rows)); c < Math.min(cols, Math.ceil(x1 * rows)); c++)
          if (!m[r * cols + c] && inside((c + 0.5) / rows, (r + 0.5) / rows)) m[r * cols + c] = 1;
    };
    const h = g.w / 2;
    for (const s of g.strips) for (let i = 0; i + 1 < s.length; i++) {  // butt ends, joints filled
      const p = s[i], q = s[i + 1], ea = i > 0 ? h : 0, eb = i + 2 < s.length ? h : 0;
      if (Math.abs(p[1] - q[1]) < 1e-9) { const [lo, hi] = p[0] < q[0] ? [p[0] - ea, q[0] + eb] : [q[0] - eb, p[0] + ea]; fill(() => true, lo, hi, p[1] - h, p[1] + h); }
      else { const [lo, hi] = p[1] < q[1] ? [p[1] - ea, q[1] + eb] : [q[1] - eb, p[1] + ea]; fill(() => true, p[0] - h, p[0] + h, lo, hi); }
    }
    for (const P of g.polys) {
      const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
      fill((x, y) => P.reduce((ins, p, i) => { const q = P[(i + 1) % P.length]; return (p[1] > y) !== (q[1] > y) && x < p[0] + ((y - p[1]) * (q[0] - p[0])) / (q[1] - p[1]) ? !ins : ins; }, false),
        Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys));
    }
    for (const s of g.lines || []) for (let i = 0; i + 1 < s.length; i++) {  // skeleton polylines, g.w wide
      const p = s[i], q = s[i + 1];
      fill((x, y) => lineSegDist([x, y], p, q) < h, Math.min(p[0], q[0]) - h, Math.max(p[0], q[0]) + h, Math.min(p[1], q[1]) - h, Math.max(p[1], q[1]) + h);
    }
    return { m, rows, cols };
  }
  const lineSegDist = (p, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1e-12)));
    return dist(p, [a[0] + t * dx, a[1] + t * dy]);
  };

  // Enclosed white regions (4-connected, not touching the border, larger than a speck), as src/preview.py counts them.
  function holes({ m, rows, cols }) {
    const seen = new Uint8Array(m.length);
    let n = 0;
    for (let i = 0; i < m.length; i++) {
      if (m[i] || seen[i]) continue;
      let area = 0, edge = false;
      const stack = [i];
      seen[i] = 1;
      while (stack.length) {
        const j = stack.pop(), r = (j / cols) | 0, c = j % cols;
        area++;
        if (!r || !c || r === rows - 1 || c === cols - 1) edge = true;
        for (const k of [c > 0 ? j - 1 : -1, c < cols - 1 ? j + 1 : -1, r > 0 ? j - cols : -1, r < rows - 1 ? j + cols : -1])
          if (k >= 0 && !m[k] && !seen[k]) { seen[k] = 1; stack.push(k); }
      }
      if (!edge && area > 0.0008 * rows * cols) n++;
    }
    return n;
  }

  // The lattice closes gaps the char leaves open (an end stops on a line it only comes near). The
  // skeleton drawn thin tells how many holes the char has; while the glyph has more, the touch whose
  // undoing removes the most holes is undone (that end keeps G.white tapes of white to the line).
  function buildHoles(ch, strokes, P) {
    const grow = (p, q) => { const d = dist(p, q) || 1; return [p[0] + ((p[0] - q[0]) / d) * G.skelExt, p[1] + ((p[1] - q[1]) / d) * G.skelExt]; };
    const lines = strokes.map((s) => s.map((p) => [p[0] / 1000, p[1] / 1000])).filter((s) => s.length > 1)  // ends grown a little: skeleton strokes stop just short of the line they meet
      .map((s) => [grow(s[0], s[1]), ...s, grow(s[s.length - 1], s[s.length - 2])]);
    const want = holes(raster({ w: G.skelW, strips: [], polys: [], lines }, 1, G.holeRows));
    const count = (g) => holes(raster(g, g.aspect, G.holeRows));
    const cut = new Set();
    let g = buildBase(ch, strokes, P, cut), h = count(g);
    while (h > want) {
      let best = null;
      for (const k of g.touched) {
        if (cut.has(k)) continue;
        const c2 = new Set(cut).add(k), g2 = buildBase(ch, strokes, P, c2), h2 = count(g2);
        if (h2 < h && (!best || h2 < best.h)) best = { k, g: g2, h: h2 };
      }
      if (!best) break;
      cut.add(best.k); g = best.g; h = best.h;
    }
    delete g.touched;
    return g;
  }

  function buildBase(ch, strokes, P, cut) {
    const a = P.aspect;
    const kana = /[\u3040-\u30ff]/.test(ch);
    const parsed = strokes.map((s) => parse(s, kana));
    let st = parsed.filter((s) => s.legs && s.legs.length);
    // 广 厂: a 撇 hanging from the left end of a bar is a post down to the tail's end with a left foot
    const bars = st.flatMap((s) => s.legs).filter((l) => l.t === "H");
    for (const s of st) {
      if (!s.pie) continue;
      const [v, d] = s.legs, top = v.a;
      if (!bars.some((h) => Math.abs(h.a[1] - top[1]) < G.joinSpan && Math.abs(Math.min(h.a[0], h.b[0]) - top[0]) < G.joinSpan && Math.max(h.a[0], h.b[0]) > top[0] + 0.3)) continue;
      const x = G.pieX * d.b[0] + (1 - G.pieX) * v.a[0];
      s.legs = [{ t: "V", a: [x, top[1]], b: [x, d.b[1]], mid: [] }];
      s.foot = -1;
    }
    // the top dot over a bar or roof (宀 亠 言 立 文): the bar right under it, nothing above it
    const posts = st.flatMap((s) => s.legs).filter((l) => l.t === "V");
    const barUnder = (c) => {
      const bar = bars.filter((l) => c[0] > Math.min(l.a[0], l.b[0]) - G.joinSpan && c[0] < Math.max(l.a[0], l.b[0]) + G.joinSpan)
        .reduce((b, l) => (!b || l.a[1] < b.a[1] ? l : b), null);
      return bar && bar.a[1] > c[1] && bar.a[1] - c[1] < G.dotPost && Math.abs(c[0] - (bar.a[0] + bar.b[0]) / 2) < G.dotMid * Math.abs(bar.b[0] - bar.a[0])
        && !posts.some((l) => Math.abs(l.a[0] - c[0]) < G.joinSpan && Math.min(l.a[1], l.b[1]) < c[1]) ? bar : null;
    };
    for (const s of kana ? [] : st) {  // a short slanted top dot (言 主) is a dot too
      const l = s.legs[0], m = [(l.a[0] + l.b[0]) / 2, (l.a[1] + l.b[1]) / 2];
      if (s.legs.length === 1 && l.t === "D" && dist(l.a, l.b) < G.dotPost && barUnder(m)) { s.dot = m; s.legs = null; }
    }
    // other dots (氵 冫 灬 and short slanted 点) are never floating squares: a bar or post along the
    // dot's own direction, at least 2 tapes long, joined to a strip it points at within G.dotNear
    for (const s of parsed) {
      const D = s.legs && s.legs.length === 1 && !s.pie && dist(s.legs[0].a, s.legs[0].b) < G.dotLen ? s.legs[0] : null;
      if (!D && !s.dir) continue;
      const c = D ? [(D.a[0] + D.b[0]) / 2, (D.a[1] + D.b[1]) / 2] : s.dot, v = D ? [D.b[0] - D.a[0], D.b[1] - D.a[1]] : s.dir;
      if (!kana && barUnder(c)) { s.dot = c; s.legs = null; continue; }
      const ax = Math.abs(v[1]) > Math.abs(v[0]) ? 1 : 0, o = 1 - ax, sg = Math.sign(v[ax]) || 1, ex = Math.max(Math.abs(v[ax]) / 2, 0.02);
      let best = null;
      for (const l of ax ? bars : posts) {
        const g = (l.a[ax] - c[ax]) * sg - ex;  // white from the dot's end to the strip, ahead of the dot
        if (dist(l.a, l.b) >= G.dotLen && c[o] > Math.min(l.a[o], l.b[o]) - 0.02 && c[o] < Math.max(l.a[o], l.b[o]) + 0.02
          && g > -ex && g < G.dotNear && (!best || g < best.g)) best = { g, l };
      }
      const at = (t) => { const p = c.slice(); p[ax] = t; return p; };
      s.legs = [Object.assign(D || { mid: [] }, { t: ax ? "V" : "H", a: at(c[ax] - sg * ex), b: at(best ? best.l.a[ax] : c[ax] + sg * ex) })];  // same object: bars/posts lists stay valid
      s.dot = null; s.isDot = true;
    }
    st = parsed.filter((s) => s.legs && s.legs.length);
    const dots = parsed.filter((s) => s.dot).map((s) => s.dot);
    const legs = st.flatMap((s) => s.legs);
    const hs = legs.filter((l) => l.t === "H"), vs = legs.filter((l) => l.t === "V");
    // touches: a leg end close to another strip's line stops on it
    const touch = (pt, self, axis, r) => {  // axis 0: look for a column (x), 1: a level (y)
      const body = pt === self.a ? self.b : self.a;
      let best = null;
      for (const l of axis ? hs : vs) {
        if (l === self) continue;
        const v = l.a[axis], lo = Math.min(l.a[1 - axis], l.b[1 - axis]) - G.joinSpan, hi = Math.max(l.a[1 - axis], l.b[1 - axis]) + G.joinSpan;
        const d = Math.abs(pt[axis] - v);
        // an end short of the line touches within G.join, one that ran past it (overshoot) within G.joinSpan
        const rr = r || ((pt[axis] - v) * (body[axis] - v) < 0 ? G.joinSpan : G.join);
        if (d < rr && pt[1 - axis] > lo && pt[1 - axis] < hi && (!best || d < best.d)) best = { d, l };
      }
      return best && best.l;
    };
    // an H/V end that stops short of a line (within G.near) keeps G.white tapes of white to it (see endPt);
    // so does an end in `cut` (a touch that closed a hole the skeleton does not have, see build), on its body's side
    const nearEnd = (leg, e, axis, body) => {
      const l = touch(leg[e], leg, axis, G.near);
      return l && { l, s: Math.sign((body ? leg[e === "a" ? "b" : "a"] : leg[e])[axis] - l.a[axis]) || 1 };
    };
    const touched = [];
    st.forEach((s, si) => {
      const f = s.legs[0], l = s.legs[s.legs.length - 1];
      for (const [leg, e] of [[f, "a"], [l, "b"]]) {
        const pt = leg[e], k = si + e, no = cut && cut.has(k);
        if (leg.t === "H") { leg[e + "x"] = !no && touch(pt, leg, 0); if (!leg[e + "x"]) leg[e + "n"] = nearEnd(leg, e, 0, no); }
        else if (leg.t === "V") { leg[e + "y"] = !no && touch(pt, leg, 1); if (!leg[e + "y"]) leg[e + "n"] = nearEnd(leg, e, 1, no); }
        else if (!no) { leg[e + "x"] = touch(pt, leg, 0); if (!leg[e + "x"]) leg[e + "y"] = touch(pt, leg, 1); }
        // a touch near the other strip's end is a corner (口 金 frames): it stays closed
        const o = leg[e + "x"] || leg[e + "y"];
        if (o && Math.min(dist(pt, o.a), dist(pt, o.b)) > G.joinSpan) touched.push(k);
      }
    });
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
    // enclosures: facing bars (posts) with posts (bars) on both sides spanning both of them
    const spans = (l, lo, hi, ax) => Math.min(l.a[ax], l.b[ax]) <= lo + G.joinSpan && Math.max(l.a[ax], l.b[ax]) >= hi - G.joinSpan;
    const enclosed = (A, B, sides, ax) => A.items.some((p) => p.l && B.items.some((q) => {
      if (!q.l) return false;
      const lo = Math.max(p.lo, q.lo), hi = Math.min(p.hi, q.hi);
      if (hi - lo < 0.02) return false;
      const wall = (side) => sides.some((s) => (side ? s.a[1 - ax] >= hi - G.joinSpan : s.a[1 - ax] <= lo + G.joinSpan) && spans(s, A.v, B.v, ax));
      return wall(0) && wall(1);
    }));
    const encY = (A, B) => enclosed(A, B, vs, 1), encX = (A, B) => enclosed(A, B, hs, 0);
    const w0 = strokes.length >= 16 ? Math.min(P.w, G.wDense) : P.w;
    let w, ky, kx;
    // dense: if even the thinnest tape cannot keep the white, enclosures become blocks with slits
    for (w = w0; ; w = Math.round((w - 0.005) * 1000) / 1000) {
      for (const enc of w <= G.blockW + 1e-9 ? [false, true] : [false]) {
        ky = place(levels, tipsY, 1, w, G.white, true, enc && encY); kx = place(cols, tipsX, a, w, G.white, false, enc && encX);
        if (ky && kx) break;
      }
      if ((ky && kx) || w <= G.wMin + 1e-9) break;
    }
    const slitW = G.slit / w;  // white = hairline
    if (!ky) ky = place(levels, tipsY, 1, w, slitW, true) || place(levels, tipsY, 1, w, -1, true);
    if (!kx) kx = place(cols, tipsX, a, w, slitW, false) || place(cols, tipsX, a, w, -1, false);
    const wy = warper(ky, 1), wx = warper(kx, a);
    const pos = (c, kk) => kk.find((n) => n.c === c).p;
    const lvY = (l) => pos(lvOf.get(l), ky), colX = (l) => pos(colOf.get(l), kx);
    // end points in the cell
    const endPt = (l, e) => {
      const p = l[e], n = l[e + "n"];
      const keep = (v, X, hi) => (n && (v - X) * n.s < w / 2 + G.white * w ? Math.min(Math.max(X + n.s * (w / 2 + G.white * w), 0), hi) : v);
      if (l.t === "H") return [l[e + "x"] ? colX(l[e + "x"]) : n ? keep(wx(p[0]), colX(n.l), a) : wx(p[0]), lvY(l)];
      if (l.t === "V") return [colX(l), l[e + "y"] ? lvY(l[e + "y"]) : n ? keep(wy(p[1]), lvY(n.l), 1) : wy(p[1])];
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
      if (s.isDot && dist(pts[0], pts[1]) < 2 * w) {  // a dot is at least 2 tapes long, grown at its free ends
        const l = L[0], ax = l.t === "H" ? 0 : 1, ta = l[ax ? "ay" : "ax"], tb = l[ax ? "by" : "bx"];
        const sg = Math.sign(pts[1][ax] - pts[0][ax]) || 1, need = 2 * w - Math.abs(pts[1][ax] - pts[0][ax]), hi = ax ? 1 : a;
        const [ga, gb] = ta && tb ? [0, 0] : ta ? [0, need] : tb ? [need, 0] : [need / 2, need / 2];
        pts[0][ax] = Math.min(Math.max(pts[0][ax] - sg * ga, 0), hi); pts[1][ax] = Math.min(Math.max(pts[1][ax] + sg * gb, 0), hi);
      }
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
      // the top dot is a short post down to its bar
      const bar = !kana && barUnder(c);
      if (bar) {
        strips.push([[cx, cy - h < G.dotPost / 2 ? 0 : cy - h], [cx, lvY(bar)]]);
        continue;
      }
      polys.push([[cx - h, cy - h], [cx + h, cy - h], [cx + h, cy + h], [cx - h, cy + h]]);
    }
    return { ch, aspect: a, w, strips: mergeCorners(strips, w, a), polys, cuts: [], sharp, hand: false, touched };
  }

  // Strips whose ends meet at one point (an L corner of two strokes) become one strip, so the
  // bend is rounded; a closed loop restarts mid-side (a loop closed at a corner leaves a notch).
  // Other ends that stop on a strip's line run on by half a tape (no further than the cell edge) so the corner is filled.
  function mergeCorners(strips, w, a) {
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
        const r = Math.min(w / 2, ...[[0, a], [1, 1]].map(([ax, hi]) => { const d = (s[e][ax] - s[nb][ax]) / L; return d > 1e-9 ? (hi - s[e][ax]) / d : d < -1e-9 ? -s[e][ax] / d : Infinity; }));
        if (L > 1e-6 && r > 0) s[e] = [s[e][0] + ((s[e][0] - s[nb][0]) / L) * r, s[e][1] + ((s[e][1] - s[nb][1]) / L) * r];  // capped at the cell edge
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

  const api = { G, build, parse, marksOf, place };
  root.TapeGrid = api;
  if (typeof module !== "undefined") module.exports = api;
})(globalThis);
