# Open Graph image templates

Share cards are generated at build time by satori from `src/utils/og-templates/`: `site.js` for `/og.png`, `post.js` for each post's `index.png`, shared constants in `shared.js`. Every card is 1200x630, matching the dimensions `Layout.astro` declares.

Five constraints bite when editing them. None of them fails the build – you get a wrong image.

**Satori resolves no CSS custom properties.** The theme tokens in `global.css` are invisible to it, so the palette is mirrored as literals in `shared.js`. Changing `--accent`, or any other mirrored token, means editing that file too – `docs/patterns/design-system.md` lists every mirror. `shared.js` names each entry after the token it mirrors and flags the deliberate deviations: `--muted` and `--border` are too faint to survive a feed thumbnail, so the dot grid and the dashed rule use darker greys.

**The font subset must contain every glyph you render, including ones you never wrote.** Fonts load from the Google Fonts API with `&text=`, which returns only the requested characters. Satori appends U+2026 when `lineClamp` truncates, so an ellipsis missing from the subset renders as a missing-glyph box. `CHROME_GLYPHS` in `shared.js` carries the ellipsis and the other fixed characters – concatenate it into every `loadGoogleFonts` call.

**Every (fontFamily, fontWeight) pair a template sets must be loaded in `loadGoogleFont.ts`.** Satori matches loaded fonts by family name and weight, and a pair that isn't loaded falls back to whatever is, without warning. Currently loaded: Geist 400, Geist Mono 400 and Geist Mono 700. Adding a weight or a family to a template means adding it to `fontsConfig`.

**The gap above the post card's footer rule is reserved, not emergent.** The title and description block is centred in a `flexGrow` container, so without the wrapper's `paddingBottom: 40px` the space above the dashed rule is leftover flex space – it collapses towards zero as title and description approach their line limits. The padding looks redundant on short posts. Don't remove it.

**Post descriptions have a 200-character budget.** That's the card's three-line limit, enforced by `.max(200)` in `src/content.config.ts` so a gross overrun fails the build instead of truncating the card. The cap is approximate: packing depends on where words wrap, so a description in the 190s can still truncate. Above about 185, check the rendered card.

Asset paths inside these templates resolve from `process.cwd()` – see `docs/patterns/astro-build.md`.

**When to use:** any edit to the templates, the palette, or the text they render.
