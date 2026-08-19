# Images and static assets

**Problem:** two directories serve images and the wrong choice costs either build-time optimisation or a stable URL.

**Solution:**

- `src/assets/images/` – Astro optimises these at build time: WebP conversion, cache-busting filenames, dimensions that prevent layout shift. Import the file and render it with `<Image />` from `astro:assets`. Post images and the avatar live here
- `public/` – served byte-for-byte with no processing. Use it only for assets referenced by a URL string that has to stay stable: `favicon.png`, `apple-touch-icon.png` and the Pagefind index the build copies in

**Captions come from an italic line under the image.** `src/utils/remarkFigureCaptions.ts` merges an image and an italic line written directly beneath it – no blank line between the two – into `<figure>`/`<figcaption>`:

```markdown
![Alt text describing the image for screen readers](../../assets/images/example.png)
_The caption, which can carry **emphasis**, `code` and [links](/posts/example)._
```

The caption is ordinary markdown, so the whole pipeline applies to it: smart punctuation, emphasis, inline code and links all work. An image `title` (`![alt](src "caption")`) is the obvious alternative and the wrong one – its text never reaches remark, so quotes stay straight and markup is impossible, and every other markdown renderer reduces it to a hover tooltip. That matters here because the repo is public and posts are read as raw markdown on GitHub.

The plugin rewrites the mdast and sets `hName` rather than emitting raw HTML, which leaves the node a genuine `image`. Astro's own collection and optimisation passes then run over it exactly as they do over an uncaptioned image – WebP, responsive `srcset` and all.

Alt text and caption do different jobs, so write both: alt describes the image for screen readers, the caption is prose everyone reads. To opt out, put a blank line between the image and the italic line – a standalone emphasised paragraph is never captioned. Emphasis written alongside an image on the same line stays inline prose, so only a genuine line break makes a caption.

**Favicons are generated, not drawn.** `pnpm generate:favicons` renders the "dh" monogram in Geist Mono on the teal accent, hand-mirroring the light-mode `--accent` and `--background` values because satori resolves no CSS custom properties. Changing either token means editing the script and regenerating – see `docs/patterns/design-system.md`.

**When to use:** adding or replacing any image or icon.
