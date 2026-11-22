# Lists

How a bulleted or numbered list is indented, in posts and on the page parts. The call behind it, and the options it rejected, are in `docs/design-decisions.md`.

## One indent for every list

**Problem:** a bulleted or numbered list brings its own indent. The prose plugin sets a bullet 10px in from the paragraphs with its text at 34px, and a part written with a padding of its own (`pl-5`) lands somewhere else again, so lists on two pages, or in two sections of one page, start their text on different lines. A browser also hangs a marker off the left of its item, wherever the item starts, and not on the paragraphs' edge, so a padding picked by eye leaves the marker somewhere between that edge and the text.

**Solution:** the `list-edge` utility in `global.css`. The marker sits on the left edge of the text above the list and every item's text starts 1.75rem (28px) in, with wrapped lines under the text. It splits the indent in two: the list's padding is the marker's width, which puts the marker's left edge on the text's edge, and each item's padding is the rest of the 1.75rem. `--list-marker` holds the marker's width. It defaults to 1.055em, the width of a disc's box and of one body-face numeral with its full stop and space ("1. ") in tabular figures, which `typography.css` sets on a prose list's numerals so each one has that width.

- `.app-prose ul` and `ol` take it in `typography.css`, so every list in a post and on the About page has it. A nested list repeats the rule from its parent item's text
- `MarkedList.astro` takes it for the page parts. Its ordered form sets `[--list-marker:1.6875rem]`, three mono characters at the marker's 15px

```astro
<ul class="list-disc list-edge marker:text-accent">…</ul>
```

A two-digit numeral is one tabular figure (0.588em) wider than the list's padding. `typography.css` starts a prose list's tenth item, and each one after it, a figure further in and takes the figure back from its padding, so the numeral stays on the edge and the text at 1.75rem. The rule counts items, so in a list that starts above 1 (`start="8"`) the first two-digit numeral reaches a figure into the margin. `MarkedList`'s mono numerals hold nine steps.

Firefox draws a disc 3.5px further in than Chromium does, inside the same padding, so a bullet sits just inside the edge there. Numerals match.

Anti-patterns:

- A padding of its own on a list (`pl-5`, `padding-inline-start: 1.5em`), which gives that list its own text edge
- Markers hung outside the column (`padding-inline-start: 0`), which a phone's 16px gutter cuts off

**When to use:** adding a list to a page or a part, or changing how lists are styled.
