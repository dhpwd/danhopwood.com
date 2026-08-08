# Astro build and client scripts

## Stale content after deleting a post

**Problem:** deleting a blog markdown file doesn't remove its route from the build output. Astro persists content collection data in `node_modules/.astro/data-store.json`, which survives both the file deletion and clearing `.astro/`.

**Solution:** delete `node_modules/.astro/data-store.json` (and `node_modules/.astro/assets/` if images are stale too), then rebuild.

**When to use:** after deleting or renaming a content collection entry, when a route you removed still appears in `dist/`.

## Client scripts and View Transitions

**Problem:** Astro bundles `<script>` blocks in `.astro` components as module scripts, which run once per full page load. With View Transitions (`<ClientRouter />` in `Layout.astro`), navigating swaps the DOM without re-running them, so listeners are never attached to the new nodes. The page looks correct and the handler never fires again.

**Solution:** attach listeners inside `document.addEventListener("astro:page-load", init)`. The module script registers that listener once and the event fires on every navigation, including the first load. Guard elements with a `data-initialized` attribute so a node that survives the swap isn't bound twice. `NewsletterSignup.astro` is the worked example.

**Anti-pattern:** `is:inline data-astro-rerun`. It does re-run the script, at the cost of TypeScript, import resolution and deduplication. Reserve inline scripts for pre-paint state, like the theme flash guard in `Layout.astro`.

**When to use:** any component that attaches client-side event listeners.

## Module paths in bundled code vs standalone scripts

**Problem:** Astro bundles `src/utils/` modules into `dist/chunks/` at build time, so a path resolved from `import.meta.url` lands outside the project and throws ENOENT in the production build while working in dev.

**Solution:** resolve project asset paths from `process.cwd()` in anything Astro bundles – see `og-templates/shared.js` loading the avatar. Standalone scripts run directly by node, such as `scripts/generate-favicons.mjs`, are the opposite case and correctly use `import.meta.url`.

**When to use:** reading a file from disk in build-time code.
