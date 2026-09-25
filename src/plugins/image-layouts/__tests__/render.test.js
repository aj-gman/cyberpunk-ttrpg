import { describe, it, expect } from "vitest";

const markdownIt = require("markdown-it");

const { parseBlock } = require("../lib/parseBlock");
const { parseImageLine } = require("../lib/images");
const { gridLayout, masonryColumns } = require("../lib/layouts");
const {
  createImageIndex,
  resolveImage,
  resolveImages,
} = require("../lib/resolve");
const { renderLayout } = require("../lib/renderLayout");
const hooks = require("../index");

const img = (src, extra = {}) => ({ src, alt: "", width: undefined, ...extra });

// A grid cell is <div class="image-layouts-image image-layouts-image-N" ...>.
const cellCount = (html) => (html.match(/image-layouts-image-\d/g) || []).length;

describe("parseBlock", () => {
  it("reads the layout and widths from a modern block", () => {
    const block = parseBlock(
      "image-layout",
      "---\nlayout: b\n---\n![[LOC-BANKBLOCK.png|524]]\n![[LOC-BANKBLOCK2.png|531]]\n",
    );

    expect(block.layout).toBe("b");
    expect(block.images).toHaveLength(2);
    expect(block.images[0]).toMatchObject({
      type: "wiki",
      target: "LOC-BANKBLOCK.png",
      width: 524,
    });
    expect(block.images[1].width).toBe(531);
  });

  it("handles CRLF line endings (how the vault stores notes)", () => {
    const block = parseBlock(
      "image-layout",
      "---\r\nlayout: h\r\n---\r\n![[a.png|400]]\r\n![[b.png]]\r\n![[c.png]]\r\n",
    );

    expect(block.layout).toBe("h");
    expect(block.images.map((image) => image.target)).toEqual([
      "a.png",
      "b.png",
      "c.png",
    ]);
  });

  it("reads a legacy image-layout-<name> suffix", () => {
    const block = parseBlock("image-layout-masonry-2", "![[a.png]]\n![[b.png]]");

    expect(block.layout).toBe("masonry-2");
  });

  it("normalizes block options", () => {
    const block = parseBlock(
      "image-layout",
      "---\nlayout: h\ncaption: A day out\ndescriptions:\n  - one\n  - two\noverlay: always\npermanentOverlay: true\nfit: contain\nalign: right\nwidth: 40%\n---\n![[a.png]]\n",
    );

    expect(block.options).toMatchObject({
      caption: "A day out",
      descriptions: ["one", "two"],
      overlay: "always",
      permanentOverlay: true,
      fit: "contain",
      align: "right",
      width: "40%",
    });
  });

  it("leaves the layout empty when none is declared", () => {
    expect(parseBlock("image-layout", "![[a.png]]").layout).toBe("");
  });

  it("keeps the body intact when the front matter is unterminated", () => {
    const block = parseBlock("image-layout", "---\nlayout: b\n![[a.png]]");
    expect(block.layout).toBe("");
    expect(block.images).toHaveLength(1);
  });
});

describe("parseImageLine", () => {
  it("parses wikilinks with a caption", () => {
    expect(parseImageLine("![[img.png|My caption]]")).toMatchObject({
      type: "wiki",
      target: "img.png",
      alt: "My caption",
    });
  });

  it("treats a numeric pipe segment as a max width", () => {
    expect(parseImageLine("![[img.png|300]]")).toMatchObject({ width: 300 });
  });

  it("parses caption and width together", () => {
    expect(parseImageLine("![[img.png|My caption|300]]")).toMatchObject({
      alt: "My caption",
      width: 300,
    });
  });

  it("parses width x height", () => {
    expect(parseImageLine("![[img.png|640x480]]")).toMatchObject({
      width: 640,
      height: 480,
    });
  });

  it("parses path-style vault links", () => {
    expect(
      parseImageLine("![[Pictures/LOC-CORPCENTER1.png|396]]"),
    ).toMatchObject({
      type: "wiki",
      target: "Pictures/LOC-CORPCENTER1.png",
      width: 396,
    });
  });

  it("parses markdown images, remote and local", () => {
    expect(
      parseImageLine("![alt text](https://example.com/a.jpg)"),
    ).toMatchObject({ type: "external", target: "https://example.com/a.jpg" });
    expect(parseImageLine("![cap|200](/img/user/Pictures/a.png)")).toMatchObject({
      type: "internal",
      target: "/img/user/Pictures/a.png",
      alt: "cap",
      width: 200,
    });
  });

  it("ignores non-image lines", () => {
    expect(parseImageLine("just some text")).toBeNull();
    expect(parseImageLine("")).toBeNull();
  });
});

describe("layout definitions", () => {
  it("knows the grid layouts and their image counts", () => {
    expect(gridLayout("b")).toMatchObject({ images: 2, columns: "2fr 1fr" });
    expect(gridLayout("d")).toMatchObject({ images: 3 });
    expect(gridLayout("i")).toMatchObject({ images: 4 });
    expect(gridLayout("single")).toMatchObject({ images: 1 });
  });

  it("rejects unknown grids", () => {
    expect(gridLayout("z")).toBeNull();
    expect(gridLayout("carousel")).toBeNull();
  });

  it("knows masonry column counts (2-6 only)", () => {
    expect(masonryColumns("masonry-2")).toBe(2);
    expect(masonryColumns("masonry-6")).toBe(6);
    expect(masonryColumns("masonry-7")).toBeNull();
    expect(masonryColumns("b")).toBeNull();
  });
});

describe("image resolution", () => {
  it("matches shortest-path wikilinks, case-insensitively", () => {
    const index = createImageIndex([
      "Pictures/LOC-A.png",
      "deep/folder/LOC-A.png",
    ]);

    expect(index.resolve("LOC-A.png")).toBe("Pictures/LOC-A.png");
    expect(index.resolve("loc-a.png")).toBe("Pictures/LOC-A.png");
    expect(index.resolve("deep/folder/LOC-A.png")).toBe("deep/folder/LOC-A.png");
    expect(index.resolve("missing.png")).toBeNull();
  });

  it("builds /img/user URLs and passes through external/absolute srcs", () => {
    const index = createImageIndex(["Pictures/LOC-A.png"]);

    expect(
      resolveImage({ target: "LOC-A.png", width: 300 }, { index }),
    ).toMatchObject({ src: "/img/user/Pictures/LOC-A.png", width: 300 });
    expect(resolveImage({ target: "https://x/y.jpg" }, { index }).src).toBe(
      "https://x/y.jpg",
    );
    expect(resolveImage({ target: "/img/user/absolute.png" }, { index }).src).toBe(
      "/img/user/absolute.png",
    );
  });

  it("falls back to the vault attachment folder when not indexed", () => {
    const index = createImageIndex([]);
    expect(resolveImage({ target: "missing.png" }, { index }).src).toBe(
      "/img/user/Pictures/missing.png",
    );
    expect(resolveImages([{ target: "a.png" }], { index })).toHaveLength(1);
  });
});

describe("renderLayout", () => {
  it("renders a grid layout with one cell per image", () => {
    const html = renderLayout(
      { layout: "b", options: {} },
      [img("/img/user/A.png", { width: 524 }), img("/img/user/B.png")],
    );

    expect(html).toContain("image-layouts-grid image-layouts-layout-b");
    expect(html).toContain("image-layouts-align align-full");
    expect(html).toContain(
      'class="image-layouts-image image-layouts-image-0" style="max-width:524px"',
    );
    expect(html).toContain('src="/img/user/A.png"');
    expect(cellCount(html)).toBe(2);
  });

  it("pads missing slots with the placeholder", () => {
    const html = renderLayout({ layout: "d", options: {} }, [img("/a.png")]);

    expect(cellCount(html)).toBe(3);
    expect(html).toContain("data:image/svg+xml");
  });

  it("ignores extra images", () => {
    const html = renderLayout(
      { layout: "b", options: {} },
      [img("/a.png"), img("/b.png"), img("/c.png")],
    );

    expect(cellCount(html)).toBe(2);
    expect(html).not.toContain('src="/c.png"');
  });

  it("distributes masonry images round-robin across columns", () => {
    const html = renderLayout(
      { layout: "masonry-2", options: {} },
      [img("/1"), img("/2"), img("/3"), img("/4")],
    );

    expect(html).toContain("image-layouts-masonry-grid-2");
    const columns = [
      ...html.matchAll(/image-layouts-masonry-column">([\s\S]*?)<\/div><\/div>/g),
    ].map((match) => match[1]);

    expect(columns).toHaveLength(2);
    expect(columns[0]).toContain('src="/1"');
    expect(columns[0]).toContain('src="/3"');
    expect(columns[1]).toContain('src="/2"');
    expect(columns[1]).toContain('src="/4"');
  });

  it("returns null for layouts the MVP does not support", () => {
    expect(renderLayout({ layout: "carousel", options: {} }, [])).toBeNull();
    expect(renderLayout({ layout: "custom", options: {} }, [])).toBeNull();
    expect(renderLayout({ layout: "", options: {} }, [])).toBeNull();
  });

  it("honours align/width and renders the caption", () => {
    const html = renderLayout(
      {
        layout: "single",
        options: { align: "right", width: "40%", caption: "Hi" },
      },
      [img("/a.png")],
    );

    expect(html).toContain("image-layouts-align align-right");
    expect(html).toContain('style="width:40%;max-width:40%"');
    expect(html).toContain('<div class="image-layouts-caption">Hi</div>');
  });

  it("renders overlays according to the overlay mode", () => {
    const always = renderLayout(
      { layout: "single", options: { descriptions: ["hello"], overlay: "always" } },
      [img("/a.png")],
    );
    expect(always).toContain("image-layouts-overlay is-always");

    const never = renderLayout(
      { layout: "single", options: { descriptions: ["hello"], overlay: "never" } },
      [img("/a.png")],
    );
    expect(never).not.toContain("image-layouts-overlay");

    const hover = renderLayout(
      { layout: "single", options: { descriptions: ["hello"] } },
      [img("/a.png")],
    );
    expect(hover).toContain("image-layouts-overlay");
  });

  it("turns permanentOverlay into an always-on overlay", () => {
    const html = renderLayout(
      { layout: "single", options: { permanentOverlay: true, descriptions: ["x"] } },
      [img("/a.png")],
    );
    expect(html).toContain("image-layouts-overlay is-always");
  });

  it("escapes HTML in alt text and captions", () => {
    const html = renderLayout(
      { layout: "single", options: { caption: 'A <b>"quote"' } },
      [img("/a.png", { alt: 'x"y<z>' })],
    );

    expect(html).toContain('alt="x&quot;y&lt;z&gt;"');
    expect(html).toContain("A &lt;b&gt;&quot;quote&quot;");
  });
});

describe("fence hook integration", () => {
  const md = markdownIt({ html: true }).use((instance) => hooks.setupMarkdown(instance));

  it("replaces an image-layout block with a grid", () => {
    const html = md.render(
      "```image-layout\n---\nlayout: b\n---\n![[LOC-BANKBLOCK.png|524]]\n![[LOC-BANKBLOCK2.png|531]]\n```\n",
    );

    expect(html).toContain("image-layouts-grid image-layouts-layout-b");
    expect(html).toContain("/img/user/");
    expect(cellCount(html)).toBe(2);
    expect(html).not.toContain("language-image-layout");
  });

  it("supports the legacy image-layout-<name> fence", () => {
    const html = md.render(
      "```image-layout-h\n![[a.png]]\n![[b.png]]\n![[c.png]]\n```\n",
    );
    expect(html).toContain("image-layouts-layout-h");
  });

  it("leaves unsupported layouts as a code block instead of failing", () => {
    const html = md.render(
      "```image-layout\n---\nlayout: carousel\n---\n![[a.png]]\n```\n",
    );
    expect(html).toContain("language-image-layout");
  });

  it("does not touch other fenced blocks", () => {
    expect(md.render("```js\nconst a = 1;\n```\n")).toContain("language-js");
    expect(md.render("```image-layouts\nx\n```\n")).toContain(
      "language-image-layouts",
    );
    // A bare markdown-it has no mermaid rule (that lives in .eleventy.js);
    // what matters here is that the plugin leaves the block alone.
    const mermaid = md.render("```mermaid\ngraph TD;\n```\n");
    expect(mermaid).toContain("language-mermaid");
    expect(mermaid).not.toContain("image-layouts-grid");
  });
});
