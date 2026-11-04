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
    const m = g.w / 2 + 1e-6;
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
