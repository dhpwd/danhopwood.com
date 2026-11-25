# Interaction

The calls behind these rules, and the options they rejected, are in `docs/design-decisions.md`.

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

Focus: links, buttons, `[role="button"]` elements and disclosure summaries take the base rule's 2px dashed accent outline, so a post's images, which `ImageZoom.astro` makes buttons, need no outline of their own. Fields focus differently – see "Form fields" in `docs/patterns/form-fields.md`.

Reduced motion keeps the colour steps and drops the motion: the press settle is `motion-safe:`, the theme toggle's icons morph with `transition-[scale,rotate] motion-reduce:transition-none`, and `html` takes `motion-safe:scroll-smooth` in `global.css`. `global.css` drops every view-transition animation under reduced motion, outside any layer: Astro adds its own copy of that rule only to pages that use a `transition:` directive, and the router swaps in the incoming page's head, so a page without one would run the browser's default cross-fade.

Anti-patterns:

- A bare `hover:text-accent`, with no press and no timing. Use `interactive`
- `hover:bg-accent-hover` on a filled button. The `accent-hover` colour no longer exists, and Tailwind generates nothing for an unknown colour, so copied code loses its hover and nothing warns you. Use `interactive-fill`
- A hover that moves the control, like `hover:rotate-6` or `hover:-mt-0.5`
- An opacity fade, on hover or at rest (`hover:opacity-75`, `opacity-90` on an icon or a filled button). A fade blends the control with the page behind, so it lowers contrast where a step raises it: `opacity-90` takes a filled button's label from 6.93:1 to 5.70:1 in light theme. And a fade is not a step of the one behaviour
- `transition-all`, which also animates layout and any property added later
- A duration or easing class on a component (`duration-200`, `ease-out`), which drifts from the shared timing
- The base rule's focus styles restated on an element in `focus-visible:` classes of its own. A change to the base rule then misses that element and nothing warns you. Add the element to the base selector in `global.css`. The outline `.app-prose pre` in `typography.css` sets for a code block is not a restatement: it differs from the base rule (no offset, and its border hidden)

**When to use:** any new interactive element, and any AstroPaper component being restyled.

## Pagefind's controls

**Problem:** `/search` is Pagefind's markup, so Tailwind utilities can't reach its controls. Its stylesheet is unlayered and resets every element inside it with `all: unset` and `outline: revert`, which beats the base focus rule in `@layer base`, so its controls don't get the site's focus outline either.

**Solution:** `/search` takes the same behaviour as plain CSS in the `#pagefind-search` block of `search.astro`, with the transition timed from `var(--default-transition-duration)` and `var(--default-transition-timing-function)`. Result links and Clear step to `var(--accent)` on hover, inside `@media (hover: hover)` as Tailwind's `hover:` variant is, and to `var(--accent-strong)` on press. Result links, a post's title and each section match, take the line of ink as titles from `global.css` – see "The line of ink" in `docs/patterns/small-details.md` – and their resting decoration colour from `--dashed-decoration` in `search.astro`. The `a` in the ink's `#pagefind-search a.pagefind-ui__result-link` outranks the transition rule in `search.astro`, which is unlayered too, so the ink's transition list wins whatever the file order. On a touch screen, which keeps `:hover` after a tap, result links drop Pagefind's hover underline, as a card title answers only a pointer that can hover. "Load more results" rests on `var(--foreground)` with a 60% text-colour border and steps its text and border the same way. Clear and "Load more results" take the 2px dashed accent focus outline. Rules there may nest: the build lowers nesting for older browsers ("Nested CSS and the CSS build target" in `docs/patterns/astro-build.md`).

**When to use:** any change to the search page's styles.
