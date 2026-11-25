# Form fields

The calls behind these rules, and the options they rejected, are in `docs/design-decisions.md`.

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
