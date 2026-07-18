# System patterns

## Astro content cache

**Problem:** Deleting blog post markdown files doesn't remove them from the build output. Astro persists content collection data in `node_modules/.astro/data-store.json`, which survives file deletion and `.astro/` cache clearing.

**Solution:** Delete `node_modules/.astro/data-store.json` (and optionally `node_modules/.astro/assets/`) then rebuild.

**When to use:** After deleting or renaming content collection entries when stale routes appear in the build output.

## View Transitions and script re-execution

**Problem:** Astro bundled module scripts (`<script>` in .astro components) only execute once. With View Transitions (`<ClientRouter />`), navigating between pages swaps the DOM but doesn't re-run module scripts – event listeners aren't reattached to new DOM nodes.

**Solution:** Wrap listener attachment in `document.addEventListener("astro:page-load", initFn)`. The module script registers the listener once; the event fires on every navigation (including initial load). Use a `data-initialized` guard on elements to prevent double-attaching if the same DOM node persists.

**Anti-pattern:** Using `is:inline data-astro-rerun` – loses TypeScript, import resolution, and deduplication. Only use for pre-paint state (e.g. dark mode via `astro:after-swap`).

**When to use:** Any component with client-side event listeners that appears on pages using View Transitions. Known gap: `ShareLinks.astro` Plausible click tracking doesn't use this pattern yet.

## Satori OG templates

Three constraints bite when editing `src/utils/og-templates/`. All three fail quietly – the build succeeds and the image is wrong.

**Satori resolves no CSS custom properties.** The theme tokens in `global.css` are invisible to it, so the palette is mirrored as literals in `og-templates/shared.js`. Changing `--accent` (or any mirrored token) means editing that file too. `shared.js` names each entry after the token it mirrors and flags the deliberate deviations – `--muted` and `--border` are too faint to survive a feed thumbnail, so the dot grid and dashed rule use darker greys.

**The font subset must contain every glyph you render, including ones you never wrote.** Fonts load from the Google Fonts API with `&text=`, which returns only the requested characters. Satori appends U+2026 when `lineClamp` truncates, so an ellipsis absent from the subset renders as a missing-glyph box. `CHROME_GLYPHS` in `shared.js` carries the ellipsis and the other fixed characters – concatenate it into every `loadGoogleFonts` call.

**Resolve asset paths from `process.cwd()`, not `import.meta.url`.** Astro bundles these templates into `dist/chunks/` at build time, so a module-relative path lands outside the project and throws ENOENT. Standalone scripts run directly by node (`scripts/generate-static-og.mjs`) are the opposite case and correctly use `import.meta.url`.

**Post descriptions have a 200-character budget** – the card's three-line limit, enforced by `.max(200)` in the content schema so a gross overrun fails the build instead of truncating the card. The cap is approximate: packing depends on where words wrap, so a description in the 190s can still truncate. Above ~185, check the rendered card.

**When to use:** any edit to the OG templates, the palette, or the text they render.

## Public memory bank

This repo is public (required for "Edit on GitHub" links), so the memory bank is committed and world-readable – eating our own dog food.

**Content rules – what may go in memory-bank files:**

- No marketing strategy, positioning details or competitive context
- Keep only what's pertinent to building the website

Business and strategy context lives outside this repo.
