/**
 * Image Layouts — garden plugin hooks.
 *
 * Registers a markdown-it fence renderer for Obsidian image-layout blocks.
 * Both syntaxes the Obsidian plugin writes are supported:
 *
 *   ```image-layout          ```image-layout-b
 *   ---                      ![[image.png|400]]
 *   layout: b
 *   ---
 *   ![[image.png|400]]
 *   ```
 *
 * The block is turned into a CSS grid (or masonry) of <img> tags, which the
 * garden's obsidian-html transform then optimizes like any other image.
 * Anything unsupported, or any internal error, degrades to the original code
 * block so a bad note can never fail the build.
 */
const { parseBlock } = require("./lib/parseBlock");
const { resolveImages, resetImageIndex } = require("./lib/resolve");
const { renderLayout } = require("./lib/renderLayout");

// "image-layout", "image-layout-b", "image-layout-masonry-2", ... but not
// "image-layouts" or any other fence info.
const BLOCK_INFO = /^image-layout(?:-([a-z0-9-]+))?$/i;

function fallbackCodeBlock(md, token) {
  return `<pre><code class="language-image-layout">${md.utils.escapeHtml(
    token.content,
  )}</code></pre>`;
}

module.exports = {
  setupMarkdown(md) {
    const origFence =
      md.renderer.rules.fence ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options, env, self);
      };

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if (!BLOCK_INFO.test((token.info || "").trim())) {
        return origFence(tokens, idx, options, env, self);
      }

      try {
        const block = parseBlock(token.info, token.content);
        if (!block.layout) {
          throw new Error("block has no \"layout\"");
        }
        const html = renderLayout(block, resolveImages(block.images));
        if (html === null) {
          throw new Error(`unsupported layout "${block.layout}"`);
        }
        return html;
      } catch (error) {
        console.warn(`[image-layouts] ${error.message}; leaving block as code`);
        return fallbackCodeBlock(md, token);
      }
    };
  },

  setupEleventy(eleventyConfig) {
    // Rebuild the image index each build so images uploaded after the dev
    // server started (e.g. a re-run publish) resolve without a restart.
    eleventyConfig.on("eleventy.before", () => resetImageIndex());
  },
};
