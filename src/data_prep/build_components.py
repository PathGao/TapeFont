"""Component trees of chars, for assembling missing chars from hand-built parts.

usage: python -I build_components.py <project_dir>
reads data/raw/kanjivg (Japanese forms) and data/raw/mmah/dictionary.txt + data/skeletons.jsonl
(Chinese forms, simplified included); writes data/components.jsonl.
One line per char and source: {"ch": ..., "src": "ja" | "zh", "t": node}. "src" names the
data.js skeleton whose stroke i is stroke i here. node = [element, position, box, kids]:
  element   component char ("" for loose strokes or an unnamed part)
  position  left right top bottom, or for surrounds the outer tare / nyo / kamae and the
            content tarec / nyoc / kamaec (KanjiVG kvg:position names), or ""
  box       [x0, y0, x1, y1] of the node's stroke centerlines, thousandths of the cell, y down
  kids      child nodes, or for a leaf the list of its stroke indices
KanjiVG groups split into parts (kvg:part, e.g. 囗 around 玉 in 国) are merged into one node.
Only chars whose top level splits into 2+ parts are written.
"""
import json, re, sys
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_skeletons import flatten

K = 1000 / 109
attr = lambda el, name: next((v for k, v in el.attrib.items() if k.split("}")[-1] == name), "")


def parse(svg_text):
    root = ET.fromstring(svg_text)
    g = next(e for e in root.iter() if e.tag.endswith("g") and attr(e, "id").startswith("kvg:StrokePaths"))
    order = sorted((int(re.search(r"-s(\d+)$", attr(p, "id")).group(1)), p) for p in g.iter() if p.tag.endswith("path"))
    pts = {id(p): [(x * K, y * K) for poly in flatten(attr(p, "d")) for x, y in poly] for _, p in order}
    index = {id(p): i for i, (_, p) in enumerate(order)}

    def box(strokes):
        ps = [q for i in strokes for q in pts[id(order[i][1])]]
        return [round(min(p[0] for p in ps)), round(min(p[1] for p in ps)), round(max(p[0] for p in ps)), round(max(p[1] for p in ps))]

    def strokes_of(el):
        return [index[id(p)] for p in el.iter() if p.tag.endswith("path")]

    def node(el):
        kids, loose = [], []
        for c in el:
            if c.tag.endswith("path"):
                loose.append(index[id(c)])
                continue
            k = node(c)
            prev = next((q for q in reversed(kids) if q[4] and q[0] == k[0]), None) if attr(c, "part") else None
            if prev is not None:  # later part of a split group
                prev[3] = leaves(prev) + leaves(k)
                prev[2] = box(prev[3])
                continue
            kids.append(k + [bool(attr(c, "part"))])
        if loose:
            kids.append(["", "", box(loose), loose, False])
        s = strokes_of(el)
        if len(kids) == 1 and not kids[0][1]:  # a lone wrapper group adds nothing
            k = kids[0]
            return [attr(el, "element") or k[0], attr(el, "position"), k[2], k[3]]
        if len(kids) < 2:
            return [attr(el, "element"), attr(el, "position"), box(s), s]
        return [attr(el, "element"), attr(el, "position"), box(s), [k[:4] for k in kids]]

    top = next(c for c in g if c.tag.endswith("g"))
    return node(top) if order else None


def leaves(n):
    return n[3] if not n[3] or isinstance(n[3][0], int) else [i for k in n[3] for i in leaves(k)]


# IDS operator -> positions of its parts
IDS = {"⿰": ("left", "right"), "⿱": ("top", "bottom"), "⿲": ("left", "", "right"), "⿳": ("top", "", "bottom"),
       "⿴": ("kamae", "kamaec"), "⿵": ("kamae", "kamaec"), "⿶": ("kamae", "kamaec"), "⿷": ("kamae", "kamaec"),
       "⿸": ("tare", "tarec"), "⿹": ("kamae", "kamaec"), "⿺": ("nyo", "nyoc"), "⿻": ("", "")}


def parse_ids(r, strokes):
    """Make Me a Hanzi dictionary record + its skeleton strokes (MMAH frame, y up) -> node."""
    ids, matches, it = r["decomposition"], r["matches"], iter(r["decomposition"])
    if len(matches) != len(strokes) or ids[0] not in IDS:
        return None
    pts = [[(x * 1000 / 1024, (900 - y) * 1000 / 1024) for x, y in s] for s in strokes]

    def box(ss):
        ps = [q for k in ss for q in pts[k]]
        return [round(min(p[0] for p in ps)), round(min(p[1] for p in ps)), round(max(p[0] for p in ps)), round(max(p[1] for p in ps))]

    def node(path, pos):  # consumes one IDS term
        c = next(it)
        kids = [node(path + [j], p) for j, p in enumerate(IDS[c])] if c in IDS else []
        mine = [k for k, m in enumerate(matches) if m is not None and m[:len(path)] == path]
        if not mine:
            return None
        if c not in IDS:
            return [c if c != "？" else "", pos, box(mine), mine]
        kids = [k for k in kids if k]
        loose = [k for k in mine if len(matches[k]) == len(path)]
        if loose:
            kids.append(["", "", box(loose), loose])
        return ["", pos, box(mine), kids] if len(kids) > 1 else kids[0][:1] + [pos] + kids[0][2:]

    root = node([], "")
    if not root or isinstance(root[3][0], int):
        return None
    loose = [k for k, m in enumerate(matches) if m is None]
    if loose:
        root[3].append(["", "", box(loose), loose])
    root[0], root[2] = r["character"], box(range(len(strokes)))
    return root


def main(root):
    out = root / "data/components.jsonl"
    n = {"ja": 0, "zh": 0}
    rec = lambda ch, src, t: json.dumps({"ch": ch, "src": src, "t": t}, ensure_ascii=False, separators=(",", ":")) + "\n"
    with open(out, "w", encoding="utf-8") as f:
        for p in sorted((root / "data/raw/kanjivg/main/kanji").glob("*.svg")):
            if "-" in p.stem:
                continue
            t = parse(p.read_text(encoding="utf-8"))
            if t and t[3] and not isinstance(t[3][0], int):
                f.write(rec(chr(int(p.stem, 16)), "ja", t)); n["ja"] += 1
        zh = {}
        for line in open(root / "data/skeletons.jsonl", encoding="utf-8"):
            r = json.loads(line)
            if r["src"] == "mmah":
                zh[r["ch"]] = r["strokes"]
        for line in open(root / "data/raw/mmah/dictionary.txt", encoding="utf-8"):
            r = json.loads(line)
            if r["character"] in zh and (t := parse_ids(r, zh[r["character"]])):
                f.write(rec(r["character"], "zh", t)); n["zh"] += 1
    print(n, "->", out)


if __name__ == "__main__":
    main(Path(sys.argv[1]).resolve())
