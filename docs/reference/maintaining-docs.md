# Maintaining these docs

The portal is an isolated HonKit application under `docs/`. Content is ordinary Markdown; navigation order is `SUMMARY.md`; site metadata and plugins are in `book.json`; custom presentation is under `assets/` and `plugins/gitbook-plugin-bm-theme/`.

The repository root exposes `npm run docs:serve`, `npm run docs:build`, `npm run docs:clean`, and `npm run docs:validate`. The last command builds the static site and verifies SUMMARY sources, generated metadata, internal links, search index presence, and the custom 404 page. HonKit itself is documented in the [HonKit repository](https://github.com/honkit/honkit).

## Add a page

1. Create a focused Markdown file in the appropriate section.
2. Add it to `SUMMARY.md` at the desired nesting level.
3. Link to real implementation paths and related pages.
4. Add Mermaid only when it clarifies a real relationship or workflow.
5. Run `npm run build` from `docs/` and resolve warnings/broken links.

Use fenced `mermaid` blocks for diagrams and normal language fences for code. GitBook-style hint blocks use `{% hint style="info|warning|danger|success" %}`. Cards can use the `doc-cards` and `doc-card` HTML classes. Native `<details><summary>…</summary>…</details>` provides expandable sections.

The portal adds theme persistence, system theme, `Ctrl/Cmd+K` search focus, code-language labels, copy buttons, heading links, page breadcrumbs, an on-page table of contents, and mobile navigation without changing generated HonKit core files.

## Publishing and print

Publish the generated `docs/_book/` directory as a static site. The build includes a root `404.html` for hosts that use conventional static error pages. Configure the host to route missing paths to that file if it does not do so automatically.

Print styles remove interactive navigation, expand the article to page width, keep tables and diagrams together where practical, and expose external-link destinations. Use the browser print preview to verify a particularly long page before distributing it as PDF.
