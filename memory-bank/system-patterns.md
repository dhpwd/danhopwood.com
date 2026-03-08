# System patterns

## Astro content cache

**Problem:** Deleting blog post markdown files doesn't remove them from the build output. Astro persists content collection data in `node_modules/.astro/data-store.json`, which survives file deletion and `.astro/` cache clearing.

**Solution:** Delete `node_modules/.astro/data-store.json` (and optionally `node_modules/.astro/assets/`) then rebuild.

**When to use:** After deleting or renaming content collection entries when stale routes appear in the build output.
