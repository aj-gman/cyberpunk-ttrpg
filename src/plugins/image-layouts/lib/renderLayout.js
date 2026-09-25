/**
 * Dispatch a parsed image-layout block to the matching renderer.
 *
 * Returns null when the layout is not supported (the hook then leaves the
 * block as a code block) — e.g. carousel and custom grids, which the MVP does
 * not implement yet.
 */
const { masonryColumns } = require("./layouts");
const { renderGrid } = require("./renderGrid");
const { renderMasonry } = require("./renderMasonry");

function renderLayout(block, images) {
  const layout = (block && block.layout) || "";
  const options = (block && block.options) || {};

  const columns = masonryColumns(layout);
  if (columns) return renderMasonry(columns, images, options);

  return renderGrid(layout, images, options);
}

module.exports = { renderLayout };
