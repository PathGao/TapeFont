import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("../web/data.js");
const E = require("../web/engine.js");
const DATA = globalThis.TAPE_DATA;

// every 15th skeleton char of both sets, plus kana
const CHARS = [...new Set(Object.keys(DATA.zh).filter((c, i) => i % 15 === 0)
  .concat(Object.keys(DATA.ja).filter((c, i) => i % 15 === 0), [..."あいうえおかきくけこアイウエオカキクケコ鷹議"]))];
const gen = (ch, g = "grid") => E.generate(ch, E.skeletonOf(ch, "ja", DATA), g);

test("grid is the default generator, trace stays reachable", () => {
  assert.equal(E.P.generator, "grid");
  const t = gen("永", "trace"), g = gen("永");
  assert.notEqual(JSON.stringify(t.strips), JSON.stringify(g.strips));
});

test("grid: deterministic, finite, ink in the cell", () => {
  for (const ch of CHARS) {
    const g = gen(ch), s = JSON.stringify(g);
    assert.equal(s, JSON.stringify(gen(ch)), ch);
    assert.ok(!s.includes("null"), `NaN in ${ch}`);
    assert.ok(g.w >= 0.07 - 1e-9 && g.w <= E.P.w, `${ch} w ${g.w}`);
    assert.ok(g.strips.length + g.polys.length > 0, `${ch} empty`);
    const m = 1e-9;  // strips stay in the cell (tips just past an outer level stop on it, run-ons stop at the edge)
    for (const p of g.strips.flat()) assert.ok(p[0] >= -m && p[0] <= g.aspect + m && p[1] >= -m && p[1] <= 1 + m, `${ch} strip point ${p}`);
    // slabs may run past the cell edge by their cut (the cell mask trims it), never further than one tape
    for (const p of g.polys.flat()) assert.ok(p[0] >= -2 * g.w && p[0] <= g.aspect + 2 * g.w && p[1] >= -2 * g.w && p[1] <= 1 + 2 * g.w, `${ch} poly point ${p}`);
  }
});

test("grid: strips are axis-aligned, diagonals are four-corner slabs", () => {
  for (const ch of CHARS) {
    const g = gen(ch);
    for (const s of g.strips) for (let i = 0; i + 1 < s.length; i++) {
      const dx = Math.abs(s[i + 1][0] - s[i][0]), dy = Math.abs(s[i + 1][1] - s[i][1]);
      assert.ok(dx < 1e-6 || dy < 1e-6, `${ch} diagonal strip segment ${JSON.stringify([s[i], s[i + 1]])}`);
    }
    for (const p of g.polys) assert.ok(p.length === 4 || p.length === 20, ch);  // slabs, blocks; discs of the kana marks
  }
});

test("grid: bars of 日 on equally spaced levels, posts on two columns", () => {
  const g = gen("日");
  const ys = [...new Set(g.strips.flatMap((s) => s.slice(1).filter((p, i) => Math.abs(p[1] - s[i][1]) < 1e-6).map((p) => +p[1].toFixed(3))))].sort((a, b) => a - b);
  assert.equal(ys.length, 3, JSON.stringify(ys));
  assert.ok(Math.abs(ys[1] - ys[0] - (ys[2] - ys[1])) < 0.06, JSON.stringify(ys));
  assert.ok(Math.abs(ys[0] - g.w / 2) < 1e-6 && Math.abs(ys[2] - (1 - g.w / 2)) < 1e-6);
});

test("generated chars lay out in a line with either generator", () => {
  for (const g of ["grid", "trace"]) {
    E.P.generator = g;
    const L = E.layoutLine("鷹議永", DATA);
    for (const c of L.chars) assert.ok(c.shapes.length > 0 && !c.missing, `${g} ${c.ch}`);
  }
  E.P.generator = "grid";
});

test("grid: kana ticks turn up, い is posts, と starts with a mid bar", () => {
  const up = (s) => s[s.length - 1][1] < Math.max(...s.map((p) => p[1])) - 0.1 && s[s.length - 1][0] > s[0][0];
  assert.ok(gen("ル").strips.some(up), "ル right stroke is a U ending up");
  assert.equal(gen("い").polys.length, 0, "い has no slabs");
  const t = gen("と"), y0 = Math.min(...t.strips.flatMap((s) => s.filter((p, i) => i && Math.abs(p[1] - s[i - 1][1]) < 1e-6).map((p) => p[1])));
  assert.ok(y0 > 0.3, `と highest bar at ${y0}`);
});

test("grid: 广/厂 撇 is a post under the left end of the top bar", () => {
  for (const ch of ["広", "原", "府"]) {
    const g = gen(ch);
    const posts = g.strips.flatMap((s) => s.slice(1).map((q, i) => [s[i], q])).filter(([p, q]) => Math.abs(p[0] - q[0]) < 1e-6 && Math.abs(p[1] - q[1]) > 0.6);
    assert.ok(posts.some(([p]) => p[0] < 0.15), `${ch}: no long post on the left`);
  }
});

test("grid: facing levels keep their white across a non-facing level between them", () => {
  const Gr = require("../web/grid.js");
  const L = (v, lo, hi) => ({ v, items: [{ v, lo, hi }] });
  const cl = [L(0.3, 0.1, 0.4), L(0.4, 0.6, 0.9), L(0.5, 0.1, 0.4), L(0.6, 0.1, 0.4), L(0.7, 0.1, 0.4)];
  const w = 0.07, k = Gr.place(cl, cl.map((c) => c.v), 0.35, w, 0.3, false);
  assert.ok(k[2].p - k[0].p >= w * 1.3 - 1e-9, `A..C ${k[2].p - k[0].p}`);
  assert.equal(Gr.place(cl, cl.map((c) => c.v), 0.3, w, 0.3, false), null);
});

test("grid: bars inside an enclosure close to hairline slits only when the white cannot fit", () => {
  const Gr = require("../web/grid.js");
  const cl = [0.2, 0.3, 0.4, 0.5, 0.6].map((v) => ({ v, items: [{ v, lo: 0.1, hi: 0.5 }] }));
  const w = 0.1, tips = cl.map((c) => c.v), all = () => true;
  assert.equal(Gr.place(cl, tips, 0.6, w, 0.3, true), null);
  const k = Gr.place(cl, tips, 0.6, w, 0.3, true, all);
  for (let i = 1; i < k.length; i++) assert.ok(k[i].p - k[i - 1].p >= w + Gr.G.slit - 1e-9);
  // 日 at full tape keeps real white (no block)
  const g = gen("日"), ys = g.strips.flatMap((s) => s.map((p) => p[1]));
  assert.ok(new Set(ys.map((y) => y.toFixed(3))).size >= 3 && g.w === E.P.w);
});

test("grid: the top dot of 言 主 計 is a post from the top edge", () => {
  for (const ch of ["言", "主", "計"]) {
    const g = gen(ch);
    assert.ok(!g.polys.some((p) => Math.min(...p.map((q) => q[1])) < 0.15), `${ch} has a block at the top`);
    const ends = g.strips.flatMap((s) => [[s[0], s[1]], [s[s.length - 1], s[s.length - 2]]]);
    assert.ok(ends.some(([p, q]) => p[1] === 0 && Math.abs(p[0] - q[0]) < 1e-6), `${ch} top post`);
  }
});

test("grid: dots are bars or posts at least 2 tapes long, never squares (氵 灬)", () => {
  for (const ch of ["注", "点", "冰", "渋"]) {
    const g = gen(ch), sq = (P) => Math.max(...P.map((p) => p[0])) - Math.min(...P.map((p) => p[0])) < 1.5 * g.w && Math.max(...P.map((p) => p[1])) - Math.min(...P.map((p) => p[1])) < 1.5 * g.w;
    assert.ok(!g.polys.some(sq), `${ch} has a square block`);
  }
  // 灬 of 点 然: one band across the cell split into four pieces about 2 tapes tall, a tape of white between
  for (const ch of ["点", "然"]) {
    const g = gen(ch), low = g.polys.filter((P) => P.every((p) => p[1] > 0.7)).sort((p, q) => p[0][0] - q[0][0]);
    assert.equal(low.length, 4, `${ch} ${JSON.stringify(g.polys)}`);
    assert.ok(Math.abs(low[0][0][0]) < 1e-9 && Math.abs(low[3][1][0] - g.aspect) < 1e-9, `${ch} band spans the cell`);
    for (let i = 0; i < 4; i++) {
      assert.ok(low[i][2][1] - low[i][0][1] >= 1.9 * g.w, `${ch} piece ${i} height`);
      if (i) assert.ok(Math.abs(low[i][0][0] - low[i - 1][1][0] - g.w) < 1e-9, `${ch} gap ${i}`);
    }
  }
  // 氵: the top two dots are bars from the cell edge on the right part's levels, white before the right part
  for (const ch of ["活", "清"]) {
    const g = gen(ch), bars = g.strips.filter((s) => s.length === 2 && s[0][0] === 0 && s[0][1] === s[1][1] && s[0][1] < 0.6);
    assert.equal(bars.length, 2, `${ch} ${JSON.stringify(g.strips)}`);
    for (const b of bars) assert.ok(g.strips.some((s) => s !== b && s.some((p) => Math.abs(p[1] - b[0][1]) < 1e-9 && p[0] > b[1][0])), `${ch} bar at ${b[0][1]} not on a right-part level`);
  }
});

test("grid: slab tips are blunt, 撇/捺 of 木 end in the bottom corners", () => {
  for (const ch of CHARS) for (const P of gen(ch).polys) {
    if (P.length !== 4) continue;
    for (let i = 0; i < 4; i++) {  // interior angles of a slab: no blade sharper than asin(G.blunt)
      const [a, b, c] = [P[(i + 3) % 4], P[i], P[(i + 1) % 4]], u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
      const ang = Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v)));
      assert.ok(ang > Math.asin(0.6) - 0.02, `${ch} blade ${(ang * 180) / Math.PI}`);
    }
  }
  const g = gen("木"), pts = g.polys.flat();
  for (const x of [0, g.aspect]) assert.ok(pts.some((p) => Math.abs(p[1] - 1) < 1e-9 && Math.abs(p[0] - x) < g.w), `木 no slab end at (${x}, 1)`);
});

test("grid: no more holes than the skeleton has; frames stay closed, end-to-end corners close", () => {
  const Gr = require("../web/grid.js");
  // 电: the lattice leaves two of its four cells open, joining the nearest end closes one more (hand: 4)
  for (const [ch, n] of [["口", 1], ["日", 2], ["田", 4], ["回", 2], ["国", 1], ["电", 3]]) assert.equal(Gr.holes(gen(ch)), n, ch);
  for (const ch of ["林", "伞", "鉄"]) assert.equal(Gr.holes(gen(ch)), 0, ch);
});

test("grid: kana marks keep the base and sit in the top-right corner", () => {
  const a = E.P.aspect;
  for (const [ch, base, n] of [["ど", "と", 2], ["ブ", "フ", 2], ["ぷ", "ふ", 1]]) {
    const g = gen(ch), b = gen(base);
    const marks = g.polys.slice(-n);
    for (const p of marks.flat()) assert.ok(p[0] > a / 2 && p[1] < 0.36, `${ch} mark at ${p}`);
    if (ch === "ぷ") assert.equal(g.cuts.length, 1, "ring hole");
    const x0 = Math.min(...marks.flat().map((p) => p[0])), y1 = Math.max(...marks.flat().map((p) => p[1]));
    for (const p of g.strips.flat()) assert.ok(!(p[0] > x0 && p[1] < y1), `${ch} strip point ${p} under the marks`);
    assert.equal(g.strips.length, b.strips.length, `${ch} keeps ${base}'s strips`);
  }
});
