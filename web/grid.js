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
 *      Short shallow 撇 become bars, dots short bars/posts along their direction (at least 2 tapes).
 *   4. holes: touches that close a hole the thin skeleton lacks are undone (buildHoles).
 * Output: the glyphs/manual JSON format (strips/polys/cuts/sharp).
 * Classic <script> sets globalThis.TapeGrid; Node: module.exports.
 */
(function (root) {
  const G = {
    eps: 0.03,      // RDP tolerance on the skeleton (em)
    kanaEps: 0.03,  // ... for kana: coarse, so a curve is a few long legs, never a staircase of short ones
    kanaJog: 0.05,  // kana: a leg shorter than this between two parallel legs is a step, dropped (em)
    kanaBack: 1,    // kana: a straight diagonal that runs back under a bar stays a slab
    kanaCorner: 0.2, // kana: a diagonal shorter than this between a bar and a post is a rounded corner, dropped (em)
    hv: 24,         // degrees: a leg this close to horizontal/vertical is H/V
    dot: 0.11,      // a stroke shorter than this (em) is a dot
    serif: 0.045,   // a first leg shorter than this is an entry serif, dropped
    hook: 0.14,     // a last leg shorter than this that turns sharply is a hook tail
    hookCorner: 0.05, // ... legs shorter than this before it are the corner into it (the hook turns off the leg before them)
    bar: 0.3,       // a shallow 撇/提 shorter than this (em) becomes a flat bar
    join: 0.055,    // a leg end this close (em, half a tape) to another strip's line touches it
    joinSpan: 0.1,  // ... if it is within this of the strip's span
    skelW: 0.025,   // holes: the skeleton drawn this wide (em) has as many holes as the char
    skelExt: 0.03,  // ... with its stroke ends grown by this (em)
    holeRows: 120,  // holes are counted on a grid this many rows high
    holeJoin: 9,    // too few holes in a char of fewer strokes than this: join ends stopped short of a line
    cornerUndo: 1,  // too many holes: corner contacts (end at another strip's end) may be undone too
    shortD: 0.2,    // a diagonal leg of a longer stroke shorter than this (em) becomes a bar or post
    blunt: 0.6,     // a slab end cut at a slope under this (sin) to the slab is cut the other way
    slabMin: 1,     // a slab shorter than this (tapes) is a splinter, dropped
    edgeSnap: 0.1,  // a free diagonal end this close (em) to the cell edge it heads for runs on to it
    edgeLow: 0.25,  // ... and a lower end at a side edge this close (em) to the bottom goes to the bottom corner
    near: 0.1,      // an end that stops short of a line this close (em) keeps G.white tapes of white to it
    tolNear: 0.03,  // overlapping bars this close (em) share one level
    tolFar: 0.07,   // bars side by side this close share one level (left radical on the right part's levels)
    equal: 0.5,     // level spacing: 0 = as in the skeleton, 1 = equally spaced
    white: 0.3,     // least white between facing strips, in tapes
    poke: 0.4,      // least distance from the outer strip to a free tip beyond it, in tapes
    slit: 0.02,     // dense trick: white between strips becomes a hairline slit this wide
    wDense: 0.09,   // tape for 16+ strokes
    endCorner: 1,   // a stroke end that meets another stroke's end makes the other end meet it too (one rounded corner)
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
    pieSteep: 1.5,  // a one-leg 撇 this steep (dy/dx) whose top touches a bar or post is a post with a left foot
    pieLong: 0.2,   // ... if at least this long (em)
    dotMid: 0.2,    // ... and this close to the bar's middle (in bar lengths)
    dotPost: 0.25,  // a top dot this close (em) above a bar is a post down to it
    dotLen: 0.2,    // a lone diagonal shorter than this (em) is a dot (氵 灬 点)
    dotNear: 0.143, // a dot whose end is this close (em, a tape and its white) to a bar or post it points at is joined to it
    dotSlant: 0.4,  // a dot whose slant is this far off H and V (sin, ~24°) is a slab along it, not a bar or post
    dotHalf: 0.1,   // ... at least this long each side of its centre (em)
    dotClear: 0.06, // ... and no other stroke this close to it (em)
    pairDots: 0.25, // two short free bars stacked this close (em) are 冬's two dots
    pairShift: 0.05, // ... moved this far apart sideways (em)
    pairLen: 0.26,  // ... shorter than this (em)
    dotLeft: 0.3,  // dots left of this (em) stacked two or more (氵 冫) are bars from the edge on the right part's levels
    dotSnap: 0.12,  // ... snapped to a right-part level this close (em)
    dotLow: 0.7,    // three or more dots below this (em) are 灬: one band split by slits
    dotSlit: 1,    // ... white between its pieces, in tapes
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
    const pts = rdp(raw, kana ? G.kanaEps : G.eps);
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
      // the leg before the hook, past short legs of the skeleton's rounded corner into it (刂 卩)
      let pi = legs.length - 2;
      while (pi > 0 && dist(legs[pi].a, legs[pi].b) < G.hookCorner) pi--;
      const h = legs[legs.length - 1], p = legs[pi];
      const u = [h.b[0] - h.a[0], h.b[1] - h.a[1]], v = [p.b[0] - p.a[0], p.b[1] - p.a[1]];
      const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v) || 1);
      if (dist(h.a, h.b) < G.hook && cos < 0.5) {
        legs.splice(pi + 1);
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
        // so does a straight one that runs back under a bar (ろ る そ): as an L it would fold onto the bar
        const back = (n) => G.kanaBack && n && n.t === "H" && Math.sign(n.b[0] - n.a[0]) * Math.sign(l.b[0] - l.a[0]) < 0;
        if (!curved && ((!i && l.b[0] > l.a[0] && l.b[1] > l.a[1]) || nD > 1 || back(legs[i - 1]) || back(legs[i + 1]))) return [l];
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
      // a diagonal between a bar and a post is the curve's rounded corner: the two meet at a bend instead (ら ち ろ bowls are a box)
      legs = legs.filter((l, i) => !(l.t === "D" && i > 0 && i + 1 < legs.length && legs[i - 1].t !== "D" && legs[i + 1].t !== "D" && legs[i - 1].t !== legs[i + 1].t && dist(l.a, l.b) < G.kanaCorner));
      // a short jog between two parallel legs (a step of the curve) is dropped: the two legs become one
      // on the longer one's line, so a curve is a few long runs, never a staircase
      for (let i = 1; i + 1 < legs.length; i++) {
        const [A, J, B] = [legs[i - 1], legs[i], legs[i + 1]];
        if (J.t === "D" || A.t !== B.t || A.t === J.t || A.t === "D" || dist(J.a, J.b) >= G.kanaJog) continue;
        const ax = A.t === "H" ? 1 : 0, v = (dist(A.a, A.b) >= dist(B.a, B.b) ? A : B).a[ax];
        const pa = A.a.slice(), pb = B.b.slice();
        pa[ax] = v; pb[ax] = v;
        legs.splice(i - 1, 3, { t: A.t, a: pa, b: pb, mid: [] });
        i = 0;
      }
    }
    // a short diagonal leg of a longer stroke is a thin blade as a slab: it becomes a bar or post, whichever is closer
    if (!kana && !pie && legs.length > 1) {
      legs = legs.map((l) => (l.t === "D" && dist(l.a, l.b) < G.shortD ? { ...l, t: Math.abs(l.b[0] - l.a[0]) >= Math.abs(l.b[1] - l.a[1]) ? "H" : "V" } : l))
        .reduce((out, l) => {
          const L = out[out.length - 1];
          if (L && L.t === l.t && l.t !== "D" && Math.sign(l.b[0] - l.a[0]) === Math.sign(L.b[0] - L.a[0]) && Math.sign(l.b[1] - l.a[1]) === Math.sign(L.b[1] - L.a[1])) L.b = l.b; else out.push(l);
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
    const minor = (c) => c.items.every((it) => it.l && it.l.isDot);
    const gaps = [], min = [], ll = [];
    for (let i = 0; i + 1 < k.length; i++) {
      const A = k[i], B = k[i + 1], both = A.level && B.level;
      gaps.push(Math.max(B.v - A.v, 1e-3));
      ll.push(both && !minor(A.c) && !minor(B.c));  // dot-only levels keep their skeleton spacing (not equalized)
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
    const cut = new Set(), join = new Set();
    let g = buildBase(ch, strokes, P, cut, join), h = count(g);
    // too many: undo the touch that removes the most; too few: join the end stopped short of a line
    // that adds the most (without overshooting)
    for (const [more, set, from] of [[true, cut, "touched"], [false, join, "near"]]) {
      while (more ? h > want : h < want) {
        let best = null;
        for (const k of g[from]) {
          if (set.has(k)) continue;
          set.add(k);
          const g2 = buildBase(ch, strokes, P, cut, join), h2 = count(g2);
          set.delete(k);
          if (more ? h2 < h && (!best || h2 < best.h) : h2 > h && h2 <= want && (!best || h2 > best.h)) best = { k, g: g2, h: h2 };
        }
        if (!best) break;
        set.add(best.k); g = best.g; h = best.h;
      }
      if (strokes.length >= G.holeJoin) break;
    }
    delete g.touched; delete g.near;
    return g;
  }

  function buildBase(ch, strokes, P, cut, join) {
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
    // 夂 人 衣 春: a long steep 撇 whose top touches a bar or post is a post with a left foot too
    const posts = st.flatMap((s) => s.legs).filter((l) => l.t === "V");
    if (!kana && G.pieSteep) for (const s of st) {
      const d = s.legs.length === 1 && s.legs[0];
      if (!d || d.t !== "D" || d.b[0] >= d.a[0] || d.b[1] - d.a[1] < G.pieSteep * (d.a[0] - d.b[0]) || dist(d.a, d.b) < G.pieLong) continue;
      // top on a bar's span (not past its end: 亻), not where a post crosses it (木 禾 keep their slab)
      const on = (l, ax, m) => Math.abs(l.a[1 - ax] - d.a[1 - ax]) < G.joinSpan && d.a[ax] > Math.min(l.a[ax], l.b[ax]) + m && d.a[ax] < Math.max(l.a[ax], l.b[ax]) - m;
      if (!bars.some((l) => on(l, 0, 0)) || posts.some((l) => on(l, 1, G.joinSpan))) continue;
      s.legs = [{ t: "V", a: d.a, b: [d.a[0], d.b[1]], mid: [] }];
      s.foot = -1;
      posts.push(s.legs[0]);
    }
    // the top dot over a bar or roof (宀 亠 言 立 文): the bar right under it, nothing above it
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
    const slanted = [];
    // 冬 寒 終: two short free bars stacked right under each other are its two 点, drawn flat in the
    // skeleton: they slant down-right like the dots they are (made slabs below)
    if (!kana && G.pairDots) {
      const shortH = parsed.filter((s) => s.legs && s.legs.length === 1 && s.legs[0].t === "H" && dist(s.legs[0].a, s.legs[0].b) < G.pairLen
        && !posts.some((l) => [s.legs[0].a, s.legs[0].b].some((p) => Math.abs(l.a[0] - p[0]) < G.joinSpan && p[1] > Math.min(l.a[1], l.b[1]) - G.joinSpan && p[1] < Math.max(l.a[1], l.b[1]) + G.joinSpan)));
      const mid = (s) => [(s.legs[0].a[0] + s.legs[0].b[0]) / 2, s.legs[0].a[1]];
      for (const A of shortH) for (const B of shortH) {
        const [p, q] = [mid(A), mid(B)];
        if (p[0] < G.dotLeft || q[1] <= p[1] || q[1] - p[1] > G.pairDots || Math.abs(q[0] - p[0]) > G.joinSpan / 2 || shortH.some((C) => C !== A && C !== B && Math.abs(mid(C)[0] - p[0]) < G.joinSpan)
          || bars.some((l) => !shortH.some((C) => C.legs[0] === l) && l.a[1] > p[1] - G.pairDots && l.a[1] < q[1] + G.pairDots && p[0] > Math.min(l.a[0], l.b[0]) && p[0] < Math.max(l.a[0], l.b[0]))) continue;  // 言's short bars sit between long ones
        for (const [s, sh] of [[A, G.pairShift], [B, -G.pairShift]]) {  // the upper one a little right, the lower one left: parallel, apart
          const c = [mid(s)[0] + sh, mid(s)[1]], h = Math.max(dist(s.legs[0].a, s.legs[0].b), 0.12) / 2 / Math.SQRT2;
          Object.assign(s.legs[0], { t: "D", a: [c[0] - h, c[1] - h], b: [c[0] + h, c[1] + h] });  // same object: bars/posts lists stay valid
        }
      }
    }
    // 氵 冫: two or more short strokes left of G.dotLeft stay bars (see leftDots below)
    const water = parsed.filter((s) => (s.dot && s.dot[0] < G.dotLeft) || (s.legs && s.legs.length === 1 && dist(s.legs[0].a, s.legs[0].b) < G.dotLen && (s.legs[0].a[0] + s.legs[0].b[0]) / 2 < G.dotLeft)).length >= 2;
    parsed.forEach((s, pi) => {
      const D = s.legs && s.legs.length === 1 && !s.pie && dist(s.legs[0].a, s.legs[0].b) < G.dotLen ? s.legs[0] : null;
      if (!D && !s.dir) return;
      if (D && D.t !== "D") { s.short = true; s.c = [(D.a[0] + D.b[0]) / 2, (D.a[1] + D.b[1]) / 2]; return; }  // a short bar or post (口 side, 冫 dot drawn flat) keeps its touches, only grows to 2 tapes
      const c = D ? [(D.a[0] + D.b[0]) / 2, (D.a[1] + D.b[1]) / 2] : s.dot, v = D ? [D.b[0] - D.a[0], D.b[1] - D.a[1]] : s.dir;
      if (!kana && barUnder(c)) { s.dot = c; s.legs = null; return; }
      if (D && !kana && c[0] < G.dotLeft && v[0] > 0 && v[1] < 0) return;  // 氵's 提 stays a slab
      const ax = Math.abs(v[1]) > Math.abs(v[0]) ? 1 : 0, o = 1 - ax, sg = Math.sign(v[ax]) || 1, ex = Math.max(Math.abs(v[ax]) / 2, 0.02);
      const vn = Math.hypot(...v) || 1, u = [v[0] / vn, v[1] / vn];
      // a slanted dot (丷 of 半 关 光, 冬's dots) is a short slab along its own slant, as Sato cuts them,
      // run on to the bar or post it points at; a slab that closes a hole the skeleton lacks is a bar or post again (buildHoles)
      if (!kana && G.dotSlant && !(water && c[0] < G.dotLeft) && !(cut && cut.has("d" + pi)) && Math.min(Math.abs(u[0]), Math.abs(u[1])) > G.dotSlant) {
        const half = Math.max(vn / 2, G.dotHalf);
        let best = null;
        for (const l of ax ? bars : posts) {
          if (l.t !== (ax ? "H" : "V")) continue;
          const t = (l.a[ax] - c[ax]) / u[ax], p = [c[0] + t * u[0], c[1] + t * u[1]];
          if (t > half - G.dotNear && t < half + G.dotNear && dist(l.a, l.b) >= G.dotLen && p[o] > Math.min(l.a[o], l.b[o]) - 0.02 && p[o] < Math.max(l.a[o], l.b[o]) + 0.02 && (!best || t < best.t)) best = { t, l, p };
        }
        const a0 = [c[0] - u[0] * half, c[1] - u[1] * half], b0 = best ? best.p : [c[0] + u[0] * half, c[1] + u[1] * half];
        // only where it has room: no other stroke within G.dotClear of it (雨's dots in their frame stay bars)
        const T = dist(a0, b0) - (best ? G.dotClear : 0);
        const clear = parsed.every((o) => o === s || !o.legs || o.legs.every((l) => l === (best && best.l) || [0, 0.25, 0.5, 0.75, 1].every((f) => lineSegDist([a0[0] + u[0] * T * f, a0[1] + u[1] * T * f], l.a, l.b) >= G.dotClear)));
        if (clear) {
          s.legs = [Object.assign(D || { mid: [] }, { t: "D", a: a0, b: b0 })];
          s.dot = null; s.isDot = true; s.legs[0].isDot = true; s.c = c; s.slantTo = best && { l: best.l, ax };
          slanted.push("d" + pi);
          return;
        }
      }
      let best = null;
      for (const l of ax ? bars : posts) {
        const g = (l.a[ax] - c[ax]) * sg - ex;  // white from the dot's end to the strip, ahead of the dot
        if (dist(l.a, l.b) >= G.dotLen && c[o] > Math.min(l.a[o], l.b[o]) - 0.02 && c[o] < Math.max(l.a[o], l.b[o]) + 0.02
          && g > -ex && g < G.dotNear && (!best || g < best.g)) best = { g, l };
      }
      const at = (t) => { const p = c.slice(); p[ax] = t; return p; };
      s.legs = [Object.assign(D || { mid: [] }, { t: ax ? "V" : "H", a: at(c[ax] - sg * ex), b: at(best ? best.l.a[ax] : c[ax] + sg * ex) })];  // same object: bars/posts lists stay valid
      s.dot = null; s.isDot = true; s.legs[0].isDot = true; s.c = c;
    });
    // 氵 冫: a stack of dots left of the rest is bars on the right part's levels, from the cell edge to
    // just before the right part (drawn in the strip loop below)
    const leftDots = kana ? [] : parsed.filter((s) => s.isDot && s.c[0] < G.dotLeft).sort((p, q) => p.c[1] - q.c[1]);
    if (leftDots.length >= 2) {
      const x1 = Math.max(...leftDots.map((s) => s.c[0]));
      const rl = bars.filter((l) => !l.isDot && Math.min(l.a[0], l.b[0]) > x1).map((l) => l.a[1]), used = new Set();
      for (const s of leftDots) {
        let y = rl.filter((v) => !used.has(v)).reduce((b, v) => (b === null || Math.abs(v - s.c[1]) < Math.abs(b - s.c[1]) ? v : b), null);
        if (y === null || Math.abs(y - s.c[1]) > G.dotSnap) y = s.c[1]; else used.add(y);
        Object.assign(s.legs[0], { t: "H", a: [0, y], b: [x1, y] });
        s.leftDot = true;
      }
    }
    // 灬: three or more dots in a row at the bottom are one band split by slits
    const low = kana ? [] : parsed.filter((s) => (s.isDot || (s.short && s.legs[0].t === "V")) && s.c[1] > G.dotLow);
    if (low.length >= 3) for (const s of low) s.lowDot = true;
    st = parsed.filter((s) => s.legs && s.legs.length);
    const dots = parsed.filter((s) => s.dot).map((s) => s.dot);
    const legs = st.flatMap((s) => s.legs);
    const hs = legs.filter((l) => l.t === "H"), vs = legs.filter((l) => l.t === "V");
    // touches: a leg end close to another strip's line stops on it
    const touch = (pt, self, axis, r) => {  // axis 0: look for a column (x), 1: a level (y)
      const body = pt === self.a ? self.b : self.a;
      let best = null;
      for (const l of axis ? hs : vs) {
        if (l === self || l.isDot) continue;  // nothing stops on a dot
        const v = l.a[axis], lo = Math.min(l.a[1 - axis], l.b[1 - axis]) - G.joinSpan, hi = Math.max(l.a[1 - axis], l.b[1 - axis]) + G.joinSpan;
        const d = Math.abs(pt[axis] - v);
        // an end short of the line touches within G.join, one that ran past it (overshoot) within G.joinSpan and a quarter of the leg (a crossing is not an overshoot)
        const rr = r || ((pt[axis] - v) * (body[axis] - v) < 0 ? Math.min(G.joinSpan, dist(pt, body) / 4) : G.join);
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
    const touched = slanted.slice(), near = [];
    st.forEach((s, si) => {
      const f = s.legs[0], l = s.legs[s.legs.length - 1];
      for (const [leg, e] of [[f, "a"], [l, "b"]]) {
        const pt = leg[e], k = si + e, no = cut && cut.has(k);  // a dot touches only the strip it was joined to
        if (leg.t === "H") { leg[e + "x"] = !no && touch(pt, leg, 0, s.isDot && 1e-6); if (!leg[e + "x"]) leg[e + "n"] = nearEnd(leg, e, 0, no || s.isDot); }
        else if (leg.t === "V") { leg[e + "y"] = !no && touch(pt, leg, 1, s.isDot && 1e-6); if (!leg[e + "y"]) leg[e + "n"] = nearEnd(leg, e, 1, no || s.isDot); }
        else if (s.isDot) { if (!no && e === "b" && s.slantTo) leg[s.slantTo.ax ? "by" : "bx"] = s.slantTo.l; }  // a slanted dot touches only the strip it points at
        else if (!no) { leg[e + "x"] = touch(pt, leg, 0); if (!leg[e + "x"]) leg[e + "y"] = touch(pt, leg, 1); }
        // an end stopped short of a line may be joined to it (a hole the lattice left open, see buildHoles)
        if (leg[e + "n"] && !no && !s.isDot) {
          near.push(k);
          if (join && join.has(k)) { leg[e + (leg.t === "H" ? "x" : "y")] = leg[e + "n"].l; leg[e + "n"] = null; }
        }
        // a touch near the other strip's end is a corner (口 金 frames): it stays closed unless G.cornerUndo
        const o = leg[e + "x"] || leg[e + "y"];
        if (o && (G.cornerUndo || Math.min(dist(pt, o.a), dist(pt, o.b)) > G.joinSpan)) touched.push(k);
      }
    });
    // end meets end (box corners of 口 金 木): the other end stops on this strip's line too, so both
    // ends are one point and mergeCorners makes them one strip with a rounded bend
    if (G.endCorner) {
      const ends = new Map();
      st.forEach((s) => { ends.set(s.legs[0], (ends.get(s.legs[0]) || []).concat("a")); const l = s.legs[s.legs.length - 1]; ends.set(l, (ends.get(l) || []).concat("b")); });
      for (const [leg, es] of ends) for (const e of es) {
        if (leg.t === "D") continue;
        const o = leg[e + (leg.t === "H" ? "x" : "y")];
        if (!o || o.isDot || leg.isDot || !ends.has(o)) continue;
        const oe = ends.get(o).find((x) => dist(leg[e], o[x]) < G.joinSpan), ax = o.t === "H" ? "x" : "y";
        if (oe && !o[oe + ax]) { o[oe + ax] = leg; o[oe + "n"] = null; }
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
    // enclosures: facing bars (posts) with posts (bars) on both sides spanning both of them
    const spans = (l, lo, hi, ax) => Math.min(l.a[ax], l.b[ax]) <= lo + G.joinSpan && Math.max(l.a[ax], l.b[ax]) >= hi - G.joinSpan;
    const enclosed = (A, B, sides, ax) => A.items.some((p) => p.l && B.items.some((q) => {
      if (!q.l) return false;
      const lo = Math.max(p.lo, q.lo), hi = Math.min(p.hi, q.hi);
      if (hi - lo < 0.02) return false;
      const wall = (side) => sides.some((s) => (side ? s.a[1 - ax] >= hi - G.joinSpan : s.a[1 - ax] <= lo + G.joinSpan) && spans(s, A.v, B.v, ax));
      return wall(0) && wall(1);
    }));
    // a dot facing a strip may close to a hairline slit too, when the cell is crowded (the dot and its strip read as one block)
    const dotOnly = (c) => c.items.every((it) => it.l && it.l.isDot);
    const encY = (A, B) => dotOnly(A) || dotOnly(B) || enclosed(A, B, vs, 1), encX = (A, B) => dotOnly(A) || dotOnly(B) || enclosed(A, B, hs, 0);
    const w0 = strokes.length >= 16 ? Math.min(P.w, G.wDense) : P.w;
    let w, ky, kx;
    // crowded: enclosures (and dots) become blocks with slits before the tape gets thinner, per axis
    for (w = w0; ; w = Math.round((w - 0.005) * 1000) / 1000) {
      const passes = w <= G.blockW + 1e-9 ? [[false, false], [encY, encX]] : [[false, false]];
      ky = null; kx = null;
      for (const [ey] of passes) if (!ky) ky = place(levels, tipsY, 1, w, G.white, true, ey);
      for (const [, ex] of passes) if (!kx) kx = place(cols, tipsX, a, w, G.white, false, ex);
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
      if (L < G.slabMin * w) return;  // a splinter
      const n = [-dy / L, dx / L];
      // a cut nearly along the slab leaves a long thin blade: cut the other way (blunt tip)
      const fix = (c) => (c === "h" && Math.abs(dy) < G.blunt * L ? "v" : c === "v" && Math.abs(dx) < G.blunt * L ? "h" : c);
      cp = fix(cp); cq = fix(cq);
      const off = (c) => (c === "h" ? [(Math.sign(n[0]) * w * L) / (2 * Math.abs(dy)), 0] : [0, (Math.sign(n[1]) * w * L) / (2 * Math.abs(dx))]);
      const [op, oq] = [off(cp), off(cq)];
      const poly = [[p[0] + op[0], p[1] + op[1]], [q[0] + oq[0], q[1] + oq[1]], [q[0] - oq[0], q[1] - oq[1]], [p[0] - op[0], p[1] - op[1]]];
      polys.push(poly); sharp.push(...poly);
    };
    // a free diagonal end within G.edgeSnap of the cell edge it heads for runs on to that edge, cut flush along it (太 東 札)
    const toEdge = (e, from) => {
      const d = [e[0] - from[0], e[1] - from[1]];
      let best = null;
      for (const [ax, lim, c] of [[0, 0, "v"], [0, a, "v"], [1, 0, "h"], [1, 1, "h"]]) {
        if (Math.abs(lim - e[ax]) > G.edgeSnap || (lim - e[ax]) * d[ax] < 0 || Math.abs(d[ax]) < 1e-9) continue;
        const t = (lim - e[ax]) / d[ax], p = [e[0] + t * d[0], e[1] + t * d[1]];
        if (p[0] < -1e-9 || p[0] > a + 1e-9 || p[1] < -1e-9 || p[1] > 1 + 1e-9) continue;
        if (!best || t < best.t) best = { t, p, c };
      }
      // a lower end already at a side edge and near the bottom goes to the corner (木 撇 and 捺 end in the bottom corners)
      const side = e[0] < G.edgeSnap ? 0 : e[0] > a - G.edgeSnap ? a : null;
      if (side !== null && d[1] > 0 && 1 - e[1] < G.edgeLow && (side - e[0]) * d[0] >= 0) return { p: [side, 1], c: "h" };
      return best;
    };
    const lowPts = [];
    for (const s of st) {
      const L = s.legs;
      if (s.leftDot) continue;
      if (s.lowDot) { lowPts.push(endPt(L[0], "a"), endPt(L[0], "b")); continue; }
      const pts = [endPt(L[0], "a")];
      const segs = [];  // segs[i]: leg of pts[i] -> pts[i+1]
      L.forEach((l, i) => {
        const nx = i + 1 < L.length ? corner(l, L[i + 1]) : [endPt(l, "b")];
        nx.forEach((p, j) => { pts.push(p); segs.push(j ? { t: L[i + 1].t === "H" ? "V" : "H" } : l); });
      });
      if (s.isDot && L[0].t === "D") {  // a slanted dot slab: at least 2 tapes, grown at its free start
        const d = dist(pts[0], pts[1]);
        if (d < 2 * w && d > 1e-9) { const k = 2 * w / d; pts[0] = [pts[1][0] + (pts[0][0] - pts[1][0]) * k, pts[1][1] + (pts[0][1] - pts[1][1]) * k]; }
      } else if ((s.isDot || s.short) && dist(pts[0], pts[1]) < 2 * w) {  // a dot is at least 2 tapes long, grown at its free ends
        const l = L[0], ax = l.t === "H" ? 0 : 1, ta = l[ax ? "ay" : "ax"], tb = l[ax ? "by" : "bx"];
        const sg = Math.sign(pts[1][ax] - pts[0][ax]) || 1, need = 2 * w - Math.abs(pts[1][ax] - pts[0][ax]), hi = ax ? 1 : a;
        const [ga, gb] = ta && tb ? [0, 0] : ta ? [0, need] : tb ? [need, 0] : [need / 2, need / 2];
        const lim = (e, v) => { const n = l[e + "n"]; if (!n) return v; const m = (ax ? lvY : colX)(n.l) + n.s * (w / 2 + G.white * w); return Math.min(Math.max(n.s > 0 ? Math.max(v, m) : Math.min(v, m), 0), hi); };  // not into the white of a line nearby
        const grow = (ga, gb) => { pts[0][ax] = lim("a", Math.min(Math.max(pts[0][ax] - sg * ga, 0), hi)); pts[1][ax] = lim("b", Math.min(Math.max(pts[1][ax] + sg * gb, 0), hi)); };
        grow(ga, gb);
        const more = 2 * w - Math.abs(pts[1][ax] - pts[0][ax]);  // one end stopped (cell edge, white): the other end takes the rest
        if (more > 1e-9 && !ta && !tb) grow(more, more);
      }
      if (s.foot && L[L.length - 1].t === "V") {
        const e = pts[pts.length - 1];
        pts.push([Math.max(e[0] - G.foot, 0), e[1]]); segs.push({ t: "H" });
      }
      // split at D legs: H/V runs become strips, D legs slabs
      let run = [pts[0]];
      segs.forEach((l, i) => {
        let p = pts[i], q = pts[i + 1];
        if (l.t !== "D") { run.push(q); return; }
        if (run.length > 1) strips.push(run);
        // cut along the strip it meets: a bar -> horizontal, a post -> vertical; free: by slope
        const cut = (nb, e) => (nb ? (nb.t === "H" ? "h" : "v") : l[e + "y"] ? "h" : l[e + "x"] ? "v"
          : Math.abs(q[1] - p[1]) >= Math.abs(q[0] - p[0]) ? "h" : "v");
        let cp = cut(segs[i - 1], "a"), cq = cut(segs[i + 1], "b");
        const free = (nb, e) => !nb && !l[e + "x"] && !l[e + "y"];
        const ep = !s.isDot && free(segs[i - 1], "a") && toEdge(p, q), eq = !s.isDot && free(segs[i + 1], "b") && toEdge(q, p);
        if (ep) { p = ep.p; cp = ep.c; }
        if (eq) { q = eq.p; cq = eq.c; }
        slab(p, q, cp, cq);
        run = [q];
      });
      if (run.length > 1) strips.push(run);
    }
    // 氵 冫 bars: from the edge to G.white short of the first ink on their level (slabs from the left, like 氵's 提, aside)
    const inkFrom = (y, x0) => {
      let m = Infinity;
      const h = w / 2;
      for (const s of strips) for (let i = 0; i + 1 < s.length; i++) {
        const p = s[i], q = s[i + 1];
        if (Math.abs(p[1] - q[1]) < 1e-9) {
          if (Math.abs(p[1] - y) >= w) continue;
          const [l, e] = p[0] < q[0] ? [p[0], i > 0] : [q[0], i + 2 < s.length];
          if (l - (e ? h : 0) > h) m = Math.min(m, l - (e ? h : 0));
        } else if (y + h > Math.min(p[1], q[1]) - h && y - h < Math.max(p[1], q[1]) + h && p[0] > w) m = Math.min(m, p[0] - h);
      }
      for (const P of polys) if (Math.min(...P.map((p) => p[0])) > x0) for (const yy of [y - h, y, y + h]) P.forEach((p, i) => {
        const q = P[(i + 1) % P.length];
        if ((p[1] > yy) === (q[1] > yy)) return;
        const x = p[0] + ((yy - p[1]) * (q[0] - p[0])) / (q[1] - p[1]);
        m = Math.min(m, x);
      });
      return m;
    };
    if (leftDots.some((s) => s.leftDot)) {
      const x0 = wx(Math.max(...leftDots.map((s) => s.c[0])));
      for (const s of leftDots) {
        const y = lvY(s.legs[0]), m = inkFrom(y, x0);
        strips.push([[0, y], [Math.max(m === Infinity ? x0 + w : m - G.white * w, w), y]]);
      }
    }
    // 灬 band: the dots' height, across their width (to the cell edges when near), split into equal pieces
    if (lowPts.length) {
      const n = lowPts.length / 2, xs = lowPts.map((p) => p[0]), ys = lowPts.map((p) => p[1]);
      let x0 = Math.min(...xs) - w / 2, x1 = Math.max(...xs) + w / 2;
      if (x0 < G.edgeSnap) x0 = 0;
      if (x1 > a - G.edgeSnap) x1 = a;
      const y0 = Math.min(...ys), y1 = Math.min(Math.max(Math.max(...ys), y0 + 2 * w), 1), gap = G.dotSlit * w, pw = (x1 - x0 - (n - 1) * gap) / n;
      for (let i = 0; i < n; i++) {
        const l = x0 + i * (pw + gap), P = [[l, y0], [l + pw, y0], [l + pw, y1], [l, y1]];
        polys.push(P); sharp.push(...P);
      }
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
    return { ch, aspect: a, w, strips: mergeCorners(strips, w, a), polys, cuts: [], sharp, hand: false, touched, near };
  }

  // Strips whose ends meet at one point (an L corner of two strokes) become one strip, so the
  // bend is rounded; a closed loop restarts mid-side (a loop closed at a corner leaves a notch).
  // Other ends that stop on a strip's line run on by half a tape (no further than the cell edge) so the corner is filled.
  function mergeCorners(strips, w, a) {
    const S = strips.map((s) => s.filter((p, i) => !i || dist(p, s[i - 1]) > 1e-6)).filter((s) => s.length > 1);
    const key = (p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
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

  const api = { G, build, parse, marksOf, place, holes: (g) => holes(raster(g, g.aspect, G.holeRows)) };
  root.TapeGrid = api;
  if (typeof module !== "undefined") module.exports = api;
})(globalThis);
