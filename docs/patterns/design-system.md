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

**Solution:** interactive elements hover to `hover:text-accent` – `Card.astro`, `Footer.astro`, `Header.astro`, `EditPost.astro` and the prev/next links in `PostDetails.astro` all do. The icon SVGs are `stroke="currentColor"`, so a chevron or arrow picks the colour up from its anchor with no rule of its own.

A child already sitting at `text-accent` can't take that colour change, so it needs a second signal or the largest part of the control stays inert on hover. Put `group` on the anchor and `group-hover:underline decoration-dashed underline-offset-4` on the child – the dashed underline is the site's link signal, and `Card.astro` pairs the two the same way for post titles.

Two exceptions. A filled accent button has the accent in its background rather than its text, so `hover:text-accent` has nothing to change. The Subscribe button in `NewsletterSignup.astro` and the Request setup button in `cloud-box-setup.astro` move their fill instead, with `hover:bg-accent-hover`, and dim to `disabled:opacity-60` while a submit is pending. Their label is `text-background`, never `text-white`. White on the dark-theme accent comes to about 2.4:1, under WCAG AA's 4.5:1 for small text, while `text-background` gives about 5.4:1 in light and 7.2:1 in dark.

`--color-accent-hover`, in `global.css`'s `@theme` block, mixes the accent 70% with the foreground. That darkens the light theme's accent and lightens the dark theme's, which is the opposite end from the label each time, so the hover raises label contrast in both themes: about 7.4:1 light and 8.6:1 dark. It derives from the theme tokens, so it needs no value per theme and no satori mirror. An opacity fade on a filled button is the anti-pattern. It blends label and fill with the page behind, so it lowers contrast: `opacity-90` takes the light-theme pair to about 4.4:1, under AA. A fade small enough to keep AA barely shows. Disabled controls are exempt from the minimum.

The second exception: motion adds to a colour change and never replaces one – `hover:rotate-6` on the `Socials.astro` and `ShareLinks.astro` icon rows, `hover:-mt-0.5` in `Tag.astro`, each sitting on top of a `hover:text-accent` the element sets itself (`Tag.astro`) or inherits from `LinkButton.astro` (the icon rows).

**When to use:** any new interactive element, and any AstroPaper component being restyled.

## Form fields

**Problem:** `--border` is the divider token, about 1.2:1 against the background in light theme and 1.5:1 in dark. A text field outlined with it is close to invisible until it's focused, and WCAG 1.4.11 asks 3:1 for the boundary that identifies a control. Placeholders fall short too. Tailwind's preflight sets `::placeholder` to the text colour mixed 50% with transparent, about 3:1 in light theme against the 4.5:1 that WCAG 1.4.3 asks of text, and Safari before 17 skips that rule for the browser default. An opacity utility on the placeholder lowers it further.

**Solution:** draw fields from `--foreground` at an opacity. Fields get no token of their own, and `--border` stays as it is for dividers.

| Part        | Classes                                                                   | Light  | Dark   |
| ----------- | ------------------------------------------------------------------------- | ------ | ------ |
| Boundary    | `border-foreground/60`                                                    | 4.09:1 | 5.38:1 |
| Placeholder | `placeholder:text-foreground/75`                                          | 6.44:1 | 7.69:1 |
| Focus       | `focus:border-accent focus:ring-1 focus:ring-accent focus:outline-hidden` | –      | –      |

The figures are measured in Chromium on all three forms, with the computed colour composited onto `--background`. 75% is the opacity the site already uses for muted text. Don't take the border below 60%: `/50` comes to about 3:1 in light theme, with no headroom.

The focus ring is there because the accent border alone is a step of only about 1.3:1 from the 60% border at rest, close to a change of hue and nothing else. `ring-1` is a box-shadow, so it thickens the focused edge to 2px without moving the layout. `outline-hidden` replaces `outline-none` for Windows contrast themes. Those drop box-shadows and force border colours, and in Tailwind 4 `outline-none` sets only `outline-style: none`, which leaves a focused field with no marker. `outline-hidden` also draws a 2px transparent outline under `forced-colors: active`, which the contrast theme paints in its own colour.

The search box on `/search` is Pagefind's markup, so it takes the same 60% and 75% foreground mixes as plain CSS in the `#pagefind-search` block of `search.astro`. Its placeholder rule also sets `opacity: 1`, overriding the `opacity: 0.2` placeholder rule in `@pagefind/default-ui/css/ui.css`, which the ID selector outranks. Without it the 75% colour renders at a fifth of that. Focus keeps the 1px accent outline on `input:focus-visible`, which sits outside the border as a second edge. `--pagefind-ui-border` stays `var(--border)`, because Pagefind draws result dividers with it too.

**When to use:** any new text input or textarea, and any third-party widget that brings its own field styles.

## Fields stay at 16px on touch screens

**Problem:** iOS Safari zooms the page when a text field under 16px takes focus, and leaves it zoomed after the keyboard closes, so the reader has to pinch back out. `text-sm` is 14px, so a field sized to match the small text around it triggers the zoom. Desktop browsers show nothing, so check a field's computed `font-size` rather than looking for the zoom. `maximum-scale=1` in the viewport meta also stops it, but blocks pinch zoom in browsers that honour it.

**Solution:** give text fields `text-base sm:pointer-fine:text-sm`. A field is 16px by default and drops to 14px only at 640px and up with a mouse or trackpad as the primary pointer, so a phone held sideways or a tablet keeps 16px. `inputClass` in `cloud-box-setup.astro` and the email field in `NewsletterSignup.astro` both do this. A button inline beside a field takes the same classes, so the row has one type size. A button on its own row, like "Request setup", stays `text-sm`, because buttons don't take text focus and so don't trigger the zoom.

`sm:text-sm` on its own is the anti-pattern. `sm` tests viewport width only, and every current iPhone is wider than 640px in landscape, so a phone held sideways gets the 14px field.

A field that is a flex item also needs `min-w-0`. Its default `min-width: auto` resolves to the input's intrinsic width, which grows with the font. Without it the 16px newsletter field won't shrink, and at 375px the Subscribe button overflows the card and the page scrolls sideways.

To check the touch case in Chromium, turn on touch emulation over CDP (`Emulation.setTouchEmulationEnabled`), which makes `(pointer: coarse)` match. Setting the `pointer` feature through `Emulation.setEmulatedMedia` leaves `(pointer: fine)` matching.

The `/search` box needs none of this. Pagefind sizes its field at 16.8px at every width.

**When to use:** any new text input or textarea.
