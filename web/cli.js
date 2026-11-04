// Lay out text lines with the engine and dump flattened polygons for src/raster_web.py.
// usage: node web/cli.js "line1|line2" out.json [--noalign] [--lang=zh|ja]
require("./data.js");
const E = require("./engine.js");
const [text, out] = process.argv.slice(2);
const align = !process.argv.includes("--noalign");
const lang = (process.argv.find((a) => a.startsWith("--lang=")) || "=auto").split("=")[1];
const lines = text.split("|").map((t) => {
  const L = E.layoutLine(t, globalThis.TAPE_DATA, { align, lang });
  return { width: L.width, chars: L.chars.map((c) => ({ ch: c.ch, x: c.x, width: c.width, missing: c.missing,
    shapes: c.shapes.map(E.flatten), cuts: c.cuts })) };
});
require("fs").writeFileSync(out, JSON.stringify({ lines }));
