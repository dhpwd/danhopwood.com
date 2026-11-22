# Images and static assets

## Choosing between src/assets and public

**Problem:** two directories serve images and the wrong choice costs either build-time optimisation or a stable URL.

**Solution:**

- `src/assets/images/` – Astro optimises these at build time: WebP conversion, cache-busting filenames, dimensions that prevent layout shift. Import the file and render it with `<Image />` from `astro:assets`. Post images and the avatar live here
- `public/` – served byte-for-byte with no processing. Use it only for assets referenced by a URL string that has to stay stable: `favicon.png`, `apple-touch-icon.png` and the Pagefind index the build copies in

**When to use:** adding or replacing any image or icon.

## Captions

**Problem:** markdown has no caption syntax. The obvious workaround, an image `title` (`![alt](src "caption")`), puts the caption outside the markdown pipeline: its text never reaches remark, so it can carry no markup and its quotes stay straight where the surrounding prose gets curly ones. Every other markdown renderer reduces it to a hover tooltip, which matters here because the repo is public and posts are read as raw markdown on GitHub.

**Solution:** write the caption as an italic line directly beneath the image, with no blank line between the two. `src/utils/remarkFigureCaptions.ts` merges that pair into `<figure>`/`<figcaption>`:

```markdown
![Alt text describing the image for screen readers](../../assets/images/example.png)
_The caption, which can carry **emphasis**, `code` and [links](/posts/example)._
```

The caption is ordinary markdown, so the whole pipeline applies to it: smart punctuation, emphasis, inline code and links all work. The plugin leaves the image node itself alone, so a captioned image is optimised exactly like an uncaptioned one – see `docs/patterns/astro-build.md` for why that constrains how the plugin is written.

Alt text and caption do different jobs, so write both: alt describes the image for screen readers, the caption is prose everyone reads. To opt out, put a blank line between the image and the italic line – a standalone emphasised paragraph is never captioned. Emphasis written alongside an image on the same line stays inline prose, so only a genuine line break makes a caption.

**When to use:** adding a caption to a post image.

## Save screenshots at 2×

**Problem:** a post image opens at full size on a click, a tap, Enter or Space (`ImageZoom.astro` – see "Figures" in `docs/patterns/post-page.md`). The dialog sizes the image on the rule that a screenshot is saved at twice its on-screen size: it shows the image at half its pixel width, so its text reads at the size it was captured, and never less than one and a half times what the page shows. A screenshot saved at 1× opens at no more than its own pixel width, so on a desktop its text gets little larger than on the page.

**Solution:** save screenshots and diagrams at 2×, the default on a Retina or other high-density screen. The page itself shows the image at the column's width whatever its source size, since Astro generates the smaller widths in the `srcset`.

**When to use:** adding a screenshot or diagram to a post.

## Diagrams

**Problem:** a diagram saved as a PNG with no source can't follow a palette change, and one drawn in another palette is the one image on the page that isn't the site's.

**Solution:** a diagram drawn for a post is an HTML file in `scripts/diagrams/`, named after its PNG in `src/assets/images/`. Its fonts are embedded, so the render needs no network. Every colour is a variable in one `:root` block that mirrors the light-mode tokens by hand – see "Theme tokens have three hand-written mirrors" in `docs/patterns/design-system.md`. Headless Chrome renders it at 2×, from the repo root, with the command in the file's header:

```bash
google-chrome --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
  --force-device-scale-factor=2 --virtual-time-budget=8000 \
  --window-size=1200,<height> \
  --screenshot=src/assets/images/<name>.png \
  "file://$PWD/scripts/diagrams/<name>.html"
```

Commit the source and the PNG together.

- The page is 1200 CSS pixels wide by default. A 2400 pixel image opens in the dialog at 1200 CSS pixels, so its text shows at the size it was drawn. Another width needs a reason
- The window's height is the value the file's script writes to `<body data-h>`. Read it in a browser at a 1200 pixel viewport once the page has loaded (`document.body.dataset.h`, through the Playwright MCP), and record it in the file's header. Chrome's `--dump-dom` is not a reliable way to read it: it often returns the page before the script has run
- A re-render keeps the PNG's pixel size, so the post's layout doesn't move
- One light image serves both themes. The dark theme dims it like any image – see "Figures" in `docs/patterns/post-page.md`

Anti-patterns:

- A diagram exported from a drawing tool, with no source in the repo
- A colour written into a rule in place of a variable in the `:root` block

**When to use:** adding or redrawing a diagram for a post, or changing a theme token a diagram mirrors.

## Favicons

**Problem:** satori resolves no CSS custom properties, so the favicon generator cannot read the brand tokens and carries its own copy of their values.

**Solution:** `pnpm generate:favicons` renders the "dh" monogram in Geist Mono on the accent, hand-mirroring the light-mode `--accent` and `--background` values. Changing either token means editing the script and regenerating – see `docs/patterns/design-system.md`.

**When to use:** changing the accent or background token, or replacing the favicon.
