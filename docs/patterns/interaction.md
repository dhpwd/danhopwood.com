# Interaction

The calls behind these rules, and the options they rejected, are in `docs/design-decisions.md`.

## One interaction behaviour

**Problem:** every control needs a hover, a press and a focus state, on one timing. Written per component, they drift: one control fades, another rotates, a third has no press and each picks its own duration.

**Solution:** each control moves one colour step on hover and one more on press, from the `@utility` blocks in `global.css`.

- `interactive`, for text and icon controls: the text steps to `accent` on hover and `accent-strong` on press. Icon SVGs stroke `currentColor`, so an icon follows its anchor's colour with no rule of its own. An icon link is `icon-link`, with its word in an `sr-only` span as its name and a `title` as its tooltip, and an icon that turns or steps under the pointer follows "The icon's turn" in `docs/patterns/small-details.md`. `LinkButton.astro` applies it, so every enabled `LinkButton` has it, and a disabled one rests on `text-foreground/45`. Each question's `summary` in `Questions.astro` takes it too, with `cursor-pointer`, since the base `cursor: pointer` rule covers buttons but not `summary`
- `interactive-fill`, for filled accent buttons: the fill steps to `accent-strong` on hover and `accent-stronger` on press, only while the button is enabled, and the button settles 1px on press. `Button.astro` carries it, and every filled action is a `Button`: Subscribe in `NewsletterSignup.astro` and Request setup in `cloud-box-setup.astro`. The label is `text-background`, never `text-white`: white on the dark accent is 2.61:1. `disabled:opacity-60` dims the button while a submit is pending, and disabled controls are exempt from the contrast minimum
- `interactive-ink`, for the one filled control in the text colour, the walkthrough's play control in `Walkthrough.astro`: it rests on `bg-foreground` with a `text-background` label, steps to `accent` on hover and `accent-strong` on press, and settles 1px on press as a filled button does, so the accent shows on it only under the pointer and on press. Its label measures 14.63:1 at rest in light theme and 13.24:1 in dark, then the table's "Button label at rest" and "on hover" rows on hover and press. The windows above it step it too, through `peer-hover/windows` and `peer-active/windows`, since a click on them presses it. Its label is mono at the labels' 13px and weight 500, set on the control because `meta` carries a colour the fill can't take and `label-caps` would set "Play" in capitals
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

Text inside a control that sets its own colour doesn't inherit the control's steps. The count on a `/tags` row is `meta`, and the "Previous post" and "Next post" labels are `label-caps text-foreground/75`, so each takes `interactive-inner`, which steps its colour on its link's hover and press. The link carries `group`.

Focus: links, buttons, `[role="button"]` elements and disclosure summaries take the base rule's 2px dashed accent outline, so a post's images, which `ImageZoom.astro` makes buttons, need no outline of their own. Fields focus differently – see "Form fields" in `docs/patterns/form-fields.md`.

Reduced motion keeps the colour steps and drops the motion: the press settle is `motion-safe:`, the theme toggle's icons morph with `transition-[scale,rotate] motion-reduce:transition-none`, and `html` takes `motion-safe:scroll-smooth` in `global.css`. `global.css` drops every view-transition animation under reduced motion, outside any layer: Astro adds its own copy of that rule only to pages that use a `transition:` directive, and the router swaps in the incoming page's head, so a page without one would run the browser's default cross-fade.

Anti-patterns:

- A bare `hover:text-accent`, with no press and no timing. Use `interactive`
- The steps written out on text inside a control (`transition-colors group-hover:text-accent group-active:text-accent-strong`) in place of `interactive-inner`. A change to the steps misses that copy
- `hover:bg-accent-hover` on a filled button. The `accent-hover` colour no longer exists, and Tailwind generates nothing for an unknown colour, so copied code loses its hover and nothing warns you. Use `interactive-fill`
- A hover that moves the control, like `hover:rotate-6` or `hover:-mt-0.5`
- An opacity fade, on hover or at rest (`hover:opacity-75`, `opacity-90` on an icon or a filled button). A fade blends the control with the page behind, so it lowers contrast where a step raises it: `opacity-90` takes a filled button's label from 6.93:1 to 5.70:1 in light theme. And a fade is not a step of the one behaviour
- `transition-all`, which also animates layout and any property added later
- A duration or easing class on a component (`duration-200`, `ease-out`), which drifts from the shared timing
- The base rule's focus styles restated on an element in `focus-visible:` classes of its own. A change to the base rule then misses that element and nothing warns you. Add the element to the base selector in `global.css`. The outline `.app-prose pre` in `typography.css` sets for a code block is not a restatement: it differs from the base rule (no offset, and its border hidden)

**When to use:** any new interactive element, and any AstroPaper component being restyled.

## Status messages

**Problem:** a script that reports how an action went ("Copied", a form's success line) has to reach a screen reader without moving focus. Making the control the live region, with `aria-live` on the button, announces every change to its text, so the label's return to its resting text is spoken too, and screen readers announce a control used as a live region inconsistently. A screen reader also announces changes only to a live region it already knows about, so a region the script adds can miss its first message.

**Solution:** put the message in a separate `role="status"` element rendered in the component's markup, empty at load (WCAG 2.2 SC 4.1.3, technique ARIA22). `role="status"` is a polite live region with `aria-atomic` implied, so the message is read whole each time it changes, and removing it is not announced. The script empties the element before each action and writes the result after it, so a result identical to the last one can be announced again. Where the result follows the clear within moments, as for Copy, whether the repeat is announced depends on timing. The element is visible where nothing else on screen shows the result, as under the form in `NewsletterSignup.astro` and under the submit button, inside the form, in `cloud-box-setup.astro`. It is `sr-only` where the control's own label already shows it, as for a post's code-block Copy button – see "After the article" in `docs/patterns/post-page.md`, which also covers when that region empties.

Anti-patterns:

- `aria-live` on a button, link or field
- A status element the script creates, or one given its `role` only when the message is written

**When to use:** any script that tells the visitor how an action went without moving focus.

## Pagefind's controls

**Problem:** `/search` is Pagefind's markup, so Tailwind utilities can't reach its controls. Its stylesheet is unlayered and resets every element inside it with `all: unset` and `outline: revert`, which beats the base focus rule in `@layer base`, so its controls don't get the site's focus outline either.

**Solution:** `/search` takes the same behaviour as plain CSS in the `#pagefind-search` block of `search.astro`, with the transition timed from `var(--default-transition-duration)` and `var(--default-transition-timing-function)`. Result links and Clear step to `var(--accent)` on hover, inside `@media (hover: hover)` as Tailwind's `hover:` variant is, and to `var(--accent-strong)` on press. Result links, a post's title and each section match, take the line of ink as titles from `global.css` – see "The line of ink" in `docs/patterns/small-details.md` – and their resting decoration colour from `--dashed-decoration` in `search.astro`. The `a` in the ink's `#pagefind-search a.pagefind-ui__result-link` outranks the transition rule in `search.astro`, which is unlayered too, so the ink's transition list wins whatever the file order. On a touch screen, which keeps `:hover` after a tap, result links drop Pagefind's hover underline, as a card title answers only a pointer that can hover. "Load more results" rests on `var(--foreground)` with a 60% text-colour border and steps its text and border the same way. Clear and "Load more results" take the 2px dashed accent focus outline. Rules there may nest: the build lowers nesting for older browsers ("Nested CSS and the CSS build target" in `docs/patterns/astro-build.md`).

**When to use:** any change to the search page's styles.
