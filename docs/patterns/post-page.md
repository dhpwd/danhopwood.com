# Post page composition

`PostDetails.astro` renders a post's title block, the article and everything after it. The prose styles are `.app-prose` in `src/styles/typography.css`, which the About page shares. The calls behind this page are in `docs/design-decisions.md`.

## Title block

The date line sits above the title, as the mono accent line does on every page: `<Datetime tone="eyebrow" />`, then the `h1` in `title-page`, with the same gap and top padding as `Main.astro`'s title block – see "The title block" in `docs/patterns/design-system.md`. The date reads `21 Nov 2026`, or `Updated 8 Aug 2026` once `modDatetime` is later than `pubDatetime`.

## Reading measure

**Problem:** at the column's full 736px, body text runs about 92 characters a line, well past a comfortable measure. Raising the size to fill the column still leaves 18px at about 82.

**Solution:** `.app-prose` sets body text at 1.0625rem (17px) on `line-height: calc(28 / 17)`, a 28px line, so every line box and every paragraph's height is a whole number of pixels. Its direct `p`, `ul`, `ol`, `h2` to `h6`, `blockquote` and `details` take `max-w-measure` (38rem, 608px), which comes to about 68 characters a line. Figures, tables, code blocks and a paragraph holding an image keep the full column, so a screenshot or a table is as wide as the page allows. `h2` is 1.5rem at 1.25 and `h3` 1.25rem at 1.3.

The rule takes direct children only (`> :where(…)`), so text nested in a table cell or a `blockquote` keeps the width of its container.

A list's text starts 1.625em in, with each marker inside the column, from the `list-indent` utility – see `docs/patterns/lists.md`.

## Tables

**Problem:** a three-column table at 390 leaves each column about 120px, and a sideways-scrolling table hides its first column, which is usually the one that names the row.

**Solution:** tables are ruled rows with no outer box and no vertical rules: column headings in `label-caps` at 75% over a rule in the text colour at 60%, rows ruled in `--border`, text at 0.9375rem. Below 640px each row becomes a block, the heading row is visually hidden (`sr-only`), and each cell after the first prints its column heading above it from `data-label`, through `content: attr(data-label)`.

`src/utils/rehypeTableLabels.ts`, registered in `markdown.rehypePlugins`, sets that `data-label` on every body cell from the heading above it. It also sets the ARIA table roles (`table`, `rowgroup`, `row`, `columnheader`, `cell`) on every table element, because a browser drops a table's semantics once its rows and cells are `display: block`, and a screen reader then reads the cells without their rows and columns. Setting both at build means the labels are there before any script runs, and without JavaScript at all.

**When to use:** changing the table styles, or writing a table into a post. A table needs a heading row for its cells to be labelled on a phone.

## Figures

An image keeps its 1px border and radius and fills the column. An image narrower than the column shows at its own width on the column's left edge, under the text, rather than centred. A caption sits 0.75rem under its image, from the image's left edge, in `text-sm` at 75%, and wraps at the image's width or the reading measure, whichever is narrower. The figure takes its image's width (`w-fit`) and the caption sets `contain: inline-size`, so a long caption can't widen the figure past a narrow image. A figure has 2.25rem above and below. Captions are written as described in `docs/patterns/images.md`.

In the dark theme `.app-prose img` takes `filter: brightness(0.88)`, which brings an image's white down to about the text colour, so a screenshot is never the brightest thing on the page.

`ImageZoom.astro`, rendered once after `<main>`, opens a post's image at full size. On `astro:page-load` every `#article img` becomes a button (`tabindex="0"`, `role="button"`) that opens a native `<dialog>` on a click, Enter or Space. The dialog fills the screen on the theme's ground and holds the image in a scrolling container, so a larger image starts at its top left and pans. It shows the image at `max(natural / 2, min(natural, 1.5 × shown))` CSS pixels wide: a screenshot is saved at twice its on-screen size, so half its pixel width shows its text at the size it was captured, and never less than one and a half times what the page shows. The dialog sits outside `.app-prose`, so its image is unfiltered. Escape, "Close" and a click beside the image close it, and a click on the image doesn't, because a phone pans by dragging it. The browser returns focus to the image on close. The dialog fades in over the shared 150ms, and not at all under reduced motion.

The image itself is the button, rather than a `<button>` wrapped round it, because a wrapper changes the prose margins round every image.

## After the article

**The newsletter signup sits directly after `<Content />`, above the first rule.** It is the primary call to action, so it comes before the rows below it.

**Then three ledger rows, each ruled above, with `h2` labels in `label-caps` at 75%:** Tags, Share and Source. Each tag and share link is a dashed text link. `EditPost.astro` renders the Source row whole, so a post with `hideEditPost` shows no empty label. Then "Previous post" and "Next post" in a two-column grid, each a `label-caps` label over the post's title at weight 500.

**A share link's `name` is the Plausible event's `platform` value.** `ShareLink.label` in `src/constants.ts` overrides the text shown where the two differ: "Mail" shows as "Email" and is still sent as `Mail`. Changing a `name` breaks the per-platform breakdown – see `docs/external-services.md`.

**There is no back-to-top button.** The fixed reading progress bar at the top of the article covers the same need. `BackToTopButton.astro` is left over from the theme and is wired to nothing.

**`addHeadingLinks()` is scoped to `#article`.** Broadening the selector puts anchor links on headings outside the article body, such as the newsletter card and the row labels.

**Only the title, article and tags are indexed.** `data-pagefind-body` sits on the `<h1>`, `<article>` and the tag list, not on `<main>` or the rows round them, so the row labels stay out. Anything rendered on every post – the date line, the newsletter card, the share and edit links, the post navigation – would otherwise be indexed with each post, and a search for its text would match them all. A new element on the post page stays out of search unless it gets the attribute. Pagefind ignores CSS, so a `hidden` element inside a body element is indexed.

Anti-patterns:

- Icon rows for the tags or share links, and the `md:-ml-2` that pulled the first share icon back under its label. The rows are words in the ledger, which aligns them
- A margin on a card or row to space a list, in place of `gap` on the list

**When to use:** changing a post's title block, body, tables, figures or what follows the article.
