# Open Graph image templates

Share cards are generated at build time by satori from `src/utils/og-templates/`: `site.js` for `/og.png`, `post.js` for each post's `index.png`, shared constants in `shared.js`. Every card is 1200x630, matching the dimensions `Layout.astro` declares.

Eight constraints bite when editing them. None of them fails the build – you get a wrong image.

**Satori resolves no CSS custom properties.** The theme tokens in `global.css` are invisible to it, so the palette is mirrored as literals in `shared.js`. Changing `--accent`, or any other mirrored token, means editing that file too – `docs/patterns/design-system.md` lists every mirror. `shared.js` names each entry after the token it mirrors and flags the deliberate deviations: `--muted` and `--border` are too faint to survive a feed thumbnail, so the dot grid and the dashed rule use darker greys. Each diagram source in `scripts/diagrams/` copies `rule` as `--line`, so changing it means re-rendering them – see "Diagrams" in `docs/patterns/images.md`.

**Satori is pinned exactly, at 0.33 or later.** `package.json` names one version with no range, so a release can't change the cards without a PR. Below 0.33, satori places each word at the sum of its glyphs' unkerned advances and then draws it kerned, so the gap after a word grows by that word's own kerning, and Geist kerns heavily. An upgrade re-renders every card, so compare a build from before it with one from after: the line breaks, the footer's position, the accent bar, the round avatar on `/og.png` and the longest description (running-coding-agents-on-a-30-euro-linux-box, 197 characters) still on three lines.

**Fonts load whole, once per build.** `loadGoogleFonts()` in `src/utils/loadGoogleFont.ts` downloads each font in `fontsConfig` as a full TTF on its first call and holds the result in a module-level promise that every card reuses, so a build makes one CSS request and one download per font. A failed load clears the promise, so the next call retries instead of `pnpm dev` replaying the failure until it restarts. Satori draws text as SVG paths, so a card carries only the glyphs it draws, whole fonts or not. Don't go back to a per-card subset (`&text=` with the card's text, plus a hand-kept `CHROME_GLYPHS` string for the fixed characters and the U+2026 that `lineClamp` appends): it cost four requests per card, and a glyph left off the list rendered as a missing-glyph box.

**Every (fontFamily, fontWeight) pair a template sets must be loaded in `loadGoogleFont.ts`.** Satori matches loaded fonts by family name and weight, and a pair that isn't loaded falls back to whatever is, without warning. Currently loaded: Geist 400, Geist 600, Geist Mono 400 and Geist Mono 700. Adding a weight or a family to a template means adding it to `fontsConfig`.

**A fixed-size element in a flex container needs `flexShrink: 0`.** Satori shrinks flex items below their set size as a browser does, without warning. Without it, the site card's 280px avatar squashes into an oval, and the 12px accent bar collapses to nothing when a card's text fills the column. `accentBar()` in `shared.js` and both avatars set it, and a new fixed-size element sets it too.

**`textWrap: "balance"` and `lineClamp` don't mix.** Satori balances by narrowing the text box until the text grows taller, down to half the width. `lineClamp` stops the height growing at the limit, so a title that reaches the limit is squeezed to half the card and truncated. The post card's title caps its height with `maxHeight` and `overflow: hidden` instead, which crops a fourth line without an ellipsis. The description isn't balanced, so it keeps `lineClamp`.

**The gap above the post card's footer rule is reserved, not emergent.** The title and description block is centred in a `flexGrow` container, so without the wrapper's `paddingBottom: 40px` the space above the dashed rule is leftover flex space – it collapses towards zero as title and description approach their line limits. The padding looks redundant on short posts. Don't remove it.

**Post descriptions have a 200-character budget.** That's the card's three-line limit, enforced by `.max(200)` in `src/content.config.ts` so a gross overrun fails the build instead of truncating the card. The cap is approximate: packing depends on where words wrap, so a description in the 190s can still truncate. Above about 185, check the rendered card.

Asset paths inside these templates resolve from `process.cwd()` – see `docs/patterns/astro-build.md`.

**When to use:** any edit to the templates, the palette or the text they render.
