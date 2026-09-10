const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const matterOptions = require("./matterOptions");

const HOME_TAG = "gardenEntry";
const HOME_PROP = "dg-home";

/**
 * Whether a note's frontmatter marks it as the garden's home page.
 */
function frontmatterIsHomePage(data) {
  const tags = data && data.tags;
  if (Array.isArray(tags)) {
    if (tags.includes(HOME_TAG)) return true;
  }
  if (typeof tags === "string") {
    if (tags.split(/[,\s]+/).includes(HOME_TAG)) return true;
  }
  if (data && data[HOME_PROP] === true) return true;
  return false;
}

function fileIsHomePage(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    return false;
  }
  if (path.basename(filePath) === "Homepage.md") {
    return true;
  }
  if (!raw.includes(HOME_TAG) && !raw.includes('"dg-home"')) {
    return false;
  }
  try {
    return frontmatterIsHomePage(matter(raw, matterOptions).data);
  } catch {
    return true;
  }
}

function* walkMarkdownFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkMarkdownFiles(full);
    } else if (/\.(md|markdown)$/i.test(entry.name)) {
      yield full;
    }
  }
}

function hasHomePageNote(notesDir) {
  for (const file of walkMarkdownFiles(notesDir)) {
    if (fileIsHomePage(file)) {
      return true;
    }
  }
  return false;
}

module.exports = { hasHomePageNote, frontmatterIsHomePage, HOME_TAG };