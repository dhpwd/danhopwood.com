# Small details

The site's small details are a closed set of five – see "Small details are a closed set" in `docs/design-decisions.md`, with the options each rejected. The accent tint is built in "The accent at rest is a closed list" in `docs/patterns/design-system.md`, and the full-size image in "Figures" in `docs/patterns/post-page.md`. The other three each need a technique of their own, below. Everything in them that moves sits behind `prefers-reduced-motion: no-preference`, and the rules live in `src/styles/global.css` outside any layer, as `.active-nav` does, so they outrank the utilities on the same element.

## The line of ink

**Problem:** under the pointer a solid line draws over a link's dashed underline. A `text-decoration` can't draw along its length, and replacing the dashes with background layers changes how they look at rest. A background drawn at the foot of a box lands where the box ends, and that depends on the box. An inline box ends one descent (about 0.28em) under the baseline, next to the dashes. An inline-block or a flex item ends at its own bottom edge, 2 to 7px below them, and a flex item in a column runs the line the full width of its row.

**Solution:** the line is a 1px background on the inline box that carries the dashed underline. The rule keys on `[class~="decoration-dashed"]` and `.app-prose a:not(.heading-link)`, as `--dashed-decoration` does, behind `@media (hover: hover)`. At rest the box takes `padding-bottom: 2px` and a `background-size` of `0 1px` at `background-position: 100% var(--ink-y)`, with `--ink-y: calc(100% - (0.28em - 3px))`. An inline box takes the padding without moving anything, and the line then sits 4 to 5px under the baseline at every type size, on the dashes. Hovered, the size runs to `100% 1px` from the left over 300ms and the dashes fade after 120ms. Leaving runs it out to the right. Keyboard focus drops the padding and the background, so the outline keeps its box. A title has no underline at rest, so its span carries `data-ink="title"` and takes `text-decoration-line: none` while hovered, which leaves it the line alone.

Where the link is an inline-block or a flex item, its underline classes go on an inline span inside it, and the link takes `group` so the span can drop its underline under `group-focus-visible:`. `Tag.astro`, `EditPost.astro`, `Card.astro`, the Posts page's intro links and the previous and next titles in `PostDetails.astro` do this.

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

**Problem:** a labelled row's rule draws the first time the visitor scrolls to it. A border can't draw, and a scroll listener reads layout on every frame. A row already in view when the page arrives would play on load, which moves something the visitor didn't ask for.

**Solution:** each ruled row carries a bare `data-rule` in its markup: the homepage's Advisory, Featured and Recent posts rows, a post's Tags, Share and Source rows, the archive's months and `Section.astro` unless `framed`. Rules that open or close a page stay still: the Build Notes row, the pagination's, the one above the previous and next posts and the footer's. `src/scripts/rule-draw.ts`, loaded beside `theme.ts` in `Layout.astro`, holds each row's state in that attribute. It does nothing under reduced motion. Otherwise a row whose top is above the viewport's bottom edge becomes `seen`, and every other becomes `pending` and is watched by one `IntersectionObserver` (`rootMargin: "0px 0px -8% 0px"`). On entry the row becomes `run`, and a delegated `animationend` for `rule-draw` makes it `seen`. The state is also the guard that makes a second init a no-op.

The CSS holds the border transparent while a row is `pending` or `run`, and draws a `::before` at `top: -1px` with `scale` from `0 1` to `1 1` over 400ms, in `--accent` to 45% and then to `--border`. The row's direct `.label-caps` child holds the accent to 35% and returns to its own colour. Without JavaScript no row has a value, so every rule shows at rest.

The phone's menu plays the same keyframes in CSS alone, below 640px: while `#menu-items` isn't `.hidden` its border stays transparent for 400ms as its `::before` draws, and each `li` rises 6px over 280ms, 40ms after the one above. `hidden` toggles `display`, so it plays on every open. The menu has no `data-rule`, so the script ignores its `animationend`.

Anti-patterns:

- Arming a row that is in view when the page arrives, which then plays on load
- A ruled row without `data-rule`, which stays still while the rows round it draw

**When to use:** adding a ledger row ruled above, a `Section` or any other ruled block in the column.

## The icon's turn

**Problem:** an icon inside a control answers the pointer, while "One interaction behaviour" holds that no control moves. A `group-hover:` step reaches a disabled `LinkButton` too: it is a `span` resting on `text-foreground/45`, and it still carries `group`.

**Solution:** the icon moves and the control's box doesn't. The rules sit behind `@media (hover: hover)` on the shared 150ms, keyed on `a:hover`, so a disabled `LinkButton` doesn't answer. `icon-step-forward` on an arrow steps it `3px` while its link is hovered, and `icon-step-back` `-3px`: the arrows after "All posts" and "Next", and before "Prev". `icon-tilt` turns a profile or share icon `6deg`. The theme toggle's moon turns `-16deg` in the light theme and its sun `45deg` in the dark, one notch, so it ends looking as it started, on the icons' own `transition-[scale,rotate]`. The burger doesn't move. Nor does the arrow in "Steal this post →", which sits mid-sentence, where a 3px step closes the space after it.

An icon link is `inline-flex size-11 items-center justify-center interactive sm:size-8`: 44 by 44 below 640px and 32 by 32 from it. Its icon is `size-5` with `aria-hidden="true"`, its word sits in `<span class="sr-only">` as its name, and its `title` is the tooltip. `Socials.astro` and `ShareLinks.astro` read the icon from `SOCIALS` and `SHARE_LINKS` in `src/constants.ts`. Their lists are `-mx-3 flex flex-wrap sm:-mx-1.5 sm:gap-x-3`, so the icons sit 24px apart and the first icon's ink starts on the column's edge.

Anti-patterns:

- A control that moves – a rotate or translate on the link or button itself
- A step keyed on `group-hover:`, which moves the arrow of a disabled `LinkButton`

**When to use:** adding an icon inside a control, or a profile or share link.
