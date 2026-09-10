const START_RE = /^\s*---\s+start-multi-column(?:\s*:\s*([^\s]+))?\s*$/;
const END_RE = /^\s*---\s+end-multi-column\s*$/;
const COLUMN_END_RE = /^\s*---\s+end-column\s*$/;

function parseSettings(lines) {
  const settings = {};
  for (const line of lines) {
    const match = line.match(/^\s*([^:]+):\s*(.*?)\s*$/);
    if (match) settings[match[1].trim().toLowerCase()] = match[2];
  }
  return settings;
}

function sourceLine(state, line) {
  return state.src.slice(state.bMarks[line], state.eMarks[line]);
}

function readColumnSettings(lines, start) {
  if (lines[start] && lines[start].trim() === "```column-settings") {
    const end = lines.indexOf("```", start + 1);
    if (end !== -1) {
      return {
        end: end + 1,
        settings: parseSettings(lines.slice(start + 1, end)),
      };
    }
  }
  return { end: start, settings: {} };
}

function multiColumnMarkdown(md) {
  md.block.ruler.before("fence", "multi_column", (state, startLine, endLine, silent) => {
    const start = sourceLine(state, startLine).trim();
    const startMatch = start.match(START_RE);
    if (!startMatch) return false;

    let line = startLine + 1;
    const lines = [];
    let endLineNumber = -1;
    while (line < endLine) {
      const current = sourceLine(state, line).trim();
      if (END_RE.test(current)) {
        endLineNumber = line;
        break;
      }
      lines.push(sourceLine(state, line));
      line += 1;
    }

    if (endLineNumber === -1) return false;
    if (silent) return true;

    const settingsResult = readColumnSettings(lines, 0);
    const content = lines.slice(settingsResult.end).join("\n");
    const columns = content
      .split(/\s*---\s+end-column\s+---\s*/)
      .map((column) => column.replace(/^\n+|\n+$/g, ""));

    const token = state.push("multi_column", "", 0);
    token.block = true;
    token.map = [startLine, endLineNumber + 1];
    token.meta = {
      name: startMatch[1] || "",
      columns,
      settings: settingsResult.settings,
    };
    state.line = endLineNumber + 1;
    return true;
  });

  md.renderer.rules.multi_column = (tokens, index) => {
    const { name, columns, settings } = tokens[index].meta;
    const count = Number.parseInt(settings["number of columns"], 10) || columns.length;
    const border = settings.border && settings.border.toLowerCase() === "off" ? " no-border" : "";
    const nameClass = name ? ` multi-column-${name.replace(/[^a-z0-9_-]/gi, "-")}` : "";
    const renderedColumns = columns
      .map((column) => `<div class="multi-column__column">${md.render(column)}</div>`)
      .join("\n");
    return `<div class="multi-column${nameClass}${border}" style="--multi-column-count: ${count}">${renderedColumns}</div>\n`;
  };
}

module.exports = multiColumnMarkdown;