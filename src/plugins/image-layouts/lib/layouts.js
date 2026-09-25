/**
 * Grid definitions ported from obsidian-image-layouts
 * (vertis/obsidian-image-layouts, src/interfaces.ts + LegacyImageLayout.svelte)
 * so a `layout: x` block renders with the same cell arrangement it has in
 * Obsidian.
 *
 * `images` is the number of slots the layout needs; `columns` and `areas`
 * mirror the plugin's CSS grid (also ported in styles/image-layouts.scss).
 */
const GRID_LAYOUTS = {
  a: { images: 2, columns: "1fr 1fr", areas: '"image-0 image-1"' },
  b: { images: 2, columns: "2fr 1fr", areas: '"image-0 image-1"' },
  c: { images: 2, columns: "1fr 2fr", areas: '"image-1 image-0"' },
  d: {
    images: 3,
    columns: "2fr 1fr",
    areas: '"image-0 image-1" "image-0 image-2"',
  },
  e: {
    images: 3,
    columns: "1fr 2fr",
    areas: '"image-1 image-0" "image-2 image-0"',
  },
  f: {
    images: 4,
    columns: "3fr 1fr",
    areas: '"image-0 image-1" "image-0 image-2" "image-0 image-3"',
  },
  g: {
    images: 4,
    columns: "1fr 3fr",
    areas: '"image-1 image-0" "image-2 image-0" "image-3 image-0"',
  },
  h: { images: 3, columns: "1fr 1fr 1fr", areas: '"image-0 image-1 image-2"' },
  i: {
    images: 4,
    columns: "1fr 1fr 1fr 1fr",
    areas: '"image-0 image-1 image-2 image-3"',
  },
  single: { images: 1, columns: "1fr", areas: '"image-0"' },
};

// The upstream plugin supports masonry-2 through masonry-6.
const MASONRY_PATTERN = /^masonry-([2-6])$/;

/** Grid spec for a layout name, or null when the name is not a grid layout. */
function gridLayout(name) {
  return Object.prototype.hasOwnProperty.call(GRID_LAYOUTS, name)
    ? GRID_LAYOUTS[name]
    : null;
}

/** Column count for a masonry-N layout name, or null. */
function masonryColumns(name) {
  const match = MASONRY_PATTERN.exec(name || "");
  return match ? Number(match[1]) : null;
}

module.exports = { GRID_LAYOUTS, gridLayout, masonryColumns };
