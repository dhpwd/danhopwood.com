# Design decisions

The design calls already settled, each with the options it rejected. Read this before proposing a visual, layout, colour or motion change. A proposal that reopens a call here needs a reason the entry doesn't already answer. How each call is built lives in the pattern files under `docs/patterns/` that the pattern index in `CLAUDE.md` routes to.

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

At rest, the accent appears only on the mono line above a page's title (the `eyebrow`), the one filled action, prose marks (list markers and the blockquote rule), the active nav item, the current chapter's time while the setup page's walkthrough plays (the active nav item's counterpart), the week chosen on the setup page's chart of merged PRs (the same counterpart – see "A chart is a diagram with one switch") and the reading progress bar. A drawn diagram's level labels take it too – see "A diagram is ink, with the accent on its level labels". Hover, press and focus use it on every control, except that text fields focus in the text colour. A row's rule and label take it for under 400ms as the visitor scrolls to the row, which is motion, not rest – see "Small details are a closed set".

Rejected: frames, status chips, link titles and search result titles in the accent. Each reads as an error or a warning in a red.

## Text fields focus in the text colour

A focused field takes a `--foreground` border and ring. The accent stays on the action.

Rejected: an accent focus, which reads as a validation error round a field.

## The Open chip is an ink outline

"Open" on `/cloud-box-setup` is a 60% text-colour border with text in the text colour. "Held" and "Taken" sit on `--muted`.

Rejected: the accent, which reads as a warning, and a green, which adds a second semantic colour.

## The setup page's video opens as two windows

The walkthrough on `/cloud-box-setup` sits under the title block as two stills cut from the take, a laptop window and a phone window, with an ink play control and a row of chapters. The laptop window is the app's window from its top edge down, at about 16:10, and the phone window is the phone's screen. The first time the windows are in view, a five-second preview cut from the same moment plays once in each and ends on the stills. Pressing play swaps them for the full recording in the browser's own player, which widens past the column from 72rem. `Walkthrough.astro` builds it.

Rejected:

- The take as one still frame, which brings the desktop's wallpaper and window chrome onto the page
- A third-party player, each of which brings its own loading state
- A play control filled with the accent, a second filled accent action
- A looping preview
- A custom player
- The laptop window at 3:2, which takes in the top of the camera bubble in the take's lower right

## An offer page's questions open on a tap

A ruled list of questions, each at the body size in the heading weight on the 1.3 line height `title-item` gives headings, with its answer opening on a tap through the browser's own `<details>`. The questions wrap with `text-wrap: pretty` rather than the site's `balance`, since in a left-aligned list of longer questions balance breaks a line early for no visible reason, where pretty fills each line and still avoids a lone last word. All are closed on arrival, and several can be open at once. A mono `+` marks a closed question and a `−` an open one, swapped with no animation. The answers stay in the page's HTML for screen readers, agents and the Markdown twin. `Questions.astro` builds it.

Rejected:

- Every answer open under its question, which takes too much of a phone's height with ten answers
- A scripted accordion, where the native element needs no script
- A chevron that turns, which adds a motion to the closed set of small details
- The `Detail` part, whose label is uppercase mono and unreadable at a question's length
- A `FAQPage` node in the JSON-LD graph, which nobody has asked for

## Titles are Geist at 600

Page, post and card titles and in-post headings are Geist at 600 on the shared scale. Geist Mono stays on the site name, labels, the eyebrow, dates and metadata.

Rejected: mono headings throughout. Mono runs about a fifth wider, so a long title has to drop a size at 390 to wrap as well.

## Share-card titles are Geist

The title on the site card and each post card is Geist at 600, matching the page titles. The cards' other text keeps its own faces and sizes.

Rejected: Geist Mono 700 titles, which left the cards the one place a title stayed mono.

## One interaction behaviour

Every control moves one colour step on hover and one more on press, on 150ms with a decelerating curve. Filled buttons also settle 1px on press. An icon inside a control may turn or step under the pointer while the control itself never moves: an arrow steps 3px, a profile or share icon tilts and the theme toggle's icon turns one notch. Reduced motion keeps the colour steps and drops the settle and the icon's movement.

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

A mono accent line, the headline, the rest of its sentence and a short paragraph, with the portrait beside them as a rounded tile. Below a rule, Build Notes, advisory and the cloud box setup sit as three ledger rows. At 390 the portrait is a small tile on a row with the mono line, and the headline, the signup and the advisory line fit one screen. The post lists follow.

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

Posts, About and Search, then the toggle. Tags and Archives are reached from the Posts page, and Posts is the active item on both. On a phone the links sit behind a burger as a plain list. The burger is named "Menu" for screen readers when open and closed, with `aria-expanded` for the state, and turns to a cross while the menu is open. It is a taste call made on renders. The theme toggle is named "Dark theme" for screen readers in both themes, with `aria-pressed` for the state and its icons hidden. A new destination joins the `NAV` list in `Header.astro`, whose `sections` say which paths make it the active item.

Only a click on the toggle stores the theme, and a stored theme holds when the system's colour scheme changes. A visitor who never clicks follows the system, live and on every visit, and nothing is stored for them. A visitor who has clicked can't go back to following the system short of clearing site data.

Rejected:

- Five destinations in the header, and icons for them. As words they read as a blog theme's navigation and leave no room for another at 390
- A second header row of links on a phone, which takes about 44px from the homepage's first screen
- The three links shown in the phone's header in place of a button. On the header's row they leave 8px between them at 375 wide, and on a row of their own they put the advisory link below the first screen at 390 by 844
- A burger beside a mono "Menu", which keeps the label visible, the close second
- The mono "Menu" word alone
- A burger whose name changes to "Close" when open, which states the state twice
- A theme toggle whose name changes with the theme ("Switch to dark theme" / "Switch to light theme"), which keeps the name in the script and needs a live region to be heard
- A third "follow the system" state on the toggle, which would give a visitor who clicked a way back but changes the toggle's look and name
- Applying a system change to an open page after a pick without storing it. The next full load reads the stored pick and flips back

## Profile and share links are icons

The footer's profile links and the share row after a post are icons alone, from one outline family in the text colour, with the colour step on hover and press. Each link keeps its word as its name for screen readers and its `title` as a tooltip, with a 44 by 44 target on a phone and 32 by 32 from 640px, as the theme toggle has. A post's tags stay words with the dashed underline. Icons alone are a taste call made on renders.

Rejected:

- An icon beside each word. The label stays visible, which usability guidance asks for beside an icon, at the cost of the busiest row on the page
- Words alone, the calmest, with a one-letter link ("X") 9px wide
- A 44 by 44 target at every width, which stands the share row 12px taller than the rows beside it at 1440

## The RSS link sits in the footer's row

Last, after the profile links, so it is on every page.

Rejected: under the Posts title, which reaches one page.

## Body text is 17px on a 28px line and a 38rem measure

About 68 characters a line at 1440. Figures, tables and code keep the full column.

Rejected: a larger size at the full column, since 18px still runs to about 82 characters.

## Every list's text starts 1.625em in, with the browser's markers inside the column

Every bulleted and numbered list, in posts, on the About page and on the page parts, starts its text 1.625em (27.6px) in from the text above it, with wrapped lines under the text. The browser places each marker before the text at its own gap, and every marker sits inside the column, never left of the paragraphs' edge. 1.625em is the smallest indent at which a two-digit numeral and the page parts' mono steps stay inside it, which holds a prose list of up to 99 items and nine steps in a page part. How it is built is in `docs/patterns/lists.md`. The lists inside a diagram (steps, chips, devices and sessions) are drawn parts outside this rule – see `docs/patterns/diagrams.md`.

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

`filter: brightness(0.88)`, which brings an image's white down to about the text colour. The full-size view shows the image as it was saved. The setup page's stills, its walkthrough's previews and its picker stills take the same dim (`dark-dim`). Its playing walkthrough doesn't.

Rejected: no filter, which leaves a white screenshot as the brightest thing on the page.

## A diagram is ink, with the accent on its level labels

A diagram drawn for a post or a page is ink on the page's ground. Titles and filled boxes are the text colour in both themes, flat, with no gradient or shadow. Lines and panels are greys mixed from the text colour. Connectors clear the 3:1 that WCAG asks of graphics, in both themes. The accent appears only on the diagram's level labels, the small mono label that heads each level or section, as the mono line above a page's title heads the page. The chart of merged PRs has one other use: its chosen week's bar – see "A chart is a diagram with one switch". A level's number and the diagram's other mono text, such as a card's role line, take a grey.

Rejected:

- Ink only, which leaves nothing of the site's own in the diagram
- Brick fills on the filled boxes, which are large red blocks and read as a warning
- Brick on one connector, which is a hairline at the size the page shows it
- A palette other than the site's
- A raised dark surface for filled boxes in the dark theme, which makes the filled box read like the outlined one beside it

## A diagram is drawn in the page

A diagram in a post or on a page is drawn as a component on the theme tokens, at the page's text size, with real colours in both themes and no full-size view. A post's diagram is its image's drawing at a readable size: centred lead cards with their labels to the left, a half disc where a line meets a card, and labels beside their lines. On a phone it stacks, with a rail down the left from each level to the next. The cloud box diagram and the setup page's diagram run across at the full column. How it is built is in `docs/patterns/diagrams.md`.

Known cost: height. With its caption the agent team diagram is 1352px tall at 1440 and 2386px at 390, where the image was 862px and 457px. The setup page's diagram, which has no caption, is 315px tall at 1440 and 566px at 390.

Rejected:

- An image, whose text shrinks with the column and which the dark theme can only dim
- A second image for the dark theme
- Connectors drawn by script, which show nothing until the script runs
- A drawing wider than the text column
- The cloud box diagram running top to bottom at the full column, which leaves the top of the drawing mostly empty
- Labels placed on their lines

## A chart is a diagram with one switch

The setup page's chart of merged PRs a week is drawn in the page as a diagram, in ink: the weeks before the move to the server in grey, the weeks since in the text colour. The accent sits on its two level labels, and on a bar only under the pointer or while its week is chosen. A chosen week keeps the accent after the pointer leaves, since on a phone a tap leaves no focus and nothing else would mark the week. The chart has one switch, between weighted PRs and PRs, a line above the plot that reads out a week, and a flat line across each period at its average. Its figures are fixed weekly rows from pr-pace, the open-source tool the page credits under the chart. `PrPaceChart.astro` builds it – see "A chart" in `docs/patterns/diagrams.md`.

Rejected:

- pr-pace's HTML report embedded, which brings its own styles and carries private repo names and PR titles into a public repo
- A charting library
- Bars in the accent, which are large red blocks at rest
- A chosen bar resting in ink, which leaves nothing marking the week on a phone
- A floating tooltip, which needs positioning and answers a pointer, a tap and the keyboard differently
- An animated redraw, which would join the closed set of small details
- The report's 4-week moving average, which turns the step at the move into a four-week ramp
- The report's other controls (date range, periods, splits, the repo filter, summary tiles) and its PR list

## Motion answers the visitor

Motion runs only in response to something the visitor does, lasts 400ms or less, is hand-rolled rather than a library and is removed under `prefers-reduced-motion: reduce`.

The one exception is the walkthrough's preview on `/cloud-box-setup`, which plays once, without sound, for five seconds the first time it is in view, and is removed under reduced motion.

## Small details are a closed set

The site carries five small details that answer the visitor, for the whole site rather than per page. The set is closed. Later work adds a detail only by replacing a member, with an entry here. How the last three are built is in `docs/patterns/small-details.md`.

1. Selected text, search matches and the phone's tap flash share the accent tint
2. A post's image opens at full size on a click, a tap, Enter or Space. Rejected: a link to the image file, which leaves the site, and a sideways-scrolling figure, which loses the overview
3. Links ink in. Under the pointer a solid 1px line in the link's colour draws over the dashed underline from the left, and leaves to the right. A post title, which has no underline at rest, gets the line alone. On a phone the tap flash answers the tap
4. The page rules itself. The first time the visitor scrolls to a labelled row, its rule draws across in the accent and dries to the border colour, and its label with it. A row already in view on arrival stays still. On a phone, opening the menu draws its rule and lifts its rows
5. Icons answer the pointer. An arrow steps 3px, a profile or share icon tilts, the moon tilts and the sun turns one notch, and the control itself never moves – see "One interaction behaviour". On a phone the theme toggle's morph answers a tap

The reading progress bar, the theme toggle's icon morph and the copy button's "Copied" label predate the set and sit outside it, and so do the walkthrough's widening and its preview on `/cloud-box-setup`, which belong to one part on one page.

Rejected:

- Titles of posts the visitor has read resting in grey (`:visited`). The author sees every title grey in their own browser
- Every rule in the column drawing, which draws five lines in a row at the end of a post
- A line that thickens under the pointer. The line is 1px in every state
- A caret after the site name, which reads as an engineer's blog
- The portrait tilting under the pointer
- A theme change wiping across the page, against "A theme change flips every colour in one frame" in `docs/patterns/colour.md`
- The line above a title typing itself, or its count running up

## Not adopted

Openings that hide the headline, scroll hijacking, 3D objects, cursor trails or particles, holographic gradients and stock illustration.
