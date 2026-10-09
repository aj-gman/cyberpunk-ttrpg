---
name: Update Map Tiles
description: Update the Night City map viewer tiles from the attached influence, socio, and pol ZIP archives.
argument-hint: Attach the influence, socio, and pol ZIP archives.
agent: agent
---

Update the existing Night City map viewer tiles using the ZIP archives attached to this chat. The three expected layers are:

| Archive | Destination |
| --- | --- |
| influence | `src/site/img/map-viewer/tiles-infl/` |
| socio | `src/site/img/map-viewer/tiles-socio/` |
| pol | `src/site/img/map-viewer/tiles-pol/` |

First confirm that all three archives are accessible and that each archive can be unambiguously matched to its layer. Inspect archive contents before making changes; account for files nested under folders inside a ZIP. If an archive is missing, unreadable, or cannot be confidently identified, stop before writing anything and ask the user for clarification.

Only process PNG tiles named for the map grid: rows `A` through `I` and columns `1` through `16` (for example, `A1.png` and `I16.png`). Match by tile filename, regardless of internal ZIP folder nesting. Ignore all other archive contents. In particular, do not add or replace `map-schema` files, `schema.png`, or other schema images; leave the destination schema images untouched.

For each matching tile, compare the archive file's bytes with the destination file:

- If the bytes are identical, leave the destination file untouched.
- If the destination tile is missing or its bytes differ, copy that tile to the mapped destination, replacing it only when its contents differ.
- Never delete destination files just because they are absent from an archive. Do not rename tiles, modify the map viewer page, or change unrelated files.
- If an archive contains multiple candidates for the same tile with different contents, do not choose one; leave that tile unchanged and report the ambiguity.

Keep the operation focused and avoid extracting unrelated archive contents into the repository. When finished, report per layer the number of tiles added, changed, and left untouched as identical, plus any skipped out-of-grid/schema files, missing expected tiles, or ambiguities. Mention any archive that could not be processed.