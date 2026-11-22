# Design system

The calls behind these rules, and the options they rejected, are in `docs/design-decisions.md`.

## Theme tokens have two hand-written mirrors

**Problem:** the palette lives as CSS custom properties in `src/styles/global.css` – `--background`, `--foreground`, `--accent`, `--muted` and `--border` per theme, mapped to Tailwind through `@theme inline`. The accent is brick (`#a13124` light, `#e6867a` dark), and the dark theme sits on a warm near-black: `--background` `#1b1614`, `--muted` `#2c2522`, `--border` `#3c3532`. Satori resolves none of them, and satori renders both the favicons and the share cards. So two files carry the values again as literals, and changing a token in `global.css` alone leaves them behind with no build error.

**Solution:** changing a token means updating its mirrors in the same commit.

- `scripts/generate-favicons.mjs` mirrors light-mode `--accent` and `--background`, in `ACCENT`, `BACKGROUND` and its header comment. Re-run `pnpm generate:favicons` and commit the regenerated PNGs – see `docs/patterns/images.md`
- `src/utils/og-templates/shared.js` mirrors the palette for the share cards, with deliberate deviations noted in the file. It regenerates on the next build – see `docs/patterns/og-images.md`

Three derived tokens mix the theme tokens, so they need no value per theme and no satori mirror:

| Token               | Mix                            | Use                                                                 |
| ------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `--accent-strong`   | accent 70% with `--foreground` | hover on a filled button or the active nav, press on a text control |
| `--accent-stronger` | accent 55% with `--foreground` | press on a filled button or the active nav                          |
| `--accent-tint`     | accent 20% with transparent    | selected text, search matches and the tap flash                     |

They sit on `:root` as plain custom properties and are then mapped in `@theme inline` (`--color-accent-strong` and so on), so plain CSS such as the Pagefind block in `search.astro` can use them. A colour defined only in `@theme inline` is inlined into the utilities and never reaches plain CSS.

`--dashed-decoration` is the one token satori never sees, since the cards carry no links. It is restated in `typography.css` for prose links, because the `global.css` base rule can't reach them.

Code blocks are the one area with its own palette: the shiki themes `vitesse-light` and `vitesse-dark`, set in `astro.config.ts`. Swapping them means checking both modes.

**When to use:** any change to the palette or a theme token.

## Type

### Three treatments

**Problem:** two typefaces are in play, so per-component font choices drift. A new component that hand-picks a face, a size or a link style breaks the visual system and nothing in the build flags it.

**Solution:** every piece of text takes one of three treatments, each with a fixed style. Pick the treatment and use its shared style – new work adds no face, size or tracking of its own.

- **Prose** – Geist, via `font-app` and the body default. Links carry dashed underlines (`decoration-dashed underline-offset-4`), the site's signature, at body weight
- **Titles** – Geist at 600 with balanced wrapping, from the global `h1`–`h6` rule in `global.css`. Two `@utility` blocks there set the scale: `title-page` for a page's `h1`, fluid between 30px and 40px, and `title-item` for a card title or a section heading. In-post headings keep the prose plugin's sizes. Its own heading weights (800, 700, 600) outrank the global rule, so `typography.css` restates the weight and tracking on `.app-prose h1` to `h4`
- **Mono** – Geist Mono, for the site name, labels, the eyebrow, dates, metadata and the breadcrumb, via an explicit `font-mono` or a shared utility. `eyebrow` is the small mono accent line above a page's title. `label-caps` is the small uppercase label for a group, with `text-foreground/75` where the label is muted. A numeral set large, like the 404 page's, takes `font-mono` explicitly, since headings are no longer mono. UI state markers such as `.active-nav` use solid underlines, not dashed

Nav links are Geist at 500 (`font-medium`), not mono.

Both faces load through Astro's experimental fonts API (Google provider, configured in `astro.config.ts`, preloaded by `<Font>` in `Layout.astro`) at weights 400/500/600/700, from one variable file per family. A new weight in that range loads nothing new.

Anti-patterns:

- A mono heading – `font-mono` on a title, or in the global heading rule. Mono runs about a fifth wider, so a long title has to drop a size at 390 to wrap as well
- A title sized by hand (`text-2xl font-bold sm:text-3xl`) in place of `title-page` or `title-item`

### Don't compensate for the muted underline

The dashed underline is the link signal on its own. `--dashed-decoration` in `global.css` mutes it to 45% of the current colour on purpose, because full-strength 1px dashes read as noise. Adding weight or colour to make links stand out defeats the treatment: at `strong`'s weight an emphasised phrase and a link become indistinguishable.

`typography.css` sets `font-normal` on `.app-prose a` for this reason. `@tailwindcss/typography` defaults links to 500, so removing that override restores a weight nobody chose and nothing in the build warns you. Post titles in `Card.astro` are titles and stay at 600 – the 400 rule is for prose links only.

### No italics

No italic Geist face is loaded. Semantic emphasis (`em`, blockquotes) renders as browser-synthesised oblique, which is accepted. Decorative italics were removed rather than adding a face to carry them.

**When to use:** any new component or restyle.

## One interaction behaviour

**Problem:** every control needs a hover, a press and a focus state, on one timing. Written per component, they drift: one control fades, another rotates, a third has no press and each picks its own duration.

**Solution:** each control moves one colour step on hover and one more on press, from two `@utility` blocks in `global.css`.

- `interactive`, for text and icon controls: the text steps to `accent` on hover and `accent-strong` on press. Icon SVGs stroke `currentColor`, so an icon follows its anchor with no rule of its own. `LinkButton.astro` applies it, so every `LinkButton` has it
- `interactive-fill`, for filled accent buttons: the fill steps to `accent-strong` on hover and `accent-stronger` on press, only while the button is enabled, and the button settles 1px on press. Subscribe in `NewsletterSignup.astro` and Request setup in `cloud-box-setup.astro` use it. The label is `text-background`, never `text-white`: white on the dark accent is 2.61:1. `disabled:opacity-60` dims the button while a submit is pending, and disabled controls are exempt from the contrast minimum
- `.active-nav` rests on the accent, so it steps to `accent-strong` on hover and `accent-stronger` on press. The active Search and Archives icon links take it too, and their icons follow. It sits outside any layer in `global.css`, so it outranks the `interactive` on the same link

The steps mix the accent towards `--foreground`. That darkens the light theme's accent and lightens the dark theme's, away from the `text-background` label each time, so each step raises contrast. Measured in Chromium, light then dark:

| Pairing                                                    | Light   | Dark   |
| ---------------------------------------------------------- | ------- | ------ |
| Accent on the ground (hover, focus outline, eyebrow)       | 6.93:1  | 6.88:1 |
| `accent-strong` on the ground (press on a text control)    | 9.02:1  | 8.34:1 |
| `accent-stronger` on the ground (press on the active nav)  | 10.18:1 | 9.21:1 |
| Button label (`text-background`) at rest                   | 6.93:1  | 6.88:1 |
| Button label on hover                                      | 9.02:1  | 8.34:1 |
| Button label on press                                      | 10.18:1 | 9.21:1 |
| Accent on `--muted` (the copy button on hover)             | 5.65:1  | 5.78:1 |

Timing: `--default-transition-duration` and `--default-transition-timing-function` (150ms, decelerating) sit in a `@theme` block, so every Tailwind transition utility takes them. A control names only the properties it transitions (`transition-colors`, `transition-[border-color,box-shadow]`).

A muted control rests on a colour, not an opacity (`text-foreground/75`), so its hover reaches the full accent. Decoration beside a control's text can keep an opacity, like the hash in `Tag.astro`.

Focus: links and buttons take the base rule's 2px dashed accent outline. `Tag.astro` hides its dashed bottom border on focus with `focus-visible:border-transparent`, which keeps its height. Fields focus differently – see "Form fields".

Reduced motion keeps the colour steps and drops the motion: the press settle is `motion-safe:`, the theme toggle's icons morph with `transition-[scale,rotate] motion-reduce:transition-none`, and `html` takes `motion-safe:scroll-smooth` in `global.css` and `Layout.astro`. Astro's `ClientRouter` drops view-transition animation under reduced motion itself.

Anti-patterns:

- A bare `hover:text-accent`, with no press and no timing. Use `interactive`
- A hover that moves the control, like `hover:rotate-6` or `hover:-mt-0.5`
- An opacity fade, on hover or at rest (`hover:opacity-75`, `opacity-90` on an icon or a filled button). A fade blends the control with the page behind, so it lowers contrast where a step raises it: `opacity-90` takes a filled button's label from 6.93:1 to 5.70:1 in light theme. And a fade is not a step of the one behaviour
- `transition-all`, which also animates layout and any property added later
- A duration or easing class on a component (`duration-200`, `ease-out`), which drifts from the shared timing

### A theme change flips every colour in one frame

With a colour transition on every control, a theme change fades the controls about 110ms behind the text around them. `reflectPreference()` in `src/scripts/theme.ts` sets `data-theme-switching` on `<html>` with the theme and removes it after two animation frames. A base rule sets `transition-duration: 0s !important` on `html[data-theme-switching] *:not(#theme-btn > svg)`, so every colour flips together and the toggle's icons keep their morph. Transitioning the whole page's colours instead smears text that inherits its colour.

### Pagefind's controls

`/search` is Pagefind's markup, so it takes the same behaviour as plain CSS in the `#pagefind-search` block of `search.astro`, with the transition timed from `var(--default-transition-duration)` and `var(--default-transition-timing-function)`. Result links and Clear step to `var(--accent)` on hover, inside `@media (hover: hover)` as Tailwind's `hover:` variant is, and to `var(--accent-strong)` on press. "Load more results" rests on `var(--foreground)` with a 60% text-colour border and steps its text and border the same way. Clear and "Load more results" take the 2px dashed accent focus outline. Write new rules there as flat `#pagefind-search …` selectors after the nested block. The build ships that block's nesting as written, and Safari before 17.2 and Chrome before 120 drop a nested rule that starts with a type selector.

**When to use:** any new interactive element, and any AstroPaper component being restyled.

## The accent at rest is a closed list

**Problem:** in a red accent, colour at rest reads as a signal. A frame, a chip or a link title in brick reads as an error or a warning.

**Solution:** at rest, the accent appears only on:

- The `eyebrow` line above a page's title
- The one filled action (`interactive-fill`)
- Prose marks: list markers (`marker:text-accent`) and the blockquote rule (`border-s-accent/80`)
- The active nav item (`.active-nav`)
- The reading progress bar on a post

Everything else rests on the text colour or a mix of it. Frames take `border-border`, or `border-foreground/60` where one card leads another (the setup page's "After" card). Status chips take `border-foreground/60 text-foreground` ("Open") or sit on `--muted` ("Held", "Taken"). Link titles, search result titles and the 404 numeral take the text colour. Selected text (`selection:bg-accent-tint selection:text-foreground` on `body`), search matches (`#pagefind-search mark`) and the tap flash (`-webkit-tap-highlight-color` on `html`) sit on `--accent-tint` with the text in the text colour: 10.51:1 in light theme and 9.52:1 in dark.

The anti-pattern is the accent at rest on anything off the list – a frame, a chip, a link title, a heading. A new use is a design call, recorded in `docs/design-decisions.md` first.

**When to use:** any colour choice for an element at rest.

## Form fields

**Problem:** `--border` is the divider token, about 1.2:1 against the background in light theme and 1.5:1 in dark. A text field outlined with it is close to invisible until it's focused, and WCAG 1.4.11 asks 3:1 for the boundary that identifies a control. Placeholders fall short too. Tailwind's preflight sets `::placeholder` to the text colour mixed 50% with transparent, about 3:1 in light theme against the 4.5:1 that WCAG 1.4.3 asks of text, and Safari before 17 skips that rule for the browser default. An opacity utility on the placeholder lowers it further.

**Solution:** draw fields from `--foreground` at an opacity, and focus them in the text colour. Fields get no token of their own, and `--border` stays as it is for dividers.

| Part        | Classes                                                                           | Light   | Dark    |
| ----------- | --------------------------------------------------------------------------------- | ------- | ------- |
| Boundary    | `border-foreground/60`                                                            | 4.09:1  | 5.43:1  |
| Placeholder | `placeholder:text-foreground/75`                                                  | 6.44:1  | 7.85:1  |
| Focus       | `focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-hidden` | 14.63:1 | 13.24:1 |

The field also takes `transition-[border-color,box-shadow]`. The figures are measured in Chromium on all three forms, with the computed colour composited onto `--background`. 75% is the opacity the site already uses for muted text. Don't take the border below 60%: `/50` comes to about 3:1 in light theme, with no headroom.

Focus uses the text colour because a red edge round a field reads as a validation error, and the accent stays on the action. The text-colour border is a step of 3.58:1 from the 60% border at rest in light theme but only 2.44:1 in dark, so the ring carries the change: `ring-1` is a box-shadow, so it thickens the focused edge to 2px without moving the layout. `outline-hidden` replaces `outline-none` for Windows contrast themes. Those drop box-shadows and force border colours, and in Tailwind 4 `outline-none` sets only `outline-style: none`, which leaves a focused field with no marker. `outline-hidden` also draws a 2px transparent outline under `forced-colors: active`, which the contrast theme paints in its own colour.

The anti-pattern is an accent focus (`focus:border-accent focus:ring-accent`).

The search box on `/search` is Pagefind's markup, so it takes the same 60% and 75% foreground mixes as plain CSS in the `#pagefind-search` block of `search.astro`. Its placeholder rule also sets `opacity: 1`, overriding the `opacity: 0.2` placeholder rule in `@pagefind/default-ui/css/ui.css`, which the ID selector outranks. Without it the 75% colour renders at a fifth of that. Its focus is the same edge: `input:focus` sets `border-color: var(--foreground)`, `box-shadow: 0 0 0 1px var(--foreground)` and `outline: 2px solid transparent`, which does what `outline-hidden` does. `--pagefind-ui-border` stays `var(--border)`, because Pagefind draws result dividers with it too.

**When to use:** any new text input or textarea, and any third-party widget that brings its own field styles.

## Fields stay at 16px on touch screens

**Problem:** iOS Safari zooms the page when a text field under 16px takes focus, and leaves it zoomed after the keyboard closes, so the reader has to pinch back out. `text-sm` is 14px, so a field sized to match the small text around it triggers the zoom. Desktop browsers show nothing, so check a field's computed `font-size` rather than looking for the zoom. `maximum-scale=1` in the viewport meta also stops it, but blocks pinch zoom in browsers that honour it.

**Solution:** give text fields `text-base sm:pointer-fine:text-sm`. A field is 16px by default and drops to 14px only at 640px and up with a mouse or trackpad as the primary pointer, so a phone held sideways or a tablet keeps 16px. `inputClass` in `cloud-box-setup.astro` and the email field in `NewsletterSignup.astro` both do this. A button inline beside a field takes the same classes, so the row has one type size. A button on its own row, like "Request setup", stays `text-sm`, because buttons don't take text focus and so don't trigger the zoom.

`sm:text-sm` on its own is the anti-pattern. `sm` tests viewport width only, and every current iPhone is wider than 640px in landscape, so a phone held sideways gets the 14px field.

A field that is a flex item also needs `min-w-0`. Its default `min-width: auto` resolves to the input's intrinsic width, which grows with the font. Without it the 16px newsletter field won't shrink, and at 375px the Subscribe button overflows the card and the page scrolls sideways.

To check the touch case in Chromium, turn on touch emulation over CDP (`Emulation.setTouchEmulationEnabled`), which makes `(pointer: coarse)` match. Setting the `pointer` feature through `Emulation.setEmulatedMedia` leaves `(pointer: fine)` matching.

The `/search` box needs none of this. Pagefind sizes its field at 16.8px at every width.

**When to use:** any new text input or textarea.
