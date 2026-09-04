const fs = require("fs");
const path = require("path");

module.exports = () => {
  const chroniclePath = path.join(__dirname, "../notes/z-SITE/Site Chronicle.md");
  const raw = fs.readFileSync(chroniclePath, "utf8");
  const match = raw.match(/^####\s+(.+?)\s*$\n([\s\S]+?)(?=\n####\s|\n###\s|(?![\s\S]))/m);

  if (!match) return null;

  return {
    day: match[1].trim(),
    body: match[2].trim(),
  };
};