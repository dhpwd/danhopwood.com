# Images and static assets

**Problem:** two directories serve images and the wrong choice costs either build-time optimisation or a stable URL.

**Solution:**

- `src/assets/images/` – Astro optimises these at build time: WebP conversion, cache-busting filenames, dimensions that prevent layout shift. Import the file and render it with `<Image />` from `astro:assets`. Post images and the avatar live here
- `public/` – served byte-for-byte with no processing. Use it only for assets referenced by a URL string that has to stay stable: `favicon.png`, `apple-touch-icon.png`, and the Pagefind index the build copies in

**Favicons are generated, not drawn.** `pnpm generate:favicons` renders the "dh" monogram in Geist Mono on the teal accent, hand-mirroring the light-mode `--accent` and `--background` values because satori resolves no CSS custom properties. Changing either token means editing the script and regenerating – see `docs/patterns/design-system.md`.

**When to use:** adding or replacing any image or icon.
