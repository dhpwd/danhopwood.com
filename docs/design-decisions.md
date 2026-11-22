# Design decisions

The design calls already settled, each with the options it rejected. Read this before proposing a visual, layout, colour or motion change. A proposal that reopens a call here needs a reason the entry doesn't already answer. How each call is built lives in `docs/patterns/design-system.md`.

## The accent is brick

`#a13124` in light theme (`oklch(0.48 0.15 30)`) and `#e6867a` in dark (`oklch(0.72 0.12 28)`). Both clear WCAG AA as text on their ground and as the ground for a `text-background` label, at about 6.9:1.

The dark value stays redder than Anthropic's coral `#D97757`, which sits about 11° of hue away. If the dark value is tuned, keep it on the red side of that gap.

Rejected:

- Teal `#0f766e` – about 3° of hue from Fidero's accent, so the two sites read as one
- Iris `#4a44b3` – the most common colour in software products
- Plum `#842d5c` – the close second, but pink in the dark theme
- Ochre `#865901` – reads as brown in small text at AA contrast on white

## The dark ground is a warm near-black

`#1b1614` for the page, `#2c2522` for surfaces and `#3c3532` for borders, so the dark theme carries the accent's warmth.

Rejected: neutral `#1a1a1a`, which has nothing of the site's own in it.

## The accent at rest is a closed list

At rest, the accent appears only on the mono line above a page's title (the `eyebrow`), the one filled action, prose marks (list markers and the blockquote rule), the active nav item and the reading progress bar. A drawn diagram's level labels take it too – see "A diagram is ink, with the accent on its level labels". Hover, press and focus use it on every control, except that text fields focus in the text colour.

Rejected: frames, status chips, link titles and search result titles in the accent. Each reads as an error or a warning in a red.

## Text fields focus in the text colour

A focused field takes a `--foreground` border and ring. The accent stays on the action.

Rejected: an accent focus, which reads as a validation error round a field.

## The Open chip is an ink outline

"Open" on `/cloud-box-setup` is a 60% text-colour border with text in the text colour. "Held" and "Taken" sit on `--muted`.

Rejected: the accent, which reads as a warning, and a green, which adds a second semantic colour.

## Titles are Geist at 600

Page, post and card titles and in-post headings are Geist at 600 on the shared scale. Geist Mono stays on the site name, labels, the eyebrow, dates and metadata.

Rejected: mono headings throughout. Mono runs about a fifth wider, so a long title has to drop a size at 390 to wrap as well.

## Share-card titles are Geist

The title on the site card and each post card is Geist at 600, matching the page titles. The cards' other text keeps its own faces and sizes.

Rejected: Geist Mono 700 titles, which left the cards the one place a title stayed mono.

## One interaction behaviour

Every control moves one colour step on hover and one more on press, on 150ms with a decelerating curve. Filled buttons also settle 1px on press. Reduced motion keeps the colour steps and drops the settle.

Rejected:

- A hover that rotates or lifts the control
- An opacity fade, which lowers contrast where a step raises it
- A press that only settles, which leaves no press under reduced motion

## Selected text and search matches sit on the accent tint

Selected text, Pagefind's search matches and the phone tap flash share one tint, the accent at 20%, with the text in the text colour, well clear of AA in both themes.

Rejected: a solid accent selection. With `bg-accent/75` and `text-background` it measured 4.07:1 in light theme and 4.34:1 in dark, under AA, and reads as an error highlight.

## Code blocks keep the vitesse themes

`vitesse-light` and `vitesse-dark`, set in `astro.config.ts`. On the warm dark ground, `vitesse-dark`'s `#121212` reads as an inset well.

Rejected: warming the code ground, which needs `!important` over shiki's inline styles.

## The homepage's first screen

A mono accent line, the headline, the rest of its sentence and a short paragraph, with the portrait beside them as a rounded tile. Below a rule, Build Notes and advisory sit as two ledger rows. At 390 the portrait is a small tile on a row with the mono line, and the headline, the signup and the advisory line fit one screen. The post lists follow.

Rejected: a type-led composition with the portrait as a byline and the boxed signup, which at 1440 ends the first screen on the "Featured" label with no post in view.

## The homepage's headline is its h1

"Building Fidero entirely with AI agents" is the page's only `h1`, with the rest of the sentence directly under it, so the two read as one.

Rejected: a visually hidden name as the `h1`, which leaves the page's largest line outside the heading outline.

## One layout for every labelled list: the ledger

A mono label in an 8.5rem left column with its content beside it, and above it on a phone. The homepage's rows, the post lists, the archive's months and the rows after a post all use it. On a post list the date sits in the label column. Everywhere else the date is a line above the title, as on the post page.

Rejected:

- Sections under label headings at the full column, which leaves a description at about 92 characters a line
- Restyling each page's list on its own
- The date under the title

## Every title block is a mono accent line, then the title

On a list page the line holds its count or label ("n posts", "Tag · n posts", "n tags", "404"), and on a post its date. Counts are data and labels, so they need no copy. The homepage's line is its tagline. There is no breadcrumb and no stock description line under the title.

Rejected: a breadcrumb, which is a second kind of mono line above a title on a site two levels deep.

## The header is three words and the theme toggle

Posts, About and Search, then the toggle. Tags and Archives are reached from the Posts page, and Posts is the active item on both. On a phone the links sit behind a mono "Menu" button as a plain list. A new destination joins the `NAV` list in `Header.astro`, whose `sections` say which paths make it the active item.

Rejected:

- Five destinations in the header, and icons for them. As words they read as a blog theme's navigation and leave no room for another at 390
- A second header row of links on a phone, which takes about 44px from the homepage's first screen

## Icon rows are dashed text links

The share row, the footer's links and a post's tags are words with the dashed underline.

Rejected: icon rows, which are the theme's.

## The RSS link sits in the footer's row

Last, after the profile links, so it is on every page.

Rejected: under the Posts title, which reaches one page.

## Body text is 17px on a 28px line and a 38rem measure

About 68 characters a line at 1440. Figures, tables and code keep the full column.

Rejected: a larger size at the full column, since 18px still runs to about 82 characters.

## Every list's text starts 1.625em in, with the browser's markers inside the column

Every bulleted and numbered list, in posts, on the About page and on the page parts, starts its text 1.625em (27.6px) in from the text above it, with wrapped lines under the text. The browser places each marker before the text at its own gap, and every marker sits inside the column, never left of the paragraphs' edge. 1.625em is the smallest indent at which a two-digit numeral and the page parts' mono steps stay inside it, which holds a prose list of up to 99 items and nine steps in a page part. How it is built is in `docs/patterns/lists.md`.

Rejected:

- An indent for each kind of list, as the prose plugin and the page parts had, which starts lists on different lines
- Markers hanging outside the column, in the margin, which read as too far left and which a phone's 16px gutter cuts off
- Markers pinned to the paragraphs' edge with the text 28px in, which leaves a bullet 22px from its words and needs a rule per marker kind
- 1.5em, at which a two-digit numeral and the mono steps reach 1–2px into the margin

## A narrow image sits on the left edge, with its caption inside its width

An image narrower than the column shows at its own width on the column's left edge, and its caption wraps within the image's width.

Rejected: centring the image, which leaves a left-aligned caption overhanging it on both sides, and centring the caption with it, which breaks the left edge every other block in a post keeps.

## A table's rows become labelled blocks on a phone

Below 640px each row is a block, and each cell after the first carries its column heading as a mono label. The labels are set at build, so they are there before any script runs.

Rejected: sideways scroll inside the table, which hides a prose table's first column.

## The dark theme dims a post's images

`filter: brightness(0.88)`, which brings an image's white down to about the text colour. The full-size view shows the image as it was saved.

Rejected: no filter, which leaves a white screenshot as the brightest thing on the page.

## A diagram is ink, with the accent on its level labels

A diagram drawn for a post is ink on the page's ground. Titles and filled boxes are the text colour, flat, with no gradient or shadow. Lines and panels are greys mixed from the text colour, and card borders take the share cards' rule grey. Connectors clear the 3:1 that WCAG asks of graphics, in both themes. The accent appears only on the diagram's level labels, the small mono label that heads each level or section, as the mono line above a page's title heads the page. A level's number and the diagram's other mono text, such as a card's role line, take a grey. One light image serves both themes, dimmed in the dark theme like any image.

Known drawbacks: in the dark theme the labels are the light theme's brick on a dimmed plate, beside the page's lighter accent. A change to the accent means re-rendering each diagram.

Rejected:

- Ink only, which leaves nothing of the site's own in the diagram
- Brick fills on the filled boxes, which are large red blocks and read as a warning
- Brick on one connector, which is a hairline at the size the page shows it
- A second image for the dark theme, which needs a way to swap images by theme
- A palette other than the site's

## Motion answers the visitor

Motion runs only in response to something the visitor does, lasts 400ms or less, is hand-rolled rather than a library and is removed under `prefers-reduced-motion: reduce`.

## Small details are a closed set

The site carries two small details that answer the visitor, for the whole site rather than per page. The set is filled. Later work adds a detail only by replacing a member, with an entry here.

1. Selected text, search matches and the phone's tap flash share the accent tint
2. A post's image opens at full size on a click, a tap, Enter or Space. Rejected: a link to the image file, which leaves the site, and a sideways-scrolling figure, which loses the overview

The reading progress bar, the theme toggle's icon morph and the copy button's "Copied" label predate the set and sit outside it.

## Not adopted

Openings that hide the headline, scroll hijacking, 3D objects, cursor trails or particles, holographic gradients and stock illustration.
