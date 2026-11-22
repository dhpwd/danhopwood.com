# Lists

How a bulleted or numbered list is indented, in posts and on the page parts. The call behind it, and the options it rejected, are in `docs/design-decisions.md`.

## One indent for every list

**Problem:** a bulleted or numbered list brings its own indent. The prose plugin pads a list 1.625em and each item another 0.375em, and a part written with a padding of its own (`pl-5`) lands somewhere else, so lists on two pages, or in two sections of one page, start their text on different lines. Placing markers by hand doesn't fix it: a padding sized to each marker's width needs a rule per marker kind and per digit count, and still misplaces numerals in a list that starts above 1 or counts down.

**Solution:** the `list-indent` utility in `global.css`. A list's padding is 1.625em and its items have none, so every item's text starts 1.625em (27.6px at the 17px body size) in from the text above, with wrapped lines under the text. The browser hangs each marker in that padding at its own gap before the text, right-aligned to it. No marker is positioned by hand.

- `.app-prose ul` and `ol` take it in `typography.css`, so every list in a post and on the About page has it. A nested list repeats it from its parent item's text
- `MarkedList.astro` takes it for the page parts, numbered or bulleted

```astro
<ul class="list-disc list-indent marker:text-accent">…</ul>
```

1.625em is the smallest indent that keeps every marker's ink inside the column. The widest markers are a two-digit body numeral and the setup page's mono steps at 15px. In Chromium a disc's ink starts 10px in from the paragraphs' edge, a one-digit numeral 11px, a two-digit numeral 1px ("40.") and a mono step 1px ("2."). Firefox puts a disc at 13px and "40." on the edge. At 1.5em the two-digit numerals and the mono steps reach 1–2px into the margin. The indent is in em because a marker scales with its list's font size, so the indent keeps holding it at another size. A three-digit numeral would reach past the edge, and no list on the site comes near a hundred items.

`typography.css` sets tabular figures on a prose list's numerals, so the one-digit numerals share a width and line up. Safari before 27.3 applies only `color` and `font-size` to `::marker`, so there `MarkedList`'s steps fall back to the body face and prose numerals lose their tabular figures. The narrower glyphs right-align to the text all the same, so they sit further inside the column.

Anti-patterns:

- A padding of its own on a list (`pl-5`, `padding-inline-start: 1.5em`), which gives that list its own text edge
- A marker positioned by hand: the list padded to the marker's width with the rest on the item, or a rule for items ten and up
- Markers hung outside the column (`padding-inline-start: 0`), which a phone's 16px gutter cuts off and which read as sitting too far left

**When to use:** adding a list to a page or a part, or changing how lists are styled.
