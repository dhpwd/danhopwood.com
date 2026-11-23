# Small details

The site's small details are a closed set of five – see "Small details are a closed set" in `docs/design-decisions.md`, with the options each rejected. The accent tint is built in "The accent at rest is a closed list" in `docs/patterns/design-system.md`, and the full-size image in "Figures" in `docs/patterns/post-page.md`. The other three each need a technique of their own, below. Their rules live in `src/styles/global.css` outside any layer, as `.active-nav` does, so they outrank the utilities on the same element. Every rule that moves something sits behind `prefers-reduced-motion: no-preference`, and the scroll script also does nothing under reduced motion.

## The line of ink

**Problem:** under the pointer a solid line draws over a link's dashed underline. A `text-decoration` can't draw along its length, and replacing the dashes with background layers changes how they look at rest. A background drawn at the foot of a box lands where the box ends, and that depends on the box. An inline box ends one descent (about 0.28em) under the baseline, next to the dashes. An inline-block or a flex item ends at its own bottom edge, 2 to 7px below them, and a flex item in a column runs the line the full width of its row.

**Solution:** the line is a 1px background on the inline box that carries the dashed underline. The rule keys on `[class~="decoration-dashed"]` and `.app-prose a:not(.heading-link)`, as `--dashed-decoration` does, behind `@media (hover: hover)`. At rest the box takes `padding-bottom: 2px` and a `background-size` of `0 1px` at `background-position: 100% var(--ink-y)`, with `--ink-y: calc(100% - (0.28em - 3px))`. An inline box takes the padding without moving anything, and the line then sits 4 to 5px under the baseline at every type size, on the dashes. Hovered, the size runs to `100% 1px` from the left over 300ms and the dashes fade after 120ms. Leaving runs it out to the right. A link and a span inside one share one transition list, `text-decoration-color, background-size` with the link adding `color` last, so one list of durations and one of delays serve both. Keyboard focus drops the padding and the background, on the link or the span inside it, so the outline keeps its box with no line in it. A title has no underline at rest, so its span carries `data-ink="title"`, which takes `text-decoration-line: none` while hovered and leaves it the line alone. Its `group-hover:underline` shows the dashes under reduced motion, and sorts before `group-focus-visible:no-underline`, so keyboard focus still drops them.

Where the link is an inline-block or a flex item, its underline classes go on an inline span inside it, and the link takes `group` so the span can drop its underline under `group-focus-visible:`. `Tag.astro`, `EditPost.astro`, `Card.astro`, the Posts page's intro links and the previous and next titles in `PostDetails.astro` do this. At a template's top level, keep whitespace out from between the span and the link's tags: Astro keeps it there, and the page's Markdown twin then puts it inside the link text (`[Tags ](/tags)`). Inside a `{…}` expression Astro drops it.

```astro
<a href={href} class="group inline-block py-1 interactive">
  <span class="underline decoration-dashed underline-offset-4 group-focus-visible:no-underline">
    {text}
  </span>
</a>
```

The anti-pattern is underline classes on a box that isn't inline – an `inline-block` link, a flex item or a block. Its line lands below the dashes, or across its whole row.

**When to use:** adding a dashed link, or changing the display of an element that carries one.

## The rule that draws

**Problem:** a labelled row's rule draws the first time the visitor scrolls to it. A border can't draw, and a scroll listener reads layout on every frame. A row already in view where the page lands would play on arrival, which moves something the visitor didn't ask for.

**Solution:** each ruled row carries a bare `data-rule` in its markup: the homepage's Advisory, Featured and Recent posts rows, a post's Tags, Share and Source rows, the archive's months and `Section.astro` unless `framed`. Rules that open or close a page stay still: the Build Notes row, the pagination's, the one above the previous and next posts and the footer's.

```astro
<section data-rule class="ledger border-t border-border py-6">
```

`src/scripts/rule-draw.ts`, loaded beside `theme.ts` in `Layout.astro`, holds each row's state in that attribute. A row in view where the page lands, or above it, becomes `seen`, and every other becomes `pending`, watched by one `IntersectionObserver` (`rootMargin: "0px 0px -8% 0px"`). Where the page lands is the router's saved scroll position on a reload or Back, or the `#hash` target, since `scroll-behavior: smooth` is still carrying the page there when the script runs. On entry a row becomes `run`, and a delegated `animationend` for `rule-draw` makes it `seen`. The state is also the guard that makes a second init a no-op.

The CSS, behind `screen and (prefers-reduced-motion: no-preference)`, holds the border transparent while a row is `pending` or `run`, and draws a `::before` at `top: -1px` with `scale` from `0 1` to `1 1` over 400ms, in `--accent` to 45% and then to `--border`, which is also its colour should the animation not run. The row's direct `.label-caps` child holds the accent to 35%. A printed page, a change to reduced motion and a page without JavaScript all show every rule at rest.

The phone's menu plays the same keyframes in CSS alone, below 640px: while `#menu-items` isn't `.hidden` its border stays transparent for 400ms as its `::before` draws, and each `li` rises 6px over 280ms, 40ms after the one above, to a fourth. `hidden` toggles `display`, so it plays on every open. The menu has no `data-rule`, so the script ignores its `animationend`.

Anti-patterns:

- Judging which rows are in view from the scroll position when the script runs, which plays rows on a reload or a `#hash` load as the page settles
- A ruled row without `data-rule`, which stays still while the rows round it draw

**When to use:** adding a ledger row ruled above, a `Section` or any other ruled block in the column.

## The icon's turn

**Problem:** an icon inside a control answers the pointer, while "One interaction behaviour" holds that no control moves. A `group-hover:` step reaches a disabled `LinkButton` too: it is a `span` resting on `text-foreground/45`, and it still carries `group`.

**Solution:** the icon moves and the control's box doesn't. The rules sit behind `@media (hover: hover)` on the shared 150ms, keyed on `a:hover`, so a disabled `LinkButton` doesn't answer. `icon-step-forward` on an arrow steps it `3px` while its link is hovered, and `icon-step-back` `-3px`: the arrows after "All posts" and "Next", and before "Prev". `icon-tilt` turns a profile or share icon `6deg`. The theme toggle's moon turns `-16deg` in the light theme and its sun `45deg` in the dark, one notch, so it ends looking as it started, on the icons' own `transition-[scale,rotate]`. The burger doesn't move. Nor does the arrow in "Steal this post →", which sits mid-sentence, where a 3px step closes the space after it.

An icon link is 44 by 44 below 640px and 32 by 32 from it, with its word as its name and its `title` as the tooltip:

```astro
<a {href} title={linkTitle} class="inline-flex size-11 items-center justify-center interactive sm:size-8">
  <Icon class="icon-tilt size-5" aria-hidden="true" />
  <span class="sr-only">{name}</span>
</a>
```

`ShareLinks.astro` reads its icons from `SHARE_LINKS` in `src/constants.ts`, and `Socials.astro` reads `SOCIALS` there and adds the RSS link and its icon itself. Their lists are `-mx-3 flex flex-wrap sm:-mx-1.5 sm:gap-x-3`, so the icons sit 24px apart and the first icon's box starts on the column's edge.

An icon button that toggles something keeps one name in both states, its word in the `sr-only` span, and carries the state in an attribute its script sets: `aria-expanded` on the burger, and `aria-pressed` on the theme toggle, which `reflectPreference()` in `src/scripts/theme.ts` sets ("true" in the dark theme). Its `title`, where it has one, matches the name.

Anti-patterns:

- A control that moves – a rotate or translate on the link or button itself
- A step keyed on `group-hover:`, which moves the arrow of a disabled `LinkButton`
- A toggle whose name changes with its state ("Switch to dark theme" and "Switch to light theme", or "Menu" and "Close"). The name then lives in the script, and whether a screen reader announces a name change on a focused button varies by screen reader

**When to use:** adding an icon inside a control, a profile or share link or a toggle button.
