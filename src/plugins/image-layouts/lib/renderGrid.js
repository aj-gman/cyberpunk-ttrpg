/**
 * Grid layout rendering (layouts a-i, single).
 *
 * DOM matches obsidian-image-layouts' LegacyImageLayout: an align wrapper, a
 * CSS-grid container with the layout class, one positioned cell per image.
 */
const { GRID_LAYOUTS } = require("./layouts");
const { cssSize, padTo, renderCaption, renderImageCell } = require("./html");

/**
 * Returns the layout HTML, or null when `layout` is not a supported grid.
 */
function renderGrid(layout, images, options) {
  const spec = GRID_LAYOUTS[layout];
  if (!spec) return null;

  const opts = options || {};
  const slots = padTo(images, spec.images);

  const aligned = opts.align && opts.align !== "full";
  const styleParts = [];
  if (aligned) {
    // Mirrors upstream: aligned layouts default to half width.
    styleParts.push(`width:${cssSize(opts.width) || "50%"}`);
  }
  const maxWidth = cssSize(opts.width);
  if (maxWidth) styleParts.push(`max-width:${maxWidth}`);
  const style = styleParts.length > 0 ? ` style="${styleParts.join(";")}"` : "";

  const gridClasses = [
    "image-layouts",
    "image-layouts-grid",
    `image-layouts-layout-${layout}`,
  ];
  if (opts.fit === "natural") gridClasses.push("fit-natural");

  const cells = slots
    .map((image, index) => renderImageCell(image, index, opts))
    .join("");

  const alignClass = opts.align ? `align-${opts.align}` : "align-full";

  return (
    `<div class="image-layouts-align ${alignClass}">` +
    `<div class="${gridClasses.join(" ")}"${style}>${cells}</div>` +
    `</div>` +
    renderCaption(opts.caption)
  );
}

module.exports = { renderGrid };
