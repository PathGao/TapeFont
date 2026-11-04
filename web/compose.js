/* Component assembly: a char with no hand glyph is built from hand-built tape parts.
 *
 * data.comp[ch] = [src, tree]: the char's component tree (src/data_prep/build_components.py),
 * src = the skeleton ("zh" | "ja") whose stroke indices the tree's leaves use.
 * data.lib["element|position"] = a tape part cut out of a hand glyph (src/compose_lib.py).
 *
 * Each tree node gets a box in the cell. A node with a library part gets that part, its
 * centerlines mapped so the part's ink fills the box at the char's tape width. A node
 * without one is split into its children; a leaf without one is built from its own
 * skeleton strokes in its box. When a node splits in two and a library part knows where
 * it and its sibling sat in its source char ("rel", "sib"), both boxes follow the source,
 * so left radicals keep their hand-glyph width (0.27-0.38) and the levels they used.
 *
 * Returns a glyph entry in the glyphs/manual format, or null. Classic script
 * (globalThis.TapeCompose) and Node module.
 */
(function (root) {
  const GAP = 0.04;  // least white between the two halves of a split
  const MIN_SCALE = 0.5;  // a part may shrink to this fraction of its source size (between tape centerlines)
  const OUTER = new Set(["left", "nyo", "tare", "kamae"]);  // positions whose shape differs from the char alone

  const nameOf = (el) => ({ "⻌": "辶", "⻍": "辶", "⻎": "辶" }[el] || el);
  // the part cut at this very position: only its rel/sib say where it sits in a char
  const exact = (node, data) => (node[0] ? data.lib[nameOf(node[0]) + "|" + node[1]] : null);

  // else, unless the position reshapes the component (left radical, surround), the char's
  // own glyph ("|*", e.g. 口 under 吾) or a part cut at an unnamed position
  function lookup(node, data) {
    const name = nameOf(node[0]);
    return exact(node, data) || (name && !OUTER.has(node[1]) ? data.lib[name + "|*"] || data.lib[name + "|"] : null) || null;
  }

  const isLeaf = (node) => !node[3].length || typeof node[3][0] === "number";

  function childBoxes(node, box, data) {
    const [bx0, by0, bx1, by1] = box, W = bx1 - bx0, H = by1 - by0;
    const kv = node[2], kw = kv[2] - kv[0] || 1, kh = kv[3] - kv[1] || 1;
    const fromRel = (r) => [bx0 + r[0] * W, by0 + r[1] * H, bx0 + r[2] * W, by0 + r[3] * H];
    const boxes = node[3].map((k) => fromRel([(k[2][0] - kv[0]) / kw, (k[2][1] - kv[1]) / kh, (k[2][2] - kv[0]) / kw, (k[2][3] - kv[1]) / kh]));
    if (node[3].length !== 2) return boxes;
    const parts = node[3].map((k) => exact(k, data));
    const ax = { left: 0, right: 0, top: 1, bottom: 1 }[node[3][0][1]];
    if (ax === undefined) {  // surround: outer and content where the source char had them
      const i = parts[0] && parts[0].sib ? 0 : parts[1] && parts[1].sib ? 1 : -1;
      if (i >= 0) { boxes[i] = fromRel(parts[i].rel); boxes[1 - i] = fromRel(parts[i].sib); }
      return boxes;
    }
    // side by side or stacked: each part keeps its source extent across the split; the split
    // line is where the first part ended in its source (left radical width), else where the
    // second began; the halves keep GAP of white between them
    const [A, B] = boxes, lo = ax, hi = ax + 2, cl = 1 - ax, ch = 3 - ax;
    parts.forEach((p, i) => { if (p && p.rel) { const r = fromRel(p.rel); boxes[i][cl] = r[cl]; boxes[i][ch] = r[ch]; } });
    const L = ax ? H : W, b0 = ax ? by0 : bx0;
    const cut = parts[0] && parts[0].rel ? b0 + parts[0].rel[hi] * L : parts[1] && parts[1].rel ? b0 + parts[1].rel[lo] * L - GAP : (A[hi] + B[lo]) / 2 - GAP / 2;
    A[lo] = Math.min(A[lo], cut - 0.1); A[hi] = cut; B[lo] = cut + GAP; B[hi] = Math.max(B[hi], B[lo] + 0.1);
    return boxes;
  }

  function compose(ch, data, E) {
    const [src, tree] = data.comp[ch];
    const strokes = data[src] && data[src][ch];
    if (!strokes || isLeaf(tree)) return null;
    const a = E.P.aspect;
    const build = (w) => {
      const g = { aspect: a, w, strips: [], polys: [], cuts: [], sharp: [] }, ws = [w];
      let parts = 0, skel = 0;
      const put = (pts, fx, fy) => pts.map(([x, y]) => [fx(x), fy(y)]);
      const place = (node, box, top) => {
        const p = top ? null : lookup(node, data);
        // the tape keeps its width, so a part squeezed far below its source size clogs: use its children
        const squeeze = (i) => (p.box[i + 2] - p.box[i] - p.w) > 0.02 ? (box[i + 2] - box[i] - w) / (p.box[i + 2] - p.box[i] - p.w) : 1;
        if (p && Math.min(squeeze(0), squeeze(1)) >= MIN_SCALE) {
          parts++;
          ws.push(p.w);
          const h = w / 2, hs = p.w / 2, S = p.box;
          const axis = (s0, s1, t0, t1) => {  // source ink edges -> target ink edges, centerlines keep the tape inside
            const k = (t1 - t0 - 2 * h) / (s1 - s0 - 2 * hs);
            // a part about one tape across (a dot, a post) is moved, not squashed
            return s1 - s0 - 2 * hs > 0.02 && k > 0 ? (v) => t0 + h + (v - s0 - hs) * k : (v) => v - (s0 + s1) / 2 + (t0 + t1) / 2;
          };
          const fx = axis(S[0], S[2], box[0], box[2]), fy = axis(S[1], S[3], box[1], box[3]);
          for (const key of ["strips", "polys", "cuts"]) for (const s of p[key] || []) g[key].push(put(s, fx, fy));
          g.sharp.push(...put(p.sharp || [], fx, fy));
          return;
        }
        if (!isLeaf(node)) {
          const boxes = childBoxes(node, box, data);
          node[3].forEach((k, i) => place(k, boxes[i], false));
          return;
        }
        const TW = box[2] - box[0], TH = box[3] - box[1];
        skel += node[3].length;
        if (TW <= 0 || TH <= 0) return;
        const sub = E.fromSkeleton(ch, node[3].map((i) => strokes[i]).filter(Boolean), TW / TH, w / TH);
        ws.push(sub.w * TH);
        const fx = (x) => box[0] + x * TH, fy = (y) => box[1] + y * TH;
        g.strips.push(...sub.strips.map((s) => put(s, fx, fy)));
        g.polys.push(...sub.polys.map((s) => put(s, fx, fy)));
      };
      place(tree, [0, 0, a, 1], true);
      g.skel = skel;  // strokes built from the skeleton (no library part)
      return { g, ws, parts };
    };
    let r = build(E.P.w);
    if (!r.parts) return null;
    if (Math.min(...r.ws) < E.P.w - 1e-6) r = build(Math.max(0.09, Math.min(...r.ws)));  // a dense part thins the whole char
    return r.g;
  }

  const api = { compose };
  root.TapeCompose = api;
  if (typeof module !== "undefined") module.exports = api;
})(globalThis);
