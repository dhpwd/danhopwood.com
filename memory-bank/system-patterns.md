# System patterns

## Astro content cache

**Problem:** Deleting blog post markdown files doesn't remove them from the build output. Astro persists content collection data in `node_modules/.astro/data-store.json`, which survives file deletion and `.astro/` cache clearing.

**Solution:** Delete `node_modules/.astro/data-store.json` (and optionally `node_modules/.astro/assets/`) then rebuild.

**When to use:** After deleting or renaming content collection entries when stale routes appear in the build output.

## View Transitions and script re-execution

**Problem:** Astro bundled module scripts (`<script>` in .astro components) only execute once. With View Transitions (`<ClientRouter />`), navigating between pages swaps the DOM but doesn't re-run module scripts — event listeners aren't reattached to new DOM nodes.

**Solution:** Wrap listener attachment in `document.addEventListener("astro:page-load", initFn)`. The module script registers the listener once; the event fires on every navigation (including initial load). Use a `data-initialized` guard on elements to prevent double-attaching if the same DOM node persists.

**Anti-pattern:** Using `is:inline data-astro-rerun` — loses TypeScript, import resolution, and deduplication. Only use for pre-paint state (e.g. dark mode via `astro:after-swap`).

**When to use:** Any component with client-side event listeners that appears on pages using View Transitions. Known gap: `ShareLinks.astro` Plausible click tracking doesn't use this pattern yet.
