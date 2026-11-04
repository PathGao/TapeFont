import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("../web/data.js");
const E = require("../web/engine.js");
const DATA = globalThis.TAPE_DATA;

const LINES = ["新宿駅南口改札・左側通行", "東口広場 関係者以外立入禁止", "ありがとうございます", "0123456789 TOKYU"];
const REVIEW = ["新宿駅南口改札・左側通行", "東口広場 関係者以外立入禁止", "国会議事堂 日本の政治経済", "電車が参ります 危険ですので",
  "黄色い線の内側でお待ちください", "改修工事中 ご迷惑をおかけします", "戦後の経済と社会 職業の選択"];
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

// 鷹 is hand-built now; these tests take its hand glyph away to exercise the fallbacks
const NOHAND = Object.assign({}, DATA, { hand: Object.fromEntries(Object.entries(DATA.hand).filter(([k]) => k !== "鷹")) });

test("char without a hand glyph is generated from its skeleton", () => {
  assert.ok(DATA.zh["鷹"] || DATA.ja["鷹"]);
  const [c] = E.layoutLine("鷹", NOHAND).chars;
  assert.equal(c.missing, false);
  assert.ok(c.shapes.length > 0);
});

test("line solve: neighbours' bar edges meet or clearly differ", () => {
  // top/bottom edges of axis-aligned bar shapes; a pair 0.004-0.04 apart reads as a mistake
  const bars = (c) => c.shapes.map(E.flatten).filter((s) => s.length === 4).flatMap((s) => {
    const ys = s.map((p) => p[1]), xs = s.map((p) => p[0]), t = Math.min(...ys), b = Math.max(...ys);
    return new Set(ys.map((v) => v.toFixed(5))).size === 2 && Math.max(...xs) - Math.min(...xs) > b - t ? [[t, 1], [b, -1]] : [];
  });
  const misses = (align) => REVIEW.reduce((n, t) => {
    const L = lay(t, align);
    L.chars.forEach((a, i) => {
      const eb = L.chars[i + 1] ? bars(L.chars[i + 1]) : [];
      for (const [y, k] of bars(a)) {
        const d = Math.min(...eb.filter((e) => e[1] === k).map((e) => Math.abs(e[0] - y)));
        if (d > 0.004 && d < 0.04) n++;
      }
    });
    return n;
  }, 0);
  const on = misses(true), off = misses(false);
  assert.ok(on <= 0.7 * off, `near misses ${on} with the solve, ${off} without`);
});

test("optical spacing: narrow glyphs close up, ink never nearer than one gap", () => {
  const rows = (c) => {  // per 0.01 row: [leftmost, rightmost] ink x in line units; ink outside the cell is masked off
    const L = {}, R = {};
    for (const s of c.shapes.map(E.flatten)) s.forEach((a, i) => {
      const b = s[(i + 1) % s.length], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.004) + 1;
      for (let t = 0; t <= n; t++) {
        const v = a[1] + ((b[1] - a[1]) * t) / n, y = Math.min(Math.floor(v * 100), 99), x = c.x + Math.min(Math.max(a[0] + ((b[0] - a[0]) * t) / n, 0), c.width);
        if (v < 0 || v > 1) continue;
        L[y] = Math.min(L[y] ?? Infinity, x); R[y] = Math.max(R[y] ?? -Infinity, x);
      }
    });
    return { L, R };
  };
  for (const t of [...REVIEW, "ハイ・ヒール 小川", "しいたけ・くり・いか"]) {
    const L = lay(t);
    L.chars.forEach((a, i) => {
      const b = L.chars[i + 1];
      if (!b || !a.shapes.length || !b.shapes.length) return;
      const ra = rows(a), rb = rows(b);
      for (const y in ra.R) if (y in rb.L) assert.ok(rb.L[y] - ra.R[y] >= E.P.gap - 1e-3, `${a.ch}${b.ch} ink ${(rb.L[y] - ra.R[y]).toFixed(4)} apart`);
    });
  }
  const [a, dot, b] = lay("新・新").chars;
  assert.ok(dot.x < a.x + a.width + E.P.gap - 0.05 && b.x - dot.x < dot.width + E.P.gap - 0.05, "・ closes up");
});
