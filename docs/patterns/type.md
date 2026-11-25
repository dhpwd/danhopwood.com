# Type

The calls behind these rules, and the options they rejected, are in `docs/design-decisions.md`.

## Three treatments

**Problem:** two typefaces are in play, so per-component font choices drift. A new component that hand-picks a face, a size or a link style breaks the visual system and nothing in the build flags it.

**Solution:** every piece of text takes one of three treatments, each with a fixed style. Pick the treatment and use its shared style – new work adds no face, size or tracking of its own.

- **Prose** – Geist, via `font-app` and the body default. Links carry dashed underlines (`decoration-dashed underline-offset-4`), the site's signature, at body weight. A post's tags are words with the dashed underline. The share row and the footer's profile links are icons – see "Profile and share links are icons" in `docs/design-decisions.md`
- **Titles** – Geist at 600 with balanced wrapping, from the global `h1`–`h6` rule in `global.css`. Three `@utility` blocks there set the scale: `title-hero` for the homepage's headline only, fluid between 32px and 44px, `title-page` for every other page's `h1`, fluid between 30px and 40px, and `title-item` for a card title or a section heading. In-post headings take the sizes `typography.css` sets – see "Reading measure" in `docs/patterns/post-page.md`. The prose plugin's own heading weights (800, 700, 600) outrank the global rule, so `typography.css` restates the weight and tracking on `.app-prose h1` to `h4`
- **Mono** – Geist Mono, for the site name, labels, the eyebrow, dates and metadata, via an explicit `font-mono` or a shared utility. `eyebrow` is the small mono accent line above a page's title. `meta` is the same line in the text colour at 75%, for dates, reading times, counts and the pagination line. `label-caps` is the small uppercase label for a group, with `text-foreground/75` where the label is muted. UI state markers such as `.active-nav` use solid underlines, not dashed

Nav links are Geist at 500 (`font-medium`), not mono.

Text inside a diagram takes the parts in `Diagram.astro` at the sizes they set, from 12px mono labels and 14px text to 20px names – see `docs/patterns/diagrams.md`.

The share cards set their titles through `titleStyle` in `src/utils/og-templates/shared.js`, which restates `title-page`'s weight, line-height and tracking by hand at card scale. A change to the title treatment updates it too.

Pagefind's results on `/search` can't take the utilities either, so four flat `#pagefind-search …` rules in `search.astro` restate them: the count line in `meta`'s values, result titles in `title-item`'s at weight 600, nested titles at 16px and weight 500, and excerpts at 15px. Pagefind sizes a nested result's link at 0.9em of its title, so the nested rule sets the link as well. Without them Pagefind sets a result title at weight 700 and an excerpt at 12.8px. A change to `meta` or `title-item` updates those rules too.

Both faces load through Astro's experimental fonts API (Google provider, configured in `astro.config.ts`, preloaded by `<Font>` in `Layout.astro`) at weights 400/500/600/700, from one variable file per family. A new weight in that range loads nothing new.

Anti-patterns:

- A mono heading – `font-mono` on a title, or in the global heading rule. Mono runs about a fifth wider, so a long title has to drop a size at 390 to wrap as well
- A title sized by hand (`text-2xl font-bold sm:text-3xl`) in place of `title-page` or `title-item`

## Don't compensate for the muted underline

The dashed underline is the link signal on its own. `--dashed-decoration` in `global.css` mutes it to 45% of the current colour on purpose, because full-strength 1px dashes read as noise. Its base rule keys on the `decoration-dashed` class rather than on `a`, so an underline drawn on a span inside a link, like a `/tags` row's name, is muted too. Adding weight or colour to make links stand out defeats the treatment: at `strong`'s weight an emphasised phrase and a link become indistinguishable.

`typography.css` sets `font-normal` on `.app-prose a` for this reason. `@tailwindcss/typography` defaults links to 500, so removing that override restores a weight nobody chose and nothing in the build warns you. Post titles in `Card.astro` are titles and stay at 600 – the 400 rule is for prose links only.

## No italics

No italic Geist face is loaded. Semantic emphasis (`em`, blockquotes) renders as browser-synthesised oblique, which is accepted. Decorative italics were removed rather than adding a face to carry them.

**When to use:** any new component or restyle.
