/**
 * Parse the body of an image-layout fence into a layout name, options and
 * image list.
 *
 * Both syntaxes the Obsidian plugin supports are handled:
 *   ```image-layout        + front matter `layout: b`   (modern)
 *   ```image-layout-b                                   (legacy suffix)
 */
const { parseImages } = require("./images");

let parseYaml = null;
try {
  // `yaml` ships with the template, so this is a plain require in practice.
  const YAML = require("yaml");
  parseYaml = (source) => YAML.parse(source);
} catch {
  parseYaml = null;
}

/**
 * Split an optional `---` YAML front matter block off the body. Returns
 * { yaml: string|null, body: string }.
 */
function splitFrontMatter(content) {
  const lines = String(content || "").replace(/\r\n/g, "\n").split("\n");
  let start = 0;
  while (start < lines.length && lines[start].trim() === "") start++;
  if (start >= lines.length || lines[start].trim() !== "---") {
    return { yaml: null, body: content };
  }
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) {
    return { yaml: null, body: content };
  }
  return {
    yaml: lines.slice(start + 1, end).join("\n"),
    body: lines.slice(end + 1).join("\n"),
  };
}

function parseOptions(yamlSource) {
  if (!yamlSource || !parseYaml) return {};
  try {
    const parsed = parseYaml(yamlSource);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.warn(`[image-layouts] invalid block options: ${error.message}`);
    return {};
  }
}

/**
 * Layout name for a fence info string: the "image-layout-b" suffix, or the
 * `layout:` option for a bare "image-layout" fence.
 */
function legacySuffix(info) {
  const suffix = String(info || "").replace(/^image-layout/, "");
  return suffix.replace(/^-/, "").trim().toLowerCase();
}

/** Convert a parsed options object into the shape the renderer expects. */
function normalizeOptions(options) {
  const descriptions = Array.isArray(options.descriptions)
    ? options.descriptions.map((value) => String(value))
    : undefined;
  return {
    caption:
      options.caption === undefined || options.caption === null
        ? ""
        : String(options.caption),
    descriptions,
    overlay: options.overlay ? String(options.overlay).toLowerCase() : undefined,
    permanentOverlay:
      options.permanentOverlay === undefined
        ? undefined
        : Boolean(options.permanentOverlay),
    fit: options.fit ? String(options.fit).toLowerCase() : undefined,
    align: options.align ? String(options.align).toLowerCase() : undefined,
    width:
      typeof options.width === "number" || typeof options.width === "string"
        ? options.width
        : undefined,
  };
}

/**
 * Parse a fence into { layout, options, images }. `layout` is "" when neither
 * the info suffix nor the front matter names one.
 */
function parseBlock(info, content) {
  const { yaml, body } = splitFrontMatter(content);
  const rawOptions = parseOptions(yaml);
  const layout = String(rawOptions.layout || legacySuffix(info) || "")
    .trim()
    .toLowerCase();
  return {
    layout,
    options: normalizeOptions(rawOptions),
    images: parseImages(body),
  };
}

module.exports = { parseBlock, splitFrontMatter, normalizeOptions };
