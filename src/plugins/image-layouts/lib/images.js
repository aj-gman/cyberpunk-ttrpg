/**
 * Image line parsing for image-layout blocks.
 *
 * Mirrors obsidian-image-layouts (src/utils/images.ts) so the same lines the
 * Obsidian plugin accepts keep working here:
 *   ![[image.png]]              ![[image.png|300]]        (300 = max width)
 *   ![[image.png|My caption]]   ![[image.png|caption|300]]
 *   ![[Pictures/image.png|396]] (path-style vault link)
 *   ![alt](image.png)           ![alt](https://example.com/image.jpg)
 *
 * Numeric pipe segments are size hints; anything else is display text.
 */

const WIKI_LINK = /!\[\[([^\]]+)\]\]/;
// Alt and destination together so stray parens elsewhere on the line can't
// hijack the link; the destination allows one level of nested parens.
const MD_LINK = /!\[([^\]]*)\]\(([^()]*(?:\([^()]*\)[^()]*)*)\)/;

/** Split Obsidian pipe segments into { width, height, alt }. */
function parsePipeSegments(segments) {
  const attributes = {};
  const altParts = [];
  for (const segment of segments) {
    const trimmed = String(segment).trim();
    const size = trimmed.match(/^(\d+)(?:x(\d+))?$/);
    if (size) {
      attributes.width = Number(size[1]);
      if (size[2]) {
        attributes.height = Number(size[2]);
      }
    } else if (trimmed) {
      altParts.push(trimmed);
    }
  }
  if (altParts.length > 0) {
    attributes.alt = altParts.join("|");
  }
  return attributes;
}

/**
 * Parse a single body line into an image descriptor, or null when the line is
 * not an image embed.
 *
 * Returns { type: "wiki"|"internal"|"external"|"file", target, width?, height?, alt? }
 */
function parseImageLine(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed.startsWith("!")) return null;

  const md = trimmed.match(MD_LINK);
  if (md) {
    const target = md[2];
    if (!target || !target.trim()) return null;
    const attributes = parsePipeSegments((md[1] || "").split("|"));
    const clean = target.trim();
    let type = "internal";
    if (/^(https?:)?\/\//i.test(clean)) {
      type = "external";
    } else if (clean.startsWith("file:")) {
      type = "file";
    }
    return { type, target: clean, ...attributes };
  }

  const wiki = trimmed.match(WIKI_LINK);
  if (wiki) {
    const [target, ...pipeSegments] = wiki[1].split("|");
    if (!target || !target.trim()) return null;
    return {
      type: "wiki",
      target: target.trim(),
      ...parsePipeSegments(pipeSegments),
    };
  }

  return null;
}

/** Every image embed in a block body, in order. */
function parseImages(body) {
  return String(body || "")
    .split(/\r?\n/)
    .map(parseImageLine)
    .filter((image) => image !== null);
}

module.exports = { parseImageLine, parseImages, parsePipeSegments };
