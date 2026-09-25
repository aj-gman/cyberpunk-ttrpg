# Image Layouts

Renders Obsidian [image-layouts](https://github.com/vertis/obsidian-image-layouts)
code blocks as CSS image grids, so image-heavy notes (e.g. Night City districts)
display their image blocks instead of a raw fenced code block.

## Supported syntax

Both forms the Obsidian plugin writes:

````markdown
```image-layout
---
layout: b
---
![[LOC-BANKBLOCK.png|524]]
![[LOC-BANKBLOCK2.png|531]]
```
````

````markdown
```image-layout-masonry-2
![[a.png]]
![[b.png]]
![[c.png]]
![[d.png]]
```
````

Image lines accept the Obsidian pipe syntax: `![[img.png]]`, `![[img.png|300]]`
(max width), `![[img.png|Caption|300]]`, `![[Folder/img.png|396]]`, plus
markdown images `![caption](url)` including remote URLs.

## Layouts

| Kind | Names |
|---|---|
| Grid | `a`–`i`, `single` |
| Masonry | `masonry-2` … `masonry-6` |

Blocks whose layout is not in this list (e.g. `carousel`, `custom`) are left
as a code block and logged as `[image-layouts] unsupported layout …` — the
build never fails.

Block options supported: `caption`, `descriptions`, `overlay`
(`never`/`hover`/`always`), `permanentOverlay`, `fit` (`cover`/`contain`/`natural`),
`align` (`left`/`center`/`right`/`full`), `width`.

## How images are found

Published images live under `src/site/img/user` (where the Obsidian Digital
Garden plugin uploads them). Names are resolved like Obsidian's shortest-path
wikilinks: case-insensitive, matching a full relative path or any trailing
segment, shortest path first. Unresolved names fall back to
`/img/user/Pictures/<name>` and log nothing (the file may simply not be
uploaded yet).

Rendered `<img>` tags go through the garden's normal `obsidian-html` transform,
so they get the same responsive WebP/JPEG `<picture>` output as any other image.

## Styling

Set `--dg-image-layouts-gap` from `custom-style.css` to change the spacing
between images (default `0.5rem`).

## Disabling

`src/plugins/plugins.json`:

```json
{ "plugins": { "image-layouts": { "enabled": false } } }
```
