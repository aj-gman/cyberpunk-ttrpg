/**
 * Masonry layout rendering (masonry-2 .. masonry-6).
 *
 * DOM matches obsidian-image-layouts' LegacyMasonryLayout: a CSS grid of
 * flex columns, with images distributed round-robin so column heights stay
 * balanced.
 */
const { renderCaption, renderImageCell } = require("./html");

/** Returns the layout HTML for `columns` columns, or null for an invalid count. */
function renderMasonry(columns, images, options) {
  if (!Number.isInteger(columns) || columns < 1) return null;

  const opts = options || {};
  const buckets = Array.from({ length: columns }, () => []);
  (images || []).forEach((image, index) => {
    buckets[index % columns].push({ image, index });
  });

  const columnHtml = buckets
    .map(
      (bucket) =>
        `<div class="image-layouts-masonry-column">${bucket
          .map(({ image, index }) => renderImageCell(image, index, opts))
          .join("")}</div>`,
    )
    .join("");

  return (
    `<div class="image-layouts image-layouts-masonry image-layouts-masonry-grid-${columns}">` +
    `${columnHtml}</div>` +
    renderCaption(opts.caption)
  );
}

module.exports = { renderMasonry };
