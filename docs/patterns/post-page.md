# Post page composition

`PostDetails.astro` renders the article and everything after it. Five decisions in there look arbitrary from the code alone.

**The newsletter signup sits directly after `<Content />`, above the first rule.** It is the primary call to action, so it comes before the tags, share links and post navigation rather than joining them below the divider.

**There is no back-to-top button.** The fixed reading progress bar at the top of the article covers the same need. `BackToTopButton.astro` is left over from the theme and is wired to nothing.

**`addHeadingLinks()` is scoped to `#article`.** Broadening the selector puts anchor links on headings outside the article body, such as the newsletter card and post navigation.

**The share icon row carries `md:-ml-2`.** The icons' own padding would otherwise push the first one right of the "Share this post on:" label above it. The row is centred on mobile, where the alignment doesn't apply.

**Repeated furniture carries `data-pagefind-ignore`.** `<main>` is the `data-pagefind-body`, so anything rendered inside it on every post is indexed with each post, and a search for its text matches them all. Pagefind ignores CSS, so a `hidden` element is indexed too. The newsletter card and the post navigation carry the attribute on their root element.

**When to use:** changing what appears after the article body, or the furniture around it.
