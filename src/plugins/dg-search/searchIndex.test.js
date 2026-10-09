import { describe, expect, it } from "vitest";
import searchIndex from "./searchIndex.js";

const { extractSearchHeadings } = searchIndex;

describe("extractSearchHeadings", () => {
	it("preserves rendered heading IDs and levels", () => {
		const headings = extractSearchHeadings(
			'<h2 id="upper-eastside">Upper <em>Eastside</em></h2><h3 id="nightlife">Nightlife</h3>',
		);

		expect(headings).toEqual([
			{ id: "upper-eastside", title: "Upper Eastside", level: 2 },
			{ id: "nightlife", title: "Nightlife", level: 3 },
		]);
	});

	it("keeps duplicate-heading suffixes from the rendered page", () => {
		const headings = extractSearchHeadings(
			'<h2 id="bars">Bars</h2><h2 id="bars-1">Bars</h2>',
		);

		expect(headings.map(({ id }) => id)).toEqual(["bars", "bars-1"]);
	});

	it("omits headings without a usable ID or title", () => {
		const headings = extractSearchHeadings(
			'<h2 id="">No ID</h2><h3 id="empty"></h3><p>Not a heading</p>',
		);

		expect(headings).toEqual([]);
	});

	it("returns an empty list for missing HTML", () => {
		expect(extractSearchHeadings(null)).toEqual([]);
	});
});