const { parse } = require("node-html-parser");

const headingSelector = "h1, h2, h3, h4, h5, h6";

function extractSearchHeadings(renderedHtml) {
	if (typeof renderedHtml !== "string" || renderedHtml.length === 0) {
		return [];
	}

	return parse(renderedHtml)
		.querySelectorAll(headingSelector)
		.flatMap((heading) => {
			const id = heading.getAttribute("id");
			const title = heading.textContent.replace(/\s+/g, " ").trim();
			const level = Number(heading.tagName.slice(1));

			if (!id || !title || !Number.isInteger(level)) {
				return [];
			}

			return [{ id, title, level }];
		});
}

module.exports = { extractSearchHeadings };