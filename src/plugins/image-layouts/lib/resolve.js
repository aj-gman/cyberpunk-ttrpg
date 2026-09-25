/**
 * Resolve images referenced inside an image-layout block to public URLs.
 *
 * Published images live under src/site/img/user (the Obsidian Digital Garden
 * plugin uploads them there, keeping the vault folder, e.g. Pictures/). The
 * index matches the way Obsidian resolves "shortest path" wikilinks: an exact
 * relative path, or any path whose trailing segments equal the link path,
 * case-insensitively; ties go to the shortest path.
 *
 * Vendored (rather than reusing src/helpers/bases-engine/imageIndex.js) so the
 * plugin is self-contained and only depends on files inside its own directory.
 */
const fs = require("fs");

const IMAGE_ROOT = "src/site/img/user";
const PUBLIC_ROOT = "/img/user/";
// Vault attachment folder, used as a fallback when the file is not indexed
// (e.g. referenced before the upload that publishes it has run).
const FALLBACK_DIR = "Pictures";

const indexCache = new Map();

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** All files under rootDir as "/"-separated paths relative to it. */
function scanImageDir(rootDir) {
  const results = [];
  const walk = (dir, prefix) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(`${dir}/${entry.name}`, rel);
      } else if (entry.isFile()) {
        results.push(rel);
      }
    }
  };
  walk(rootDir, "");
  return results;
}

/**
 * Index a list of relative image paths. `resolve(linkpath)` returns the
 * indexed path in its real casing, or null.
 */
function createImageIndex(paths) {
  const byBasename = new Map();
  for (const p of paths) {
    const basename = p.split("/").pop().toLowerCase();
    if (!byBasename.has(basename)) byBasename.set(basename, []);
    byBasename.get(basename).push(p);
  }

  return {
    resolve(linkpath) {
      if (!linkpath) return null;
      const normalized = String(linkpath).toLowerCase();
      const candidates = byBasename.get(normalized.split("/").pop());
      if (!candidates) return null;

      const matches = candidates.filter((p) => {
        const lower = p.toLowerCase();
        return lower === normalized || lower.endsWith(`/${normalized}`);
      });
      if (matches.length === 0) return null;

      matches.sort((a, b) => a.length - b.length || a.localeCompare(b));
      return matches[0];
    },
  };
}

function getIndex(rootDir) {
  const root = rootDir || IMAGE_ROOT;
  let index = indexCache.get(root);
  if (!index) {
    index = createImageIndex(scanImageDir(root));
    indexCache.set(root, index);
  }
  return index;
}

/** Drop cached indexes so a rebuild picks up newly uploaded images. */
function resetImageIndex() {
  indexCache.clear();
}

function fallbackPath(target) {
  const clean = String(target).replace(/^\.\//, "").replace(/\\/g, "/");
  if (clean.includes("/")) return clean;
  return `${FALLBACK_DIR}/${clean}`;
}

/**
 * Resolve one parsed image descriptor to { src, width, height, alt }.
 * `options.index` injects an index (tests); otherwise the shared index over
 * `options.root` (default src/site/img/user) is used.
 */
function resolveImage(image, options) {
  if (!image || !image.target) return null;
  const target = image.target;
  const resolved = {
    src: target,
    width: image.width,
    height: image.height,
    alt: image.alt,
  };

  // Remote URLs, protocol-relative URLs, site-absolute paths and file://
  // links are used as-is.
  if (
    /^(https?:)?\/\//i.test(target) ||
    target.startsWith("/") ||
    target.startsWith("file:")
  ) {
    return resolved;
  }

  const index = (options && options.index) || getIndex(options && options.root);
  const hit = index.resolve(safeDecode(target));
  resolved.src = PUBLIC_ROOT + (hit || fallbackPath(target));
  return resolved;
}

/** Resolve every parsed image in a block. */
function resolveImages(images, options) {
  return (images || []).map((image) => resolveImage(image, options)).filter(Boolean);
}

module.exports = {
  IMAGE_ROOT,
  PUBLIC_ROOT,
  createImageIndex,
  scanImageDir,
  getIndex,
  resetImageIndex,
  resolveImage,
  resolveImages,
};
