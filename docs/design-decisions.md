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

At rest, the accent appears only on the mono line above a page's title (the `eyebrow`), the one filled action, prose marks (list markers and the blockquote rule), the active nav item and the reading progress bar. Hover, press and focus use it on every control.

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

The title on the site card and each post card is Geist at 600, matching the page titles. The cards' other text stays as it is.

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

## Motion answers the visitor

Motion runs only in response to something the visitor does, lasts 400ms or less, is hand-rolled rather than a library and is removed under `prefers-reduced-motion: reduce`.

## Small details are a closed set

The site carries one or two small details that answer the visitor, for the whole site rather than per page. The set is empty today. A detail joins it by an entry here, with what it answers.

## Not adopted

Openings that hide the headline, scroll hijacking, 3D objects, cursor trails or particles, holographic gradients and stock illustration.
