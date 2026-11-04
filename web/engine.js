/* Shuetsu tape-lettering engine: one text line in, one line of tape glyphs out.
 *
 * Frame: every glyph lives in a cell of height 1 and width `aspect` (x right, y down).
 * A glyph is tape strips (centerlines, butt ends, width w), filled polys (blocks, wedges)
 * and cuts (slits, notches), the same format as glyphs/manual/*.json.
 *
 * Per line:
 *   1. each char gets a glyph: hand-built if we have one, else built from its stroke skeleton;
 *   2. the line is solved: horizontal levels of all glyphs are clustered, and each glyph is
 *      warped (monotone, piecewise linear in y) so its bars sit on the shared lines;
 *   3. strips/polys become outlines with Sato's corners (outer bends rounded ~1 tape,
 *      strip ends and inner corners square), cuts are kept for masking.
 *
 * Works as a classic <script> (sets globalThis.TapeEngine) and in Node (module.exports).
 */
(function (root) {
  const P = {
    w: 0.11,          // tape width / cell height
    aspect: 0.68,     // kana/kanji cell width / height
    gap: 0.05,        // space between cells / cell height
    space: 0.34,      // width of a space
    radius: 1.0,      // outer corner radius / tape width
    simplify: 0.055,  // RDP tolerance when straightening skeleton strokes (~half a tape)
    snap: 30,         // degrees: near-H/V skeleton segments become exact H/V
    minSeg: 0.059,    // drop skeleton end segments shorter than this (hook tails)
    join: 1.5,        // a skeleton stroke end within this many tapes of another stroke joins it
    slit: 0.035,      // skeleton glyphs: least white between two facing parallel strips
    minW: 0.075,      // skeleton glyphs too dense for that get thinner tape, down to this
    maxStretch: 1.8,  // skeleton glyphs fill the cell, up to this stretch per axis
    handStretch: 1.15,// hand glyphs fill the cell, up to this stretch per axis
    handStretchX: 1.3,// ...sideways up to this (narrow kana like く would leave holes in the row)
    tol: 0.06,        // line solve: levels this close across glyphs share one line
    tolHand: 0.045,   // hand glyphs move a bar at most this far onto a shared line
    tolGen: 0.08,     // skeleton glyphs may move this far
    bandChange: 0.35, // line solve: white between two bars (if over one tape) changes by at most this fraction
    minGap: 0.03,     // white between two bars never shrinks below one tape + this
    align: true,      // line solve on/off
    generator: "grid",  // chars without a hand glyph: "grid" (Sato's lattice, web/grid.js) or "trace" (old centerline trace)
  };
  const MARKS = "ー一、。・.,〜!-ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶゕゖ";
  const KANA = /[぀-ヿ]/;

  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const clone = (v) => JSON.parse(JSON.stringify(v));

  // ---------- skeleton -> strips (port of src/tape.py) ----------

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

  function straighten(stroke) {
    let pts = rdp(stroke.map((p) => [p[0] / 1000, p[1] / 1000]), P.simplify);
    while (pts.length > 2 && dist(pts[pts.length - 1], pts[pts.length - 2]) < P.minSeg) pts.pop();
    while (pts.length > 2 && dist(pts[0], pts[1]) < P.minSeg) pts.shift();
    pts = pts.map((p) => p.slice());
    const tol = (P.snap * Math.PI) / 180;
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1];
      const ang = Math.abs(Math.atan2(b[1] - a[1], b[0] - a[0])) % Math.PI;
      if (Math.min(ang, Math.PI - ang) < tol) a[1] = b[1] = (a[1] + b[1]) / 2;
      else if (Math.abs(ang - Math.PI / 2) < tol) a[0] = b[0] = (a[0] + b[0]) / 2;
    }
    return pts;
  }

  function fitSkeleton(strips, a, w) {
    const xs = strips.flat().map((p) => p[0]), ys = strips.flat().map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const h = w / 2;
    const sx = Math.min((a - 2 * h) / (x1 - x0 || 1), P.maxStretch);
    const sy = Math.min((1 - 2 * h) / (y1 - y0 || 1), P.maxStretch);
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return strips.map((s) => s.map(([x, y]) => [a / 2 + (x - cx) * sx, 0.5 + (y - cy) * sy]));
  }

  function joinEnds(strips, w) {
    return strips.map((s0, i) => {
      const s = s0.map((p) => p.slice());
      for (const [e, nb] of [[0, 1], [s.length - 1, s.length - 2]]) {
        if (s.length < 2) break;
        let best = null;
        strips.forEach((o, j) => {
          if (j === i) return;
          for (let k = 0; k + 1 < o.length; k++) {
            const [a, b] = [o[k], o[k + 1]], dx = b[0] - a[0], dy = b[1] - a[1];
            const L2 = dx * dx + dy * dy || 1e-9;
            const t = Math.max(0, Math.min(1, ((s[e][0] - a[0]) * dx + (s[e][1] - a[1]) * dy) / L2));
            const q = [a[0] + t * dx, a[1] + t * dy], d = dist(q, s[e]);
            // an end may only grow along its own direction to reach the other stroke,
            // never slide sideways (that bends bars into diagonals)
            const ox = s[e][0] - s[nb][0], oy = s[e][1] - s[nb][1], oL = Math.hypot(ox, oy) || 1;
            const along = d < 1e-6 ? 1 : ((q[0] - s[e][0]) * ox + (q[1] - s[e][1]) * oy) / (d * oL);
            if (d < P.join * w && along > 0.7 && (!best || d < best.d)) best = { d, q };
          }
        });
        if (!best) continue;
        const vx = best.q[0] - s[nb][0], vy = best.q[1] - s[nb][1], L = Math.hypot(vx, vy);
        if (L < 1e-3) continue;
        s[e] = [best.q[0] + (vx / L) * w / 2, best.q[1] + (vy / L) * w / 2];
      }
      return s;
    });
  }

  function fromSkeleton(ch, strokes) {
    const a = P.aspect, w = P.w;
    let strips = strokes.map(straighten).filter((s) => s.length > 1);
    strips = fitSkeleton(strips, a, w);
    const g = { ch, aspect: a, w, strips, polys: [], cuts: [], sharp: [], hand: false };
    spread(g, 1);  // bars apart (horizontal legibility)
    spread(g, 0);  // posts apart (vertical legibility)
    g.strips = joinEnds(g.strips, g.w);
    // dots: a stroke shorter than ~1.5 tapes becomes an axis-aligned tape square, as in the hand glyphs
    const len = (s) => s.reduce((a, p, i) => (i ? a + dist(p, s[i - 1]) : 0), 0);
    g.strips = g.strips.filter((s) => {
      if (len(s) >= 1.5 * g.w) return true;
      const m = s.reduce((a, p) => [a[0] + p[0] / s.length, a[1] + p[1] / s.length], [0, 0]), h = g.w / 2;
      g.polys.push([[m[0] - h, m[1] - h], [m[0] + h, m[1] - h], [m[0] + h, m[1] + h], [m[0] - h, m[1] + h]]);
      return false;
    });
    return g;
  }

  // Sato lays strips on a grid with real white between them. Facing parallel strips
  // (overlapping along their length) are pushed apart to one tape + P.slit; near-equal
  // levels merge into one shared line. If the cell is too small for that, the tape gets
  // thinner (down to P.minW). The glyph is then warped (monotone, piecewise linear) so
  // diagonals and ends follow their strips. k = 1: horizontal strips/y, k = 0: vertical/x.
  function spread(g, k) {
    const groups = [];
    for (const s of g.strips) for (let i = 0; i + 1 < s.length; i++) {
      const [a, b] = [s[i], s[i + 1]];
      if (Math.abs(a[k] - b[k]) > 1e-9) continue;
      const lo = Math.min(a[1 - k], b[1 - k]), hi = Math.max(a[1 - k], b[1 - k]);
      if (hi - lo < 1e-6) continue;
      groups.push({ v: a[k], lo, hi });
    }
    if (groups.length < 2) return;
    groups.sort((p, q) => p.v - q.v);
    const lv = [];  // merged levels
    for (const gr of groups) {
      const L = lv[lv.length - 1];
      if (L && gr.v - L.v0 < 0.3 * g.w) { L.vs.push(gr.v); L.segs.push(gr); } else lv.push({ v0: gr.v, vs: [gr.v], segs: [gr] });
    }
    lv.forEach((L) => { L.v = L.vs.reduce((x, y) => x + y, 0) / L.vs.length; });
    const faces = (A, B) => A.segs.some((p) => B.segs.some((q) => Math.min(p.hi, q.hi) - Math.max(p.lo, q.lo) > 0.3 * g.w));
    const pairs = [];
    for (let i = 0; i < lv.length; i++) for (let j = i + 1; j < lv.length; j++) if (faces(lv[i], lv[j])) pairs.push([i, j]);
    const size = k ? 1 : g.aspect;
    // longest chain of required gaps decides whether the tape must get thinner
    const need = lv.map(() => 0);
    for (const [i, j] of pairs) need[j] = Math.max(need[j], need[i] + 1);
    const steps = Math.max(...need);
    let w = g.w;
    if (steps && steps * (w + P.slit) > size - w) w = Math.max(P.minW, (size - steps * P.slit) / (steps + 1));
    const d = w + P.slit * (w / g.w), lo = w / 2, hi = size - w / 2;
    const p = lv.map((L) => Math.min(Math.max(L.v, lo), hi));
    for (let it = 0; it < 200; it++) {
      let moved = false;
      for (const [i, j] of pairs) {
        const v = d - (p[j] - p[i]);
        if (v > 1e-6) { p[i] -= v / 2; p[j] += v / 2; moved = true; }
      }
      for (let i = 0; i + 1 < p.length; i++) if (p[i + 1] < p[i]) { const m = (p[i] + p[i + 1]) / 2; p[i] = p[i + 1] = m; moved = true; }
      for (let i = 0; i < p.length; i++) p[i] = Math.min(Math.max(p[i], lo), hi);
      if (!moved) break;
    }
    if (k === 1 || w < g.w) g.w = Math.min(g.w, w);
    const src = lv.map((L) => L.v), snap = new Map();
    lv.forEach((L, i) => L.vs.forEach((v) => snap.set(v, p[i])));
    const warp = (v) => {
      if (snap.has(v)) return snap.get(v);
      if (v <= src[0]) return v + p[0] - src[0];
      if (v >= src[src.length - 1]) return v + p[p.length - 1] - src[src.length - 1];
      let i = 0;
      while (src[i + 1] < v) i++;
      const t = (v - src[i]) / (src[i + 1] - src[i] || 1);
      return p[i] + t * (p[i + 1] - p[i]);
    };
    g.strips = g.strips.map((s) => s.map((pt) => { const q = pt.slice(); q[k] = warp(pt[k]); return q; }));
  }

  // ---------- hand glyphs ----------

  function mapGlyph(g, fx, fy) {
    const m = (pts) => pts.map(([x, y]) => [fx(x), fy(y)]);
    g.strips = g.strips.map(m); g.polys = g.polys.map(m); g.cuts = g.cuts.map(m); g.sharp = m(g.sharp);
  }

  function fromHand(ch, e) {
    const g = Object.assign({ strips: [], polys: [], cuts: [], sharp: [] }, clone(e), { ch, hand: true });
    g.w = Math.min(Math.max(g.w || P.w, 0.09), 0.16);
    g.aspect = g.aspect || 1;
    if (ch.codePointAt(0) >= 0x2000 && Math.abs(g.aspect - P.aspect) > 1e-6) {
      const f = P.aspect / g.aspect;
      mapGlyph(g, (x) => x * f, (y) => y);
      g.aspect = P.aspect;
    }
    if (MARKS.includes(ch)) { g.mark = true; return g; }
    // fill the cell like the TTF build does; only centerlines move, so strips keep their width
    const box = g.cuts.length ? bbox(outlines(g).flat(), g.aspect) : rawBox(outlines(g).flat());
    const a = g.aspect, h = g.w / 2;
    const s = (lo, hi, size, cap) => Math.min(Math.max((size / 2 - h) / ((hi - lo) / 2 - h || 1e-9), 0), cap);
    const sx = s(box[0], box[1], a, P.handStretchX), sy = s(box[2], box[3], 1, P.handStretch);
    const cx = (box[0] + box[1]) / 2, cy = (box[2] + box[3]) / 2;
    mapGlyph(g, (x) => a / 2 + (x - cx) * sx, (y) => 0.5 + (y - cy) * sy);
    return g;
  }

  function rawBox(pts) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  }

  function bbox(pts, a) {  // clipped to the cell: anything outside it is meant to be cut
    const xs = pts.map((p) => Math.min(Math.max(p[0], 0), a)), ys = pts.map((p) => Math.min(Math.max(p[1], 0), 1));
    return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  }

  function skeletonOf(ch, lang, data) {
    const order = lang === "ja" ? ["ja", "zh"] : ["zh", "ja"];
    for (const k of order) if (data[k][ch]) return data[k][ch];
    return null;
  }

  const Grid = typeof module !== "undefined" ? require("./grid.js") : root.TapeGrid;
  function generate(ch, strokes, gen = P.generator) {
    return gen === "grid" ? Grid.build(ch, strokes, P) : fromSkeleton(ch, strokes);
  }

  function glyphFor(ch, lang, data) {
    if (data.hand[ch]) return fromHand(ch, data.hand[ch]);
    const sk = skeletonOf(ch, lang, data);
    return sk ? generate(ch, sk) : null;
  }

  // ---------- line solve ----------

  function levelsOf(g) {  // horizontal bars and block edges: [y, weight]
    const out = [];
    const take = (pts, closed) => {
      const n = pts.length;
      for (let i = 0; i < (closed ? n : n - 1); i++) {
        const a = pts[i], b = pts[(i + 1) % n], len = Math.abs(b[0] - a[0]);
        if (Math.abs(b[1] - a[1]) < 1e-3 && len > 0.12 * g.aspect && a[1] > -0.01 && a[1] < 1.01) out.push([(a[1] + b[1]) / 2, len]);
      }
    };
    g.strips.forEach((s) => take(s, false));
    g.polys.forEach((s) => take(s, true));
    return out;
  }

  function solveLine(glyphs) {
    const items = [];
    glyphs.forEach((g, gi) => {
      if (!g || g.mark) return;
      for (const [y, len] of levelsOf(g)) items.push({ y, wt: len * (g.hand ? 3 : 1), gi });
    });
    items.sort((p, q) => p.y - q.y);
    const clusters = [];
    for (const it of items) {
      const c = clusters[clusters.length - 1];
      if (c && it.y - c.mean <= P.tol) {
        c.items.push(it); c.sw += it.wt; c.mean += (it.y - c.mean) * it.wt / c.sw;
      } else clusters.push({ items: [it], sw: it.wt, mean: it.y });
    }
    const anchorsOf = new Map();
    for (const c of clusters) {
      const owners = new Set(c.items.map((i) => i.gi));
      if (owners.size < 2) continue;  // a line is shared only if two glyphs use it
      for (const gi of owners) {
        const mine = c.items.filter((i) => i.gi === gi).sort((p, q) => Math.abs(p.y - c.mean) - Math.abs(q.y - c.mean))[0];
        if (!anchorsOf.has(gi)) anchorsOf.set(gi, []);
        anchorsOf.get(gi).push([mine.y, c.mean, c.sw]);
      }
    }
    anchorsOf.forEach((anchors, gi) => {
      const g = glyphs[gi];
      // Levels joined by thin white (under one tape: slits, small counters) form rigid groups that
      // move as one, so thin white never changes. Groups shift onto shared lines; the wide white
      // bands between groups absorb the shift (at most P.bandChange of themselves, never below
      // P.minGap). The glyph is never scaled, and its ink never leaves the cell.
      const ink = inkY(g);
      const tol = g.hand ? P.tolHand : P.tolGen;
      const own = [...new Set(levelsOf(g).map(([y]) => +y.toFixed(4)).concat(ink))].sort((p, q) => p - q);
      const groups = [];
      own.forEach((y, i) => {
        if (i && y - own[i - 1] - g.w >= g.w) groups.push([y]); else (groups[groups.length - 1] || groups[groups.push([]) - 1]).push(y);
      });
      const shift = groups.map((G) => {
        const mine = anchors.filter(([y, t]) => G.some((v) => Math.abs(v - y) < 1e-4) && Math.abs(y - t) <= tol);
        if (!mine.length) return 0;
        const best = mine.reduce((p, q) => (q[2] > p[2] ? q : p));  // the most shared line wins
        let d = best[1] - best[0];
        if (G.includes(ink[0])) d = Math.max(d, -ink[0]);     // the top group may rise only to the cell top
        if (G.includes(ink[1])) d = Math.min(d, 1 - ink[1]);  // the base group may sink only to the cell bottom
        return d;
      });
      const ok = (sh) => groups.every((G, i) => {  // white bands between groups
        if (!i) return true;
        const wo = G[0] - groups[i - 1][groups[i - 1].length - 1] - g.w, wn = wo + sh[i] - sh[i - 1];
        return wn >= P.minGap && Math.abs(wn - wo) <= P.bandChange * wo + 1e-6;
      });
      // drop the smallest moves first until every band is fine
      const order = shift.map((d, i) => i).filter((i) => shift[i]).sort((p, q) => Math.abs(shift[p]) - Math.abs(shift[q]));
      while (!ok(shift) && order.length) shift[order.shift()] = 0;
      if (!shift.some((d) => d)) return;
      const pts = groups.flatMap((G, i) => [[G[0], G[0] + shift[i]], [G[G.length - 1], G[G.length - 1] + shift[i]]]);
      const uniq = pts.filter((p, i) => !i || p[0] - pts[i - 1][0] > 1e-6);
      mapGlyph(g, (x) => x, warper(uniq));
    });
  }

  function inkY(g) {
    const ys = outlines(g).flat().map((p) => Math.min(Math.max(p[1], 0), 1));  // ink past the edge is clipped there
    return ys.length ? [Math.min(...ys), Math.max(...ys)] : [0, 1];
  }

  function warper(anchors) {  // monotone piecewise-linear y map through anchors, cell edges fixed
    const k = [[0, 0]].concat(anchors.filter(([y, t]) => y > 0 && y < 1 && t > 0 && t < 1), [[1, 1]]);
    return (y) => {
      if (y <= 0 || y >= 1) return y;
      for (let i = 0; i + 1 < k.length; i++) {
        const [y0, t0] = k[i], [y1, t1] = k[i + 1];
        if (y <= y1) return t0 + ((y - y0) / (y1 - y0 || 1)) * (t1 - t0);
      }
      return y;
    };
  }

  // ---------- outlines ----------

  function stripOutline(s, w) {
    const pts = s.filter((p, i) => i === 0 || dist(p, s[i - 1]) > 1e-6);
    if (pts.length < 2) return null;
    const h = w / 2, n = pts.length;
    const nrm = [];
    for (let i = 0; i + 1 < n; i++) {
      const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1], L = Math.hypot(dx, dy);
      nrm.push([-dy / L, dx / L]);
    }
    const side = (sg) => pts.map((p, i) => {
      if (i === 0) return [p[0] + sg * h * nrm[0][0], p[1] + sg * h * nrm[0][1]];
      if (i === n - 1) return [p[0] + sg * h * nrm[n - 2][0], p[1] + sg * h * nrm[n - 2][1]];
      const a = nrm[i - 1], b = nrm[i], k = 1 / Math.max(1 + a[0] * b[0] + a[1] * b[1], 0.125);  // miter (a+b)/(1+a·b), length capped at 4h
      return [p[0] + sg * h * (a[0] + b[0]) * k, p[1] + sg * h * (a[1] + b[1]) * k];
    });
    return side(1).concat(side(-1).reverse());
  }

  // corners: outer convex -> quarter round of radius*w, strip ends / inner / sharp -> square
  function rounded(poly, w, sharp) {
    const n = poly.length;
    let area = 0;
    for (let i = 0; i < n; i++) area += poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1];
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = poly[(i - 1 + n) % n], b = poly[i], c = poly[(i + 1) % n];
      const la = dist(a, b), lc = dist(b, c);
      if (la < 1e-9 || lc < 1e-9) continue;
      const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
      let r = cross * area > 0 ? P.radius * w : 0;
      if (r && Math.min(la, lc) < 1.2 * w) r = 0;
      if (sharp.some((q) => dist(b, q) < w)) r = 0;
      const t = Math.min(r, 0.4 * la, 0.4 * lc);
      if (t < 1e-3) { out.push(b); continue; }
      out.push([b[0] + ((a[0] - b[0]) * t) / la, b[1] + ((a[1] - b[1]) * t) / la]);
      out.push({ q: b, p: [b[0] + ((c[0] - b[0]) * t) / lc, b[1] + ((c[1] - b[1]) * t) / lc] });
    }
    return out;
  }

  // A strip outline with 4+ segments can overlap itself (closed loops like 0 8 口), which
  // even-odd fills punch out. Cut such strips at segment midpoints into pieces of <= 3
  // segments; the pieces butt end to end on a straight run, so nothing shows.
  function pieces(s) {
    if (s.length <= 4) return [s];
    const i = Math.floor((s.length - 1) / 2), m = [(s[i][0] + s[i + 1][0]) / 2, (s[i][1] + s[i + 1][1]) / 2];
    return pieces(s.slice(0, i + 1).concat([m])).concat(pieces([m].concat(s.slice(i + 1))));
  }

  function outlines(g) {  // raw polygons (for bbox)
    return g.strips.flatMap(pieces).map((s) => stripOutline(s, g.w)).filter(Boolean).concat(g.polys);
  }

  // All shapes share one winding: in one SVG path (nonzero fill) a clockwise strip over a
  // counter-clockwise poly would cancel to white where they overlap.
  function wound(poly) {
    let a = 0;
    for (let i = 0; i < poly.length; i++) a += poly[i][0] * poly[(i + 1) % poly.length][1] - poly[(i + 1) % poly.length][0] * poly[i][1];
    return a < 0 ? poly.slice().reverse() : poly;
  }

  function shapesOf(g) {
    return outlines(g).map((p) => rounded(wound(p), g.w, g.sharp));
  }

  // ---------- public ----------

  function layoutLine(text, data, opts = {}) {
    const lang = opts.lang && opts.lang !== "auto" ? opts.lang : KANA.test(text) ? "ja" : "zh";
    const glyphs = [...text].map((ch) => (ch === " " || ch === "　" ? null : glyphFor(ch, lang, data)));
    if (opts.align ?? P.align) solveLine(glyphs);
    let x = 0;
    const chars = [...text].map((ch, i) => {
      const g = glyphs[i];
      const width = ch === "　" ? P.aspect : g ? g.aspect : P.space;
      const item = { ch, x, width, shapes: g ? shapesOf(g) : [], cuts: g ? g.cuts : [], missing: !g && ch.trim() !== "" };
      x += width + P.gap;
      return item;
    });
    return { chars, width: Math.max(0, x - P.gap) };
  }

  function pathData(shape, ox, k) {
    let d = "";
    shape.forEach((v, i) => {
      if (v.q) d += `Q${((v.q[0] + ox) * k).toFixed(1)} ${(v.q[1] * k).toFixed(1)} ${((v.p[0] + ox) * k).toFixed(1)} ${(v.p[1] * k).toFixed(1)}`;
      else d += `${i ? "L" : "M"}${((v[0] + ox) * k).toFixed(1)} ${(v[1] * k).toFixed(1)}`;
    });
    return d + "Z";
  }

  let uid = 0;
  function lineSVG(line, k = 100, color = "currentColor") {
    const id = `tm${uid++}`;
    let defs = "", body = "";
    line.chars.forEach((c, i) => {
      if (!c.shapes.length) return;
      const paths = c.shapes.map((s) => pathData(s, c.x, k)).join("");
      const cut = c.cuts.map((s) => pathData(s, c.x, k)).join("");
      defs += `<mask id="${id}_${i}" maskUnits="userSpaceOnUse"><rect x="${(c.x * k).toFixed(1)}" y="0" width="${(c.width * k).toFixed(1)}" height="${k}" fill="#fff"/>${cut ? `<path d="${cut}" fill="#000"/>` : ""}</mask>`;
      body += `<path d="${paths}" mask="url(#${id}_${i})"/>`;
    });
    const W = Math.max(line.width * k, 1);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(1)} ${k}" width="${W.toFixed(0)}" height="${k}"><defs>${defs}</defs><g fill="${color}" fill-rule="nonzero">${body}</g></svg>`;
  }

  function flatten(shape) {  // quads -> points, for rasterizing outside a browser
    const out = [];
    shape.forEach((v) => {
      if (!v.q) { out.push(v); return; }
      const s = out[out.length - 1];
      for (let t = 0.125; t <= 1.0001; t += 0.125) {
        const u = 1 - t;
        out.push([u * u * s[0] + 2 * u * t * v.q[0] + t * t * v.p[0], u * u * s[1] + 2 * u * t * v.q[1] + t * t * v.p[1]]);
      }
    });
    return out;
  }

  const api = { P, layoutLine, lineSVG, flatten, skeletonOf, generate };
  root.TapeEngine = api;
  if (typeof module !== "undefined") module.exports = api;
})(globalThis);
