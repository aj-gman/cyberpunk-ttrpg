/**
 * Shared markup helpers for image-layout rendering.
 *
 * The output mirrors obsidian-image-layouts' DOM (wrapper + per-image grid
 * area + optional overlay), with the classes its CSS uses, so the stylesheet
 * can be a direct port. Images are emitted as plain <img> tags: the garden's
 * `obsidian-html` transform then optimizes any src that starts with "/" into a
 * responsive <picture>.
 */

// Upstream falls back to a placeholder for layouts with fewer images than they
// need. A data URI is used so the image pipeline (which only optimizes
// site-absolute srcs) leaves it untouched.
const PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">' +
      '<rect width="100%" height="100%" fill="#3a3a3a"/></svg>',
  );

function escapeHtml(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A number is a px value; a string is used as-is. */
function cssSize(value) {
  if (value === undefined || value === null || value === "") return null;
  return typeof value === "number" ? `${value}px` : String(value);
}

/** Overlay mode: explicit option, then permanentOverlay, then hover. */
function overlayModeOf(options) {
  const overlay = options && options.overlay;
  if (overlay === "never" || overlay === "always" || overlay === "hover") {
    return overlay;
  }
  if (options && options.permanentOverlay === true) return "always";
  return "hover";
}

/** First `count` images, padded with the placeholder. */
function padTo(images, count) {
  const slots = (images || []).slice(0, count);
  while (slots.length < count) {
    slots.push({ src: PLACEHOLDER, alt: "", width: undefined });
  }
  return slots;
}

/** Markup for one image cell, including its overlay description. */
function renderImageCell(image, index, options) {
  const opts = options || {};
  const descriptions = opts.descriptions || [];
  const description = descriptions[index] || image.alt;
  const overlayMode = overlayModeOf(opts);

  const classes = ["image-layouts-image", `image-layouts-image-${index}`];
  if (opts.fit === "contain") classes.push("fit-contain");
  if (opts.fit === "natural") classes.push("fit-natural");

  const maxWidth = cssSize(image.width);
  const style = maxWidth ? ` style="max-width:${escapeHtml(maxWidth)}"` : "";

  const img =
    `<img src="${escapeHtml(image.src)}" alt="${escapeHtml(
      description || `Image ${index + 1}`,
    )}" />`;

  let overlay = "";
  if (description && overlayMode !== "never") {
    overlay =
      `<div class="image-layouts-overlay${
        overlayMode === "always" ? " is-always" : ""
      }"><div class="image-layouts-overlay-inner">${escapeHtml(
        description,
      )}</div></div>`;
  }

  return `<div class="${classes.join(" ")}"${style}>${img}${overlay}</div>`;
}

/** Caption rendered under the whole layout. */
function renderCaption(caption) {
  return caption
    ? `<div class="image-layouts-caption">${escapeHtml(caption)}</div>`
    : "";
}

module.exports = {
  PLACEHOLDER,
  escapeHtml,
  cssSize,
  overlayModeOf,
  padTo,
  renderImageCell,
  renderCaption,
};
