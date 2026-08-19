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

## Favicons

**Problem:** satori resolves no CSS custom properties, so the favicon generator cannot read the brand tokens and carries its own copy of their values.

**Solution:** `pnpm generate:favicons` renders the "dh" monogram in Geist Mono on the teal accent, hand-mirroring the light-mode `--accent` and `--background` values. Changing either token means editing the script and regenerating – see `docs/patterns/design-system.md`.

**When to use:** changing the accent or background token, or replacing the favicon.
