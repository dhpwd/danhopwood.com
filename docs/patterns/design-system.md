# Design system

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

`--dashed-decoration` needs no satori mirror either, since the cards carry no links. It is restated in `typography.css` for prose links, because the `global.css` base rule can't reach them.

Code blocks are the one area with its own palette: the shiki themes `vitesse-light` and `vitesse-dark`, set in `astro.config.ts`. Swapping them means checking both modes.

**When to use:** any change to the palette or a theme token.

## Type

### Three treatments

**Problem:** two typefaces are in play, so per-component font choices drift. A new component that hand-picks a face, a size or a link style breaks the visual system and nothing in the build flags it.

**Solution:** every piece of text takes one of three treatments, each with a fixed style. Pick the treatment and use its shared style – new work adds no face, size or tracking of its own.

- **Prose** – Geist, via `font-app` and the body default. Links carry dashed underlines (`decoration-dashed underline-offset-4`), the site's signature, at body weight. A post's tags are words with the dashed underline. The share row and the footer's profile links are icons – see "Profile and share links are icons" in `docs/design-decisions.md`
- **Titles** – Geist at 600 with balanced wrapping, from the global `h1`–`h6` rule in `global.css`. Three `@utility` blocks there set the scale: `title-hero` for the homepage's headline only, fluid between 32px and 44px, `title-page` for every other page's `h1`, fluid between 30px and 40px, and `title-item` for a card title or a section heading. In-post headings take the sizes `typography.css` sets – see "Reading measure" in `docs/patterns/post-page.md`. The prose plugin's own heading weights (800, 700, 600) outrank the global rule, so `typography.css` restates the weight and tracking on `.app-prose h1` to `h4`
- **Mono** – Geist Mono, for the site name, labels, the eyebrow, dates and metadata, via an explicit `font-mono` or a shared utility. `eyebrow` is the small mono accent line above a page's title. `meta` is the same line in the text colour at 75%, for dates, reading times, counts and the pagination line. `label-caps` is the small uppercase label for a group, with `text-foreground/75` where the label is muted. UI state markers such as `.active-nav` use solid underlines, not dashed

Nav links are Geist at 500 (`font-medium`), not mono.

Text inside a diagram takes the parts in `Diagram.astro` at the sizes they set, from 12px mono labels and 14px text to 20px names – see `docs/patterns/diagrams.md`.

The share cards set their titles through `titleStyle` in `src/utils/og-templates/shared.js`, which restates `title-page`'s weight, line-height and tracking by hand at card scale. A change to the title treatment updates it too.

Pagefind's results on `/search` can't take the utilities either, so four flat `#pagefind-search …` rules in `search.astro` restate them: the count line in `meta`'s values, result titles in `title-item`'s at weight 600, nested titles at 16px and weight 500, and excerpts at 15px. Pagefind sizes a nested result's link at 0.9em of its title, so the nested rule sets the link as well. Without them Pagefind sets a result title at weight 700 and an excerpt at 12.8px. A change to `meta` or `title-item` updates those rules too.

Both faces load through Astro's experimental fonts API (Google provider, configured in `astro.config.ts`, preloaded by `<Font>` in `Layout.astro`) at weights 400/500/600/700, from one variable file per family. A new weight in that range loads nothing new.

Anti-patterns:

- A mono heading – `font-mono` on a title, or in the global heading rule. Mono runs about a fifth wider, so a long title has to drop a size at 390 to wrap as well
- A title sized by hand (`text-2xl font-bold sm:text-3xl`) in place of `title-page` or `title-item`

### Don't compensate for the muted underline

The dashed underline is the link signal on its own. `--dashed-decoration` in `global.css` mutes it to 45% of the current colour on purpose, because full-strength 1px dashes read as noise. Its base rule keys on the `decoration-dashed` class rather than on `a`, so an underline drawn on a span inside a link, like a `/tags` row's name, is muted too. Adding weight or colour to make links stand out defeats the treatment: at `strong`'s weight an emphasised phrase and a link become indistinguishable.

`typography.css` sets `font-normal` on `.app-prose a` for this reason. `@tailwindcss/typography` defaults links to 500, so removing that override restores a weight nobody chose and nothing in the build warns you. Post titles in `Card.astro` are titles and stay at 600 – the 400 rule is for prose links only.

### No italics

No italic Geist face is loaded. Semantic emphasis (`em`, blockquotes) renders as browser-synthesised oblique, which is accepted. Decorative italics were removed rather than adding a face to carry them.

**When to use:** any new component or restyle.

## The title block

**Problem:** every page opens with a title, and a page that composes its own opening drifts from the rest – a breadcrumb on one, a description line on another, a different gap above the title on a third.

**Solution:** one title block on the list pages, posts, the About page and `/404`: an optional `eyebrow` line, then the `h1` in `title-page`, 0.75rem apart, with 2.25rem above (3.5rem from 640px). `Main.astro` renders it from `pageTitle`, `eyebrow` and an `intro` slot for one line under the title, which the Posts page uses for its Tags and Archives links and `/404` for its link home. `titleTransition` names the title's view transition, so a tag's title morphs from the tag link that led to it. On these pages the eyebrow holds data or a label, never copy: a count ("n posts", "Tag · n posts"), a code ("404") or a post's date line. `PostDetails.astro` keeps the same block by hand, with `<Datetime tone="eyebrow" />` above the title, and `AboutLayout.astro`'s `main` takes the same top padding.

Two openings keep the accent line above the title but are composed on their own terms. The homepage's first screen puts its tagline in the eyebrow and sets the headline in `title-hero` – see "The homepage's first screen" in `docs/design-decisions.md`. `PageIntro.astro`, which opens a page built from the setup page's parts, keeps that page's spacing, with the eyebrow and title 1.25rem apart, and adds an opening paragraph on the reading measure.

Anti-patterns:

- A breadcrumb, which is a second kind of mono line above a title
- A description line under the title that restates it ("All the tags used in posts.")

**When to use:** any new page or layout.

## The ledger

**Problem:** the site has many labelled lists – the homepage's rows, the post lists, the archive's months, the rows after a post. Set as sections under full-width label headings, each list's text runs the full column, and each page ends up styling its list its own way.

**Solution:** the `ledger` utility in `global.css`. One column on a phone, with the label above its content. From 640px, two columns, `8.5rem minmax(0, 1fr)`, with the label on the left and its content beside it, 2rem apart and aligned on their first baselines. An `inline-block` takes its baseline from its last line, so a link that can wrap at the top of a row's content (a card's title) is `block w-fit`, or the label lines up with its last line. Not `inline-flex`: it takes the first baseline too, but only a wrapped title loses the 1px the line box adds below it, so one-line and wrapped titles end up spaced differently. The label is an `h2` (an `h3` under a year on `/archives`) in `label-caps text-foreground/75`. Rows are ruled above with `border-t border-border` and carry `data-rule`, so the rule draws as the visitor scrolls to it – see "The rule that draws" in `docs/patterns/small-details.md`. Lists inside a row space their items with `gap`, never a margin on the item.

```astro
<section data-rule class="ledger border-t border-border py-6">
  <h2 class="label-caps text-foreground/75">Recent posts</h2>
  <ul class="flex flex-col gap-7">…</ul>
</section>
```

`<Card aside />` makes a post card a ledger row of its own: the date line in the label column, with one item a line, and above the title on a phone. A card in a list that already has a label puts the date above the title instead. `NewsletterSignup variant="row"`, `ShareLinks.astro` and `EditPost.astro` each render their own row.

Prose and long lines take `max-w-measure` (38rem), the reading measure – see "Reading measure" in `docs/patterns/post-page.md`.

**When to use:** any labelled list or group of rows.

## Page parts

**Problem:** a page that is neither a list nor a post – an offer or a form – composes its own sections, cards and lists. Written inline, its classes become page constants that the next such page copies and changes.

**Solution:** build it from the parts `/cloud-box-setup` is made of, in `src/components/`: `PageIntro`, `Section`, `Panel`, `Detail`, `MarkedList`, `StatusChip`, `Field` and `Button`. Each uses the shared styles by name, so the page needs no class constants of its own. A part that a new page needs and the set lacks joins `src/components/` rather than the page.

**When to use:** building a new page that isn't a list or a post.

## One interaction behaviour

**Problem:** every control needs a hover, a press and a focus state, on one timing. Written per component, they drift: one control fades, another rotates, a third has no press and each picks its own duration.

**Solution:** each control moves one colour step on hover and one more on press, from two `@utility` blocks in `global.css`.

- `interactive`, for text and icon controls: the text steps to `accent` on hover and `accent-strong` on press. Icon SVGs stroke `currentColor`, so an icon follows its anchor's colour with no rule of its own. An icon link is `size-11 sm:size-8`, with its word in an `sr-only` span as its name and a `title` as its tooltip, and an icon that turns or steps under the pointer follows "The icon's turn" in `docs/patterns/small-details.md`. `LinkButton.astro` applies it, so every enabled `LinkButton` has it, and a disabled one rests on `text-foreground/45`
- `interactive-fill`, for filled accent buttons: the fill steps to `accent-strong` on hover and `accent-stronger` on press, only while the button is enabled, and the button settles 1px on press. `Button.astro` carries it, and every filled action is a `Button`: Subscribe in `NewsletterSignup.astro` and Request setup in `cloud-box-setup.astro`. The label is `text-background`, never `text-white`: white on the dark accent is 2.61:1. `disabled:opacity-60` dims the button while a submit is pending, and disabled controls are exempt from the contrast minimum
- `.active-nav` rests on the accent, so it steps to `accent-strong` on hover and `accent-stronger` on press. The header's word links are the only ones that take it. It sits outside any layer in `global.css`, so it outranks the `interactive` on the same link

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

A muted control rests on a colour, not an opacity (`text-foreground/75`), so its hover reaches the full accent. The heading anchor that `PostDetails.astro` adds rests on `text-foreground/60`. Where the pointer is fine it is hidden at `opacity-0` until its heading is hovered or the link is focused, which is a reveal rather than a resting state, and on a touch screen it always shows. Gate a reveal like this on `pointer-fine:`, not on a width, since a wide touch screen has no hover to reveal it.

Text inside a control that sets its own colour doesn't inherit the control's steps. The count on a `/tags` row is `meta`, and the "Previous post" and "Next post" labels are `label-caps text-foreground/75`, so each takes `transition-colors group-hover:text-accent group-active:text-accent-strong` from its link, which carries `group`.

Focus: links, buttons and `[role="button"]` elements take the base rule's 2px dashed accent outline, so a post's images, which `ImageZoom.astro` makes buttons, need no outline of their own. Fields focus differently – see "Form fields".

Reduced motion keeps the colour steps and drops the motion: the press settle is `motion-safe:`, the theme toggle's icons morph with `transition-[scale,rotate] motion-reduce:transition-none`, and `html` takes `motion-safe:scroll-smooth` in `global.css` and `Layout.astro`. `global.css` drops every view-transition animation under reduced motion, outside any layer: Astro adds its own copy of that rule only to pages that use a `transition:` directive, and the router swaps in the incoming page's head, so a page without one would run the browser's default cross-fade.

Anti-patterns:

- A bare `hover:text-accent`, with no press and no timing. Use `interactive`
- `hover:bg-accent-hover` on a filled button. The `accent-hover` colour no longer exists, and Tailwind generates nothing for an unknown colour, so copied code loses its hover and nothing warns you. Use `interactive-fill`
- A hover that moves the control, like `hover:rotate-6` or `hover:-mt-0.5`
- An opacity fade, on hover or at rest (`hover:opacity-75`, `opacity-90` on an icon or a filled button). A fade blends the control with the page behind, so it lowers contrast where a step raises it: `opacity-90` takes a filled button's label from 6.93:1 to 5.70:1 in light theme. And a fade is not a step of the one behaviour
- `transition-all`, which also animates layout and any property added later
- A duration or easing class on a component (`duration-200`, `ease-out`), which drifts from the shared timing

**When to use:** any new interactive element, and any AstroPaper component being restyled.

## A theme change flips every colour in one frame

**Problem:** with a colour transition on every control, a theme change fades the controls about 110ms behind the text around them.

**Solution:** `reflectPreference()` in `src/scripts/theme.ts` sets `data-theme-switching` on `<html>` whenever it changes `data-theme`, and removes it after two animation frames. A base rule sets `transition-duration: 0s !important` on `html[data-theme-switching] *:not(#theme-btn > svg)`, so every colour flips together and the toggle's icons keep their morph. Transitioning the whole page's colours instead smears text that inherits its colour.

**When to use:** adding a transition to anything that changes with the theme, or changing how the theme is applied.

## Pagefind's controls

**Problem:** `/search` is Pagefind's markup, so Tailwind utilities can't reach its controls. Its stylesheet is unlayered and resets every element inside it with `all: unset` and `outline: revert`, which beats the base `a, button` rule in `@layer base`, so its controls don't get the site's focus outline either.

**Solution:** `/search` takes the same behaviour as plain CSS in the `#pagefind-search` block of `search.astro`, with the transition timed from `var(--default-transition-duration)` and `var(--default-transition-timing-function)`. Result links and Clear step to `var(--accent)` on hover, inside `@media (hover: hover)` as Tailwind's `hover:` variant is, and to `var(--accent-strong)` on press. "Load more results" rests on `var(--foreground)` with a 60% text-colour border and steps its text and border the same way. Clear and "Load more results" take the 2px dashed accent focus outline. Rules there may nest: the build lowers nesting for older browsers ("Nested CSS and the CSS build target" in `docs/patterns/astro-build.md`).

**When to use:** any change to the search page's styles.

## The accent at rest is a closed list

**Problem:** in a red accent, colour at rest reads as a signal. A frame, a chip or a link title in brick reads as an error or a warning.

**Solution:** at rest on a page, the accent appears only on:

- The `eyebrow` line above a page's title
- The one filled action (`interactive-fill`)
- Prose marks: list markers (`marker:text-accent`) and the blockquote rule (`border-s-accent/80`)
- The active nav item (`.active-nav`)
- The reading progress bar on a post

Everything else rests on the text colour or a mix of it. Frames take `border-border`, or `border-foreground/60` where one card leads another (the setup page's "After" card). Status chips take `border-foreground/60 text-foreground` ("Open") or sit on `--muted` ("Held", "Taken"). Link titles and search result titles take the text colour. Selected text (`selection:bg-accent-tint selection:text-foreground` on `body`), search matches (`#pagefind-search mark`) and the tap flash (`-webkit-tap-highlight-color` on `html`) sit on `--accent-tint` with the text in the text colour: 10.51:1 in light theme and 9.52:1 in dark. The favicon and the share cards' accent bar and hostname are brand marks, outside the list. A drawn diagram's level labels are on the list, as the `eyebrow`'s counterpart inside a diagram – see "A diagram is ink, with the accent on its level labels" in `docs/design-decisions.md`. A row's rule and label take the accent for under 400ms as the visitor scrolls to the row, which is motion, not rest – see "The rule that draws" in `docs/patterns/small-details.md`.

The anti-pattern is the accent at rest on anything off the list – a frame, a chip, a link title, a heading. A new use is a design call, recorded in `docs/design-decisions.md` first.

**When to use:** any colour choice for an element at rest.

## Form fields

**Problem:** `--border` is the divider token, about 1.2:1 against the background in light theme and 1.5:1 in dark. A text field outlined with it is close to invisible until it's focused, and WCAG 1.4.11 asks 3:1 for the boundary that identifies a control. Placeholders fall short too. Tailwind's preflight sets `::placeholder` to the text colour mixed 50% with transparent, about 3:1 in light theme against the 4.5:1 that WCAG 1.4.3 asks of text, and Safari before 17 skips that rule for the browser default. An opacity utility on the placeholder lowers it further.

**Solution:** draw fields from `--foreground` at an opacity, and focus them in the text colour. Fields get no token of their own, and `--border` stays as it is for dividers. The `field` utility in `global.css` holds every class below, with the padding, radius and type size. `Field.astro` renders a labelled field on it (a textarea when `rows` is set), and the newsletter's inline email field takes `field min-w-0 flex-1`. The filled action beside or under a field is `Button.astro`.

| Part        | Classes                                                                           | Light   | Dark    |
| ----------- | --------------------------------------------------------------------------------- | ------- | ------- |
| Boundary    | `border-foreground/60`                                                            | 4.09:1  | 5.43:1  |
| Placeholder | `placeholder:text-foreground/75`                                                  | 6.44:1  | 7.85:1  |
| Focus       | `focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-hidden` | 14.63:1 | 13.24:1 |

The field also takes `transition-[border-color,box-shadow]`. The figures are measured in Chromium on all three forms, with the computed colour composited onto `--background`. 75% is the opacity the site already uses for muted text. Don't take the border below 60%: `/50` comes to about 3:1 in light theme, with no headroom.

Focus uses the text colour because a red edge round a field reads as a validation error, and the accent stays on the action. The text-colour border is a step of 3.58:1 from the 60% border at rest in light theme but only 2.44:1 in dark, so the ring carries the change: `ring-1` is a box-shadow, so it thickens the focused edge to 2px without moving the layout. `outline-hidden` replaces `outline-none` for Windows contrast themes. Those drop box-shadows and force border colours, and in Tailwind 4 `outline-none` sets only `outline-style: none`, which leaves a focused field with no marker. `outline-hidden` also draws a 2px transparent outline under `forced-colors: active`, which the contrast theme paints in its own colour.

Anti-patterns:

- An accent focus (`focus:border-accent focus:ring-accent`)
- A field's class string written out in a component in place of `field`. A copy misses the next change to the utility, and nothing in the build tells you

The search box on `/search` is Pagefind's markup, so it takes the same 60% and 75% foreground mixes as plain CSS in the `#pagefind-search` block of `search.astro`. Its placeholder rule also sets `opacity: 1`, overriding the `opacity: 0.2` placeholder rule in `@pagefind/default-ui/css/ui.css`, which the ID selector outranks. Without it the 75% colour renders at a fifth of that. Its focus is the same edge: `input:focus` sets `border-color: var(--foreground)`, `box-shadow: 0 0 0 1px var(--foreground)` and `outline: 2px solid transparent`, which does what `outline-hidden` does. `--pagefind-ui-border` stays `var(--border)`, because Pagefind draws result dividers with it too.

**When to use:** any new text input or textarea, and any third-party widget that brings its own field styles.

## Fields stay at 16px on touch screens

**Problem:** iOS Safari zooms the page when a text field under 16px takes focus, and leaves it zoomed after the keyboard closes, so the reader has to pinch back out. `text-sm` is 14px, so a field sized to match the small text around it triggers the zoom. Desktop browsers show nothing, so check a field's computed `font-size` rather than looking for the zoom. `maximum-scale=1` in the viewport meta also stops it, but blocks pinch zoom in browsers that honour it.

**Solution:** give text fields `text-base sm:pointer-fine:text-sm`. A field is 16px by default and drops to 14px only at 640px and up with a mouse or trackpad as the primary pointer, so a phone held sideways or a tablet keeps 16px. The `field` utility carries these classes, so every field built on it does this. A button inline beside a field takes the same classes, so the row has one type size: `<Button inline>`, as Subscribe is. A button on its own row, like "Request setup", is a plain `<Button>` and stays `text-sm`, because buttons don't take text focus and so don't trigger the zoom.

`sm:text-sm` on its own is the anti-pattern. `sm` tests viewport width only, and every current iPhone is wider than 640px in landscape, so a phone held sideways gets the 14px field.

A field that is a flex item also needs `min-w-0`. Its default `min-width: auto` resolves to the input's intrinsic width, which grows with the font. Without it the 16px newsletter field won't shrink, and at 375px the Subscribe button overflows the card and the page scrolls sideways.

To check the touch case in Chromium, turn on touch emulation over CDP (`Emulation.setTouchEmulationEnabled`), which makes `(pointer: coarse)` match. Setting the `pointer` feature through `Emulation.setEmulatedMedia` leaves `(pointer: fine)` matching.

The `/search` box needs none of this. Pagefind sizes its field at 16.8px at every width.

**When to use:** any new text input or textarea.
