---
name: Update Map Tiles
description: Update the Night City map viewer tiles from the attached influence, socio, and pol ZIP archives.
argument-hint: Use the three map-update ZIPs in Downloads or attach them.
agent: agent
---

Update the existing Night City map viewer tiles using these ZIP archives, or attached replacements when the user provides them:

| Archive | Source |
| --- | --- |
| influence | `C:\Users\AJ\Downloads\map-update-6.10\NC-influence.zip` |
| socio | `C:\Users\AJ\Downloads\map-update-6.10\NC-socio.zip` |
| pol | `C:\Users\AJ\Downloads\map-update-6.10\NC-polmap.zip` |

The destination layers are:

| Archive | Destination |
| --- | --- |
| influence | `src/site/img/map-viewer/tiles-infl/` |
| socio | `src/site/img/map-viewer/tiles-socio/` |
| pol | `src/site/img/map-viewer/tiles-pol/` |

Before changing destination files, inventory all three archives and verify that each is accessible and unambiguously matched to its layer. If an archive is missing, unreadable, or ambiguous, stop before writing anything and ask the user. Check candidate tile basenames for duplicates across nested folders; if a layer has duplicate candidates for a tile, report the conflict and do not write any files. Create one uniquely named temporary staging directory outside the repository, with a subdirectory per layer. Extract only valid grid-tile PNGs into staging; do not extract schema or unrelated entries. Never extract over the repository or the original ZIPs.

Only process PNG tiles named for the map grid: rows `A` through `I` and columns `1` through `16` (for example, `A1.png` and `I16.png`). Match by tile filename, regardless of internal ZIP folder nesting. Ignore all other archive contents. In particular, do not add or replace `map-schema` files, `schema.png`, or other schema images; leave the destination schema images untouched.

Compare each staged tile with its mapped destination once. Check file lengths first, then compare bytes exactly when lengths match. Record each result (added, changed, or identical) so the same tile is not scanned again:

- If the bytes are identical, leave the destination file untouched.
- If the destination tile is missing or its bytes differ, copy that tile to the mapped destination, replacing it only when its contents differ.
- Never delete destination files just because they are absent from an archive. Do not rename tiles, modify the map viewer page, or change unrelated files.
- Do not begin any destination writes until all three archives have passed preflight and all tile comparisons are complete. If a conflict or read error occurs, make no destination changes.

Keep the operation focused. Always remove only the temporary staging directory created for this run, including when processing fails; never remove the source ZIPs. Report per layer aggregate counts of added, changed, and identical tiles, plus skipped out-of-grid/schema entries and missing expected tiles. List filenames only for conflicts or other problems; mention any archive that could not be processed.