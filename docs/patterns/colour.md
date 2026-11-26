# Colour

The calls behind these rules, and the options they rejected, are in `docs/design-decisions.md`.

## Theme tokens have two hand-written mirrors

**Problem:** the palette lives as CSS custom properties in `src/styles/global.css` – `--background`, `--foreground`, `--accent`, `--muted` and `--border` per theme, mapped to Tailwind through `@theme inline`. The accent is brick (`#a13124` light, `#e6867a` dark), and the dark theme sits on a warm near-black: `--background` `#1b1614`, `--muted` `#2c2522`, `--border` `#3c3532`. Satori resolves none of them, and satori renders both the favicons and the share cards. So two places carry the values again as literals, and changing a token in `global.css` alone leaves them behind with no build error.

**Solution:** changing a token means updating its mirrors in the same commit.

- `scripts/generate-favicons.mjs` mirrors light-mode `--accent` and `--background`, in `ACCENT`, `BACKGROUND` and its header comment. Re-run `pnpm generate:favicons` and commit the regenerated PNGs – see `docs/patterns/images.md`
- `src/utils/og-templates/shared.js` mirrors the palette for the share cards, with deliberate deviations noted in the file. It regenerates on the next build – see `docs/patterns/og-images.md`

Three derived tokens mix the theme tokens, so they need no value per theme and no satori mirror:

| Token               | Mix                            | Use                                                                 |
| ------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `--accent-strong`   | accent 70% with `--foreground` | hover on a filled button or the active nav, press on a text control |
| `--accent-stronger` | accent 55% with `--foreground` | press on a filled button or the active nav                          |
| `--accent-tint`     | accent 20% with transparent    | selected text, search matches and the tap flash                     |

They sit on `:root` as plain custom properties and are then mapped in `@theme inline` (`--color-accent-strong` and so on), so plain CSS such as the Pagefind block in `search.astro` can use them. A colour defined only in `@theme inline` is inlined into the utilities and never reaches plain CSS. The build gives each a fallback of bare `--accent`, with the mix behind `@supports`, so a browser without `color-mix()` (below Tailwind 4's Safari 16.4 and Chrome 111 baseline) loses the press steps and the filled-button hover, and selects text on a solid accent.

`--dashed-decoration` needs no satori mirror either, since the cards carry no links. `link-underline` and `title-underline` in `global.css` set it, prose links take it through `@apply link-underline`, and Pagefind's result links restate it in `search.astro`, because their markup can't take a class.

Code blocks are the one area with its own palette: the shiki themes `vitesse-light` and `vitesse-dark`, set in `astro.config.ts`. Swapping them means checking both modes.

**When to use:** any change to the palette or a theme token.

## A theme change flips every colour in one frame

**Problem:** with a colour transition on every control, a theme change fades the controls about 110ms behind the text around them.

**Solution:** `reflectPreference()` in `src/scripts/theme.ts` sets `data-theme-switching` on `<html>` whenever it changes `data-theme`, and removes it after two animation frames. A base rule sets `transition-duration: 0s !important` on `html[data-theme-switching] *:not(#theme-btn > svg)`, so every colour flips together and the toggle's icons keep their morph. Transitioning the whole page's colours instead smears text that inherits its colour.

**When to use:** adding a transition to anything that changes with the theme, or changing how the theme is applied.

## The accent at rest is a closed list

**Problem:** in a red accent, colour at rest reads as a signal. A frame, a chip or a link title in brick reads as an error or a warning.

**Solution:** at rest on a page, the accent appears only on:

- The `eyebrow` line above a page's title
- The one filled action (`interactive-fill`)
- Prose marks: list markers (`marker:text-accent`) and the blockquote rule (`border-s-accent/80`)
- The active nav item (`.active-nav`)
- The current chapter's time while the walkthrough on `/cloud-box-setup` plays (its link carries `aria-current="time"`), the active nav item's counterpart
- The reading progress bar on a post

Everything else rests on the text colour or a mix of it. Frames take `border-border`, or `border-foreground/60` where one card leads another (the setup page's "After" card) or draws a device's window (the walkthrough's stills). A frame round a picture of the app takes `border-foreground/16`, the diagrams' `--dg-border` (the walkthrough's player and the setup page's picker stills). Status chips take `border-foreground/60 text-foreground` ("Open") or sit on `--muted` ("Held", "Taken"). Link titles and search result titles take the text colour. Selected text (`selection:bg-accent-tint selection:text-foreground` on `body`), search matches (`#pagefind-search mark`) and the tap flash (`-webkit-tap-highlight-color` on `html`) sit on `--accent-tint` with the text in the text colour: 10.51:1 in light theme and 9.52:1 in dark. The favicon and the share cards' accent bar and hostname are brand marks, outside the list. A drawn diagram's level labels are on the list, as the `eyebrow`'s counterpart inside a diagram – see "A diagram is ink, with the accent on its level labels" in `docs/design-decisions.md`. A row's rule and label take the accent for under 400ms as the visitor scrolls to the row, which is motion, not rest – see "The rule that draws" in `docs/patterns/small-details.md`.

The anti-pattern is the accent at rest on anything off the list – a frame, a chip, a link title, a heading. A new use is a design call, recorded in `docs/design-decisions.md` first.

**When to use:** any colour choice for an element at rest.
