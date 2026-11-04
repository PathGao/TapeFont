// Lay out text lines with the engine and dump flattened polygons for src/raster_web.py.
// usage: node web/cli.js "line1|line2" out.json [--noalign] [--lang=zh|ja] [--gen=grid|trace]
//        node web/cli.js --glyphs CHARS out.json [--lang=..] [--gen=..]
//          generated glyphs (hand glyphs ignored) as {ch: glyph JSON}, before any line solve
require("./data.js");
const E = require("./engine.js");
const args = process.argv.slice(2);
const opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split("=")[1];
const lang = opt("lang", "auto");
E.P.generator = opt("gen", E.P.generator);
// --G=key:val,...  overrides web/grid.js parameters (tuning)
for (const kv of opt("G", "").split(",").filter(Boolean)) { const [k, v] = kv.split(":"); require("./grid.js").G[k] = +v; }
const D = globalThis.TAPE_DATA;
if (args[0] === "--glyphs") {
  const out = {};
  for (const ch of args[1]) {
    const sk = E.skeletonOf(ch, lang === "zh" ? "zh" : "ja", D);
    if (!sk) continue;
    const g = E.generate(ch, sk);
    out[ch] = { aspect: g.aspect, w: g.w, strips: g.strips, polys: g.polys, cuts: g.cuts, sharp: g.sharp, n: sk.length };
  }
  require("fs").writeFileSync(args[2], JSON.stringify(out));
} else {
  const [text, out] = args;
  const align = !args.includes("--noalign");
  const lines = text.split("|").map((t) => {
    const L = E.layoutLine(t, D, { align, lang });
    return { width: L.width, chars: L.chars.map((c) => ({ ch: c.ch, x: c.x, width: c.width, missing: c.missing,
      shapes: c.shapes.map(E.flatten), cuts: c.cuts })) };
  });
  require("fs").writeFileSync(out, JSON.stringify({ lines }));
}
