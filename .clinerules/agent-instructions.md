# Cline Rules — Digital Garden (Eleventy + Vercel)

## Project context
- Static digital garden built with Eleventy (11ty) from Obsidian-exported markdown notes.
- Deployed via Vercel (git-integration auto-deploy on push to main).
- Input/content directory: /src
- Build output directory: /_site (do not read or edit — it's generated)
- Do not re-explain this structure in responses unless it has changed.

## Context scope
- Never read _site/, node_modules/, or .vercel/ — these are generated/dependency folders.
- Never scan the full /src directory unless the task explicitly requires it (e.g. bulk find/replace across notes, site-wide tag audit). For single-note edits, only open the specific file mentioned.
- Skip package-lock.json / pnpm-lock.yaml / yarn.lock unless debugging a dependency issue.
- Don't re-read .eleventy.js or eleventy.config.js on every task — only when the task involves build config, collections, filters, or shortcodes.

## Build & terminal output
- Use quiet/minimal flags when running builds (e.g. `npx @11ty/eleventy --quiet` if available, or pipe through `tail -n 30`).
- Don't paste full build logs — summarize only errors/warnings that block the build.
- On build failure, extract just the relevant error (file + line + message), not the full stack trace.

## Workflow
- Use Plan Mode first for anything touching more than one file, .eleventy.js, or vercel.json. Move to Act Mode only after the plan is confirmed.
- After editing a markdown note, don't re-summarize its full content back — just confirm what changed.
- For CSS/layout changes, prefer editing existing partials/includes over creating new ones, to avoid re-reading the whole stylesheet or layout tree each time.

## Deployment
- Never run `vercel deploy` or trigger production deploys directly — this repo deploys automatically on push to main via Vercel's git integration.
- Treat vercel.json as authoritative for redirects/headers/build settings — patch the relevant key only, don't regenerate the file from scratch.

## Style
- Keep commit messages and change summaries short (one line, imperative mood).
- Don't restate the request before doing it — just do the task and report the diff/result.
