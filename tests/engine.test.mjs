import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("../web/data.js");
const E = require("../web/engine.js");
const DATA = globalThis.TAPE_DATA;

const LINES = ["新宿駅南口改札・左側通行", "東口広場 関係者以外立入禁止", "ありがとうございます", "0123456789 TOKYU"];
const lay = (t, align = true) => E.layoutLine(t, DATA, { align });

// Corner vertices of a rounded shape: the `q` of each rounded corner and plain points
// that are not the lead-in of a rounding (those slide with segment length).
const vertices = (shape) => shape.filter((v, i) => v.q || !(shape[i + 1] && shape[i + 1].q)).map((v) => v.q || v);

test("sign lines: every char drawn, no NaN", () => {
  for (const t of LINES) {
    const L = lay(t);
    assert.ok(Number.isFinite(L.width));
    for (const c of L.chars) {
      assert.equal(c.missing, false, `missing ${c.ch}`);
      if (c.ch.trim()) assert.ok(c.shapes.length > 0, `no shapes for ${c.ch}`);
    }
    assert.ok(!JSON.stringify(L).includes("null"), `NaN/Infinity in ${t}`);
  }
});

test("layout is deterministic", () => {
  for (const t of LINES) assert.equal(JSON.stringify(lay(t)), JSON.stringify(lay(t)));
});

test("line solve: no horizontal change, vertical moves within tolGen", () => {
  const eps = 1e-6;
  // Centerline x never changes; outline corners on diagonals shift a hair because the
  // miter offset follows the warped slope (measured <= 0.0012 cell). 0.002 still catches
  // any horizontal scaling of 0.6% or more.
  const xTol = 0.002;
  for (const t of LINES) {
    const on = lay(t, true), off = lay(t, false);
    on.chars.forEach((c, i) => {
      const o = off.chars[i];
      assert.equal(c.x, o.x);
      assert.equal(c.width, o.width);
      assert.equal(c.shapes.length, o.shapes.length, c.ch);
      c.shapes.forEach((s, j) => {
        const a = vertices(s), b = vertices(o.shapes[j]);
        assert.equal(a.length, b.length, `${c.ch} shape ${j}`);
        a.forEach((p, k) => {
          assert.ok(Math.abs(p[0] - b[k][0]) <= xTol, `${c.ch} x moved ${p[0] - b[k][0]}`);
          assert.ok(Math.abs(p[1] - b[k][1]) <= E.P.tolGen + eps, `${c.ch} y moved ${p[1] - b[k][1]}`);
        });
      });
    });
  }
});

test("lineSVG: one path per drawn glyph", () => {
  const L = lay(LINES[0]);
  const svg = E.lineSVG(L);
  assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
  const drawn = L.chars.filter((c) => c.shapes.length).length;
  assert.equal((svg.match(/<path d="[^"]*" mask=/g) || []).length, drawn);
});

test("char without a hand glyph is generated from its skeleton", () => {
  assert.ok(!DATA.hand["鷹"] && (DATA.zh["鷹"] || DATA.ja["鷹"]));
  const [c] = lay("鷹").chars;
  assert.equal(c.missing, false);
  assert.ok(c.shapes.length > 0);
});

test("composed chars: built from library parts, deterministic, no NaN", () => {
  const chars = Object.keys(DATA.comp);
  assert.ok(chars.length > 50, `only ${chars.length} composed chars`);
  for (const ch of chars) {
    assert.ok(!DATA.hand[ch], ch);
    const g = E.glyphFor(ch, "zh", DATA);
    assert.ok(g && g.composed && g.skel === 0, `${ch} not composed from parts`);
    const L = lay(ch);
    assert.ok(L.chars[0].shapes.length > 0, `no shapes for ${ch}`);
    assert.ok(!JSON.stringify(L).includes("null"), `NaN/Infinity in ${ch}`);
    assert.equal(JSON.stringify(L), JSON.stringify(lay(ch)));
  }
});

test("composed glyphs in a line: ink inside the cell", () => {
  const L = lay(Object.keys(DATA.comp).slice(0, 12).join(""));
  for (const c of L.chars) for (const s of c.shapes) for (const v of s) {
    const p = v.q ? v.p : v;
    assert.ok(p[0] > -0.02 && p[0] < c.width + 0.02 && p[1] > -0.02 && p[1] < 1.02, `${c.ch} ink outside its cell`);
  }
});

test("a component without a library part is built from its own skeleton strokes", () => {
  const ch = "鷹", n = DATA.zh[ch].length;  // fake tree: 广 (library part) around the rest (no part)
  const rest = [...Array(n - 3).keys()].map((i) => i + 3);
  const data = Object.assign({}, DATA, { comp: { [ch]: ["zh", [ch, "", [0, 0, 1000, 1000], [
    ["广", "tare", [0, 0, 1000, 1000], [0, 1, 2]], ["", "tarec", [300, 300, 1000, 1000], rest]]]] } });
  const g = E.glyphFor(ch, "zh", data);
  assert.ok(g.composed && g.skel === n - 3);
  const L = E.layoutLine(ch, data);
  assert.ok(L.chars[0].shapes.length > 3);
  assert.ok(!JSON.stringify(L).includes("null"));
});
