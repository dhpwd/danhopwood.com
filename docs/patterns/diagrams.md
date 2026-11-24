# Diagrams

A diagram in a post is drawn in the page as an Astro component on the theme tokens, not saved as an image. The calls behind it, and the options they rejected, are in `docs/design-decisions.md`: "A diagram is ink, with the accent on its level labels" and "A diagram is drawn in the page".

## A diagram is a component built from shared parts

**Problem:** a diagram saved as an image is one size and one theme. On a phone its text is a few pixels tall, the dark theme can only dim it, and its words aren't text.

**Solution:** each diagram is a component in `src/components/diagrams/`, built on `Diagram.astro`, and the post that shows it is an `.mdx` file that imports it (see "Posts that embed a component" below). `Diagram.astro` renders `<figure class="diagram not-prose">`: a visually hidden paragraph holding its `summary` prop, then the drawing, then a `<figcaption>` when its `caption` slot is filled. A diagram component wraps its drawing in `Diagram` and passes its own default slot on as the caption, so a post writes the caption as the tag's content:

```mdx
<AgentTeam>
  Who reports to whom. Everything below me runs on one server.
</AgentTeam>
```

The figure takes the full column and is a size container (`container: diagram / inline-size`), with 14px text on a 1.45 line. `Diagram.astro`'s `<style is:global>` block holds the parts every diagram is drawn from, so they load only on a page that has a diagram. Each diagram's scoped `<style>` places them.

- `dg-level` heads a level or zone in the accent, with its number in a grey `<span>`. `dg-label` is the same label in grey. Both are mono at 12px, weight 500, uppercase and tracked 0.04em, the status chip's size
- `dg-mono` is 13px mono, for a literal string
- `dg-card` has a 1px border, a 0.375rem radius and the page's ground behind it. `dg-tint` tints it, `dg-strong` gives it the connector grey as its border and `dg-fill` fills it with the text colour
- `dg-name` is 17px at 600, and `dg-name-lg` makes it 20px
- `dg-chip` is a chip, `dg-frame` a 1px dashed frame at a 0.75rem radius and `dg-tag` the words on a connector, 13px in a 1px border at a 0.75rem radius
- `dg-wires` is an SVG of connectors, unfilled with a 1px stroke, whose `.end` paths fill as half discs. `dg-end` is a 7 by 4px half disc on its own, for the end of a line drawn in CSS

Type sizes, the whole list: 12px (the two mono labels), 13px (connector labels, chips, steps, processes and literal strings), 14px (text), 15px at 600 (a closing box's title), and 17px and 20px (names and the frame's heading). Every colour is a theme token or a custom property on `.diagram` that mixes `--foreground` into `--background`. Each mix is opaque, so two lines that cross paint one colour:

| Property                                 | Mix                                               | Used for                                              |
| ---------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| `--dg-text`                              | 82%                                               | Text                                                  |
| `--dg-note`                              | 75%                                               | Labels, notes and the words on a connector            |
| `--dg-wire`                              | 60%                                               | Connectors, their half-disc ends and the outlined box |
| `--dg-frame`                             | 32%                                               | The dashed frame                                      |
| `--dg-dot`                               | 25%                                               | Step dots and the rule between them                   |
| `--dg-border`                            | 16%                                               | Card borders                                          |
| `--dg-chip`                              | 7%                                                | Chips                                                 |
| `--dg-tint`                              | 4%                                                | A tinted card                                         |
| `--dg-fill`, `--dg-on-fill`              | `--foreground`, `--background`                    | A filled box and its names, in both themes            |
| `--dg-on-fill-text`, `--dg-on-fill-line` | `--background` at 84% and 32% into `--foreground` | A filled box's text and inner borders                 |

The accent appears only in `dg-level`, as the `eyebrow`'s counterpart inside a diagram. A filled box is the text colour in both themes. A diagram adds no colour or type size of its own: a new need is a new part in `Diagram.astro` and a line here.

The parts sit outside the cascade layers, which is what lets `.diagram :where(p, ul, ol, li, strong)` outrank the `.app-prose` rules in `typography.css` that give prose text the text colour and lists the `list-indent` padding. They set their type directly rather than through the shared utilities, since a component's `<style>` can `@apply` only after an `@reference` to `global.css`.

A diagram has no full-size dialog. Its text is the page's size already, and `ImageZoom.astro` binds `#article img` only.

Tailwind's scan stays on for `src/components/diagrams/`. It reads the `@container` at-rule in their style blocks as a class and adds one unused rule, `.\@container{container-type:inline-size}`, to the global stylesheet. `@source not` on the folder would drop that rule, and would also stop Tailwind generating any utility a diagram is the first to use.

Anti-patterns:

- A diagram exported as an image, or rendered to a PNG from a standalone HTML page. It shrinks with the column and the dark theme can only dim it
- A colour literal, or a rule per theme. The mixes follow the theme on their own
- A fixed-size drawing scaled down to the column, which shrinks its text as an image does

**When to use:** drawing or changing any diagram in a post.

## Connectors on a fixed grid

**Problem:** a connector has to meet its card and the line it continues on the same pixel. A line placed by a percentage or by a `calc()` of its own lands where its own sum rounds, a pixel off the line it continues, and a layout that flexes gives no fixed numbers to draw on.

**Solution:** the layout follows the figure's own width by container query, never the viewport. The default is stacked, for a phone: each level is its label over its cards, a rail down the left joins one level to the next, and the words about that step sit to the rail's right. From 46rem the figure is the column's full, fixed width (736px), and the second layout sits on a grid in px. A diagram may add a step between the two where the stacked layout has room, as the agent team diagram does at 30rem.

Wherever the layout is a fixed size, connectors are SVG drawn on the grid's own numbers: one `svg.dg-wires` per row, its `viewBox` the row's size in px. Lines sit on half-pixel coordinates, so a line down the centre of a card at x 355 is drawn at x 355.5 and its 1px stroke fills one column of pixels. Every line is 1px, and every line that meets a card ends there in a half disc of radius 3.5, flat against the card's edge, drawn in the row's `.end` path. An arrow's head and shaft are one path, so the head sits on its shaft. A line whose length follows the text, such as the spine past a note that wraps, is a 1px CSS line at the same integer x as the SVG's line, with a `dg-end` where it meets a card. `AgentTeam.astro` is the worked example: its constants name every x and each row's height, and its paths are built from them.

The words on a connector sit beside its line, 14px clear of it, never on it. Connectors take `--dg-wire`, which clears the 3:1 WCAG asks of graphics in both themes.

Anti-patterns:

- A connector placed by a percentage or a `calc()` of its own, which lands a pixel off the line it continues
- A translucent line colour, which darkens where two lines cross
- A fractional line width, which blurs across two columns of pixels
- A connector drawn by script, which shows nothing until the script runs

**When to use:** drawing a connector, or adding a layout step to a diagram.

## Words for a reader who can't see the layout

**Problem:** a screen reader, site search and the page's Markdown twin read a diagram's words in source order, and can't see who sits under whom.

**Solution:** the words are real elements in reading order, with no `h2` to `h6`. A heading would take an anchor from `addHeadingLinks()` and join the post's outline, so a diagram uses `p`, `strong` and lists. A number is followed by a real space, so a level label reads "01 Founder" rather than running on. Decorative parts (lines, half discs, the trunk) are `aria-hidden`. The `summary` says what the drawing shows that its words alone can't. Where a diagram replaces an image, it is the image's alt text. A diagram has no script, so it is drawn before any script runs and needs nothing rebound after a client-side navigation.

The Markdown twin keeps `.sr-only` text and drops `svg` and `aria-hidden` parts (`DROP` in `src/utils/markdownTwins.ts`), so a post's twin carries the summary and then the diagram's words in reading order.

Reading time is left as computed. `src/utils/readingTime.ts` reads the post's source, where a diagram is one tag, so moving an image's alt text into a component lowers it: the cloud box post went from 8 to 7 minutes. Counting a diagram's words was rejected, since no image's words were ever counted.

**Anti-pattern:** a heading element in a diagram.

**When to use:** writing a diagram's words, summary or caption.

## Posts that embed a component

**Problem:** a `.md` post can only render Markdown and raw HTML, so it can't show an Astro component.

**Solution:** `@astrojs/mdx`. `mdx()` sits in `astro.config.ts`'s `integrations` after `sitemap()` and before `markdownTwins()`, which stays last. It takes no options: MDX inherits the `markdown` config, so the caption, table and image-size plugins and the shiki themes apply to an `.mdx` post as to a `.md` one. The blog loader's glob is `**/[^_]*.{md,mdx}`, and `src/utils/getPostModDates.ts` reads both extensions.

- A post is `.mdx` only when it embeds a component. Its imports go directly after the frontmatter
- Renaming a post from `.md` to `.mdx` keeps its URL, since the post's id drops the extension. Rename with `git mv`, then delete `node_modules/.astro/data-store.json` before building – see "Stale content from Astro's content store" in `docs/patterns/astro-build.md`
- MDX fails the build on a bare `{` or `<` in prose. Escape it (`\{`, `\<`) so the rendered text is unchanged
- MDX renders a post's other images through Astro's `Image` component, which gives them different hashed file names and adds `style="--fit: cover; --pos: center;"`. Their alt, `sizes`, dimensions, `srcset` widths and captions come out as from a `.md` post

MDX was chosen over raw HTML in the `.md`, which puts the drawing's markup in the post and its styles in the global stylesheet, and over a markdown plugin that swaps an image for a fragment, which keeps the image as a second copy and can't render an Astro component.

**When to use:** embedding a component in a post, or converting a post to `.mdx`.

## Checking a diagram

Run each step on `pnpm build && pnpm preview`, in Playwright, at both themes. The methods are in `docs/patterns/browser-testing.md`.

1. Where the diagram replaces an image, compare its words with the image's source, word for word and in reading order
2. Measure every text at 4.5:1 or more and the connector colour at 3:1 or more, from computed colours composited onto their ground
3. Load the post at every width from 320 to 1440. Nothing scrolls sideways, no text runs wider than its part, and the figure switches to its fixed grid where it reaches 46rem
4. Crop every band of connectors at 1x, 2x and 3x and enlarge each crop without smoothing. Each line is one sharp pixel wide at 1x, no line is offset from the line it continues, no junction is darker than its lines, every line that meets a card ends in a half disc and each arrowhead sits on its shaft
5. Reach the post by a client-side navigation from the homepage, and check the diagram is styled on arrival
6. Read the post's Markdown twin: the summary, then the diagram's words in reading order, and no image line

**When to use:** finishing any change to a diagram.
