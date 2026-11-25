# Page layout

The calls behind these rules, and the options they rejected, are in `docs/design-decisions.md`.

## The title block

**Problem:** every page opens with a title, and a page that composes its own opening drifts from the rest – a breadcrumb on one, a description line on another, a different gap above the title on a third.

**Solution:** one title block on the list pages, posts, the About page and `/404`: an optional `eyebrow` line, then the `h1` in `title-page`, 0.75rem apart, with 2.25rem above (3.5rem from 640px). `Main.astro` renders it from `pageTitle`, `eyebrow` and an `intro` slot for one line under the title, which the Posts page uses for its Tags and Archives links and `/404` for its link home. `titleTransition` names the title's view transition, so a tag's title morphs from the tag link that led to it. On these pages the eyebrow holds data or a label, never copy: a count ("n posts", "Tag · n posts"), a code ("404") or a post's date line. `PostDetails.astro` keeps the same block by hand, with `<Datetime tone="eyebrow" />` above the title, and `AboutLayout.astro`'s `main` takes the same top padding.

Two openings keep the accent line above the title but are composed on their own terms. The homepage's first screen puts its tagline in the eyebrow and sets the headline in `title-hero` – see "The homepage's first screen" in `docs/design-decisions.md`. `PageIntro.astro`, which opens a page built from the setup page's parts, keeps that page's spacing, with the eyebrow and title 1.25rem apart, and adds an opening paragraph on the reading measure.

Anti-patterns:

- A breadcrumb, which is a second kind of mono line above a title
- A description line under the title that restates it ("All the tags used in posts.")

**When to use:** any new page or layout.

## The ledger

**Problem:** the site has many labelled lists – the homepage's rows, the post lists, the archive's months, the rows after a post. Set as sections under full-width label headings, each list's text runs the full column, and each page ends up styling its list its own way.

**Solution:** the `ledger` utility in `global.css`. One column on a phone, with the label above its content. From 640px, two columns, `8.5rem minmax(0, 1fr)`, with the label on the left and its content beside it, 2rem apart and aligned on their first baselines. An `inline-block` takes its baseline from its last line, so a link that can wrap at the top of a row's content (a card's title) is `block w-fit`, or the label lines up with its last line. Not `inline-flex`: it takes the first baseline too, but only a wrapped title loses the 1px the line box adds below it, so one-line and wrapped titles end up spaced differently. A labelled row ruled above is `LedgerRow.astro`. It renders the `ledger` element with `border-t border-border`, its `label` as the first child in `label-caps text-foreground/75`, and the row's content from its slot. The label is an `h2`, or an `h3` with `level={3}` (the months under a year on `/archives`). `as="section"` renders a `section` in place of the `div`, and any other attribute, such as an `id`, passes through to it. The row carries a bare `data-rule`, so the rule draws as the visitor scrolls to it – see "The rule that draws" in `docs/patterns/small-details.md` – and `draw={false}` leaves it off a row that opens a page. The label stays a direct child of the row, which the drawn rule's label animation keys on. Padding comes from the caller's `class`, since the rows differ: `py-5` on a post's rows, `py-6` on the homepage's lists and the archive's months, and `mt-6 pt-6` on Advisory. Lists inside a row space their items with `gap`, never a margin on the item.

```astro
<LedgerRow as="section" id="recent-posts" label="Recent posts" class="py-6">
  <ul class="flex flex-col gap-7">…</ul>
</LedgerRow>
```

`<Card aside />` makes a post card a ledger row of its own: the date line in the label column, with one item a line, and above the title on a phone. It has no rule, so it is a plain `ledger`. A card in a list that already has a label puts the date above the title instead. `NewsletterSignup variant="row"`, `ShareLinks.astro` and `EditPost.astro` each render their own row through `LedgerRow`.

The anti-pattern is a ruled row written out (`ledger border-t border-border` with its own label and `data-rule`). A change to the row's rule, label or drawn line misses that copy.

Prose and long lines take `max-w-measure` (38rem), the reading measure – see "Reading measure" in `docs/patterns/post-page.md`.

**When to use:** any labelled list or group of rows.

## Page parts

**Problem:** a page that is neither a list nor a post – an offer or a form – composes its own sections, cards and lists. Written inline, its classes become page constants that the next such page copies and changes.

**Solution:** build it from the parts `/cloud-box-setup` is made of, in `src/components/`: `PageIntro`, `Section`, `Panel`, `Detail`, `MarkedList`, `StatusChip`, `Field` and `Button`. Each uses the shared styles by name, so the page needs no class constants of its own. A part that a new page needs and the set lacks joins `src/components/` rather than the page.

**When to use:** building a new page that isn't a list or a post.
