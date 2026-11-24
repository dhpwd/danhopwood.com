# Lists

How a bulleted or numbered list is indented, in posts and on the page parts. The call behind it, and the options it rejected, are in `docs/design-decisions.md`.

## One indent for every list

**Problem:** a list brings its own indent – the prose plugin's 1.625em plus 0.375em on each item, or a part's own `pl-5` – so lists on two pages start their text on different lines. Placing markers by hand needs a rule per marker kind and per digit count, and still misplaces the numerals of a list that starts above 1.

**Solution:** the `list-indent` utility in `global.css`. A list's padding is 1.625em and its items have none, so every item's text starts 1.625em (27.6px at the 17px body size) in from the text above, with wrapped lines under the text. The browser hangs each marker in that padding at its own gap before the text, right-aligned to it. No marker is positioned by hand.

- `.app-prose ul` and `ol` take it in `typography.css`, so every list in a post and on the About page has it. A nested list repeats it from its parent item's text
- `MarkedList.astro` takes it for the page parts. Its mono steps are sized in em (15px at 17px), so they scale with the indent

```astro
<ul class="list-disc list-indent marker:text-accent">…</ul>
```

1.625em is the smallest indent that keeps every marker's ink inside the column in Chromium and Firefox. The closest are a two-digit numeral ("40.") and a mono step ("2."), 0–1px inside the edge, and at 1.5em they reach 1–2px into the margin. The indent is in em because a marker scales with its list's font size. It holds two-digit numerals and nine mono steps. A three-digit numeral, or a tenth step ("10.", 36px wide in mono), reaches past the edge, and no list on the site comes near either. To check where markers land, measure every digit a list can show (a 99-item fixture), since a "1" has the most space beside it.

`typography.css` sets tabular figures on prose numerals so they line up. Safari before 27.3 applies only `color` and `font-size` to `::marker`, so there the mono steps and the tabular figures fall back to narrower glyphs, which sit further inside the column.

Anti-patterns:

- A padding of its own on a list or an item (`pl-5`, `padding-inline-start: 1.5em`), which gives it its own text edge
- A marker positioned by hand: the list padded to the marker's width with the rest on the item, or a rule for items ten and up
- Markers hung outside the column (`padding-inline-start: 0`), which a phone's 16px gutter cuts off and which read as sitting too far left

The lists inside a diagram (steps, chips, devices and sessions) are drawn parts outside this rule – see `docs/patterns/diagrams.md`.

**When to use:** adding a list to a page or a part, or changing how lists are styled.
