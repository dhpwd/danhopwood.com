# Design system

## Theme tokens have two hand-written mirrors

**Problem:** the palette lives as CSS custom properties in `src/styles/global.css` – `--background`, `--foreground`, `--accent` (teal: `#0f766e` light, `#6fb3a8` dark), `--muted`, `--border`, mapped to Tailwind through `@theme inline`. Satori resolves none of them, and satori renders both the favicons and the share cards. So two files carry the values again as literals, and changing a token in `global.css` alone leaves them behind with no build error.

**Solution:** changing a token means updating its mirrors in the same commit.

- `scripts/generate-favicons.mjs` mirrors light-mode `--accent` and `--background`. Re-run `pnpm generate:favicons` and commit the regenerated PNGs – see `docs/patterns/images.md`
- `src/utils/og-templates/shared.js` mirrors the palette for the share cards, with deliberate deviations noted in the file. It regenerates on the next build – see `docs/patterns/og-images.md`

`--dashed-decoration` is the one token satori never sees, since the cards carry no links. It is restated in `typography.css` for prose links, because the `global.css` base rule can't reach them.

Code blocks are the one area with its own palette: the shiki themes `vitesse-light` and `vitesse-dark`, set in `astro.config.ts` and chosen for neutral grounds that sit with the theme backgrounds. Swapping them means checking both modes.

**When to use:** any change to the palette or a theme token.

## Type

### Two registers

**Problem:** two typefaces are in play, so per-component font choices drift. A new component that hand-picks a face or a link style breaks the visual system and nothing in the build flags it.

**Solution:** every element belongs to one of two registers, and each register has a fixed treatment. Pick the register and inherit its treatment – don't invent per-component font and underline combinations.

- **Content** (prose, post furniture) – Geist, via `font-app` and the body default. Links carry dashed underlines (`decoration-dashed underline-offset-4`), the site's signature, at body weight
- **Chrome** (headings, metadata, labels, nav) – Geist Mono, via the global `h1–h6` rule in `global.css` or an explicit `font-mono`. UI state markers such as `.active-nav` use solid underlines, not dashed

Both faces load through Astro's experimental fonts API (Google provider, configured in `astro.config.ts`, preloaded by `<Font>` in `Layout.astro`) at weights 400/500/600/700.

### Don't compensate for the muted underline

The dashed underline is the link signal on its own. `--dashed-decoration` in `global.css` mutes it to 45% of the current colour on purpose, because full-strength 1px dashes read as noise. Adding weight or colour to make links stand out defeats the register: at `strong`'s weight an emphasised phrase and a link become indistinguishable.

`typography.css` sets `font-normal` on `.app-prose a` for this reason. `@tailwindcss/typography` defaults links to 500, so removing that override restores a weight nobody chose and nothing in the build warns you. Post-title links in `Card.astro` sit in the Chrome register and stay at 600 – the 400 rule is Content-register only.

### No italics

No italic Geist face is loaded. Semantic emphasis (`em`, blockquotes) renders as browser-synthesised oblique, which is accepted. Decorative italics were removed rather than adding a face to carry them.

**When to use:** any new component or restyle.

## Hover raises, never fades

**Problem:** AstroPaper ships several links with `hover:opacity-75`. Fading is the opposite signal to the rest of the site, and it compounds with any tinted child – an `/85` accent inside a 75% parent lands at 64%, which drops small text below WCAG AA in both themes.

**Solution:** interactive elements hover to `hover:text-accent`. The chevron and arrow SVGs use `stroke="currentColor"`, so the whole control picks the colour up from the anchor. Where a child needs to be accent at rest, set it at full strength (`text-accent`, not `text-accent/85`) and let hover carry the change through the parent.

Motion is the one accepted alternative, used for icon rows that are already accent-coloured: `hover:rotate-6` in `Socials.astro` and `ShareLinks.astro`, `hover:-mt-0.5` in `Tag.astro`. Both are additive to a colour change, never a substitute for one on a text link.

**When to use:** any new interactive element, and any AstroPaper component being restyled.
