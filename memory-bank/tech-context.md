# Tech context

## Stack

- **Framework:** Astro with AstroPaper v5.5.1 theme
- **Styling:** TailwindCSS
- **Package manager:** pnpm
- **Search:** Pagefind (static, built-in)
- **Hosting:** Vercel (deployed, `danhopwood.com` custom domain configured)
- **Analytics:** Plausible (cloud-hosted, privacy-friendly, no cookie banner)

## Project structure

```
src/
├── assets/images/       # Images (Astro optimises these)
├── data/blog/           # Blog posts as markdown
├── components/          # Astro components
├── layouts/             # Page layouts
├── pages/               # Route pages
├── styles/              # CSS
├── config.ts            # Site configuration
├── constants.ts         # Constants
└── content.config.ts    # Content collection schema
public/                  # Static assets (favicon, OG image)
```

## Built-in features (no work needed)

Dark/light mode, RSS + sitemap, pagefind search, draft posts, dynamic OG image generation, SEO tags, pagination.

## Reading time

Computed on-demand from `post.body` (raw markdown) using the `reading-time` npm package. Utility at `src/utils/readingTime.ts` returns formatted string (e.g. "5 min read"). Called in `Card.astro` (post list) and `PostDetails.astro` (post header), passed to `Datetime.astro` via `readingTime` prop. Not stored in schema – computed at build time per page.

## Images

- **`src/assets/images/`** – optimised by Astro at build time (WebP, cache-busting, CLS prevention). Import and render with `<Image />` from `astro:assets`
- **`public/`** – served as-is, no processing. Use for favicon, OG images referenced by URL string. Current assets: `favicon.jpeg`, `og-image.png`
- Avatar lives at `src/assets/images/avatar.jpeg`

## Buttondown integration

Implemented as `src/components/NewsletterSignup.astro`. Embedded in `PostDetails.astro` and `AboutLayout.astro`. POST to `https://buttondown.com/api/emails/embed-subscribe/dhpwd`. Tags subscribers with `website` via hidden input. Has `compact` prop for layout variants.

Form submits via JS fetch with inline success/error messages (no page redirect). Hidden `embed=1` input required by Buttondown's embed API. Falls back to standard form POST if JS fails. Metadata fields (e.g. first name) can be added later via `name="metadata__<key>"` inputs.

Buttondown is backend infrastructure – no public-facing Buttondown URLs anywhere on the site.

## Share links

Defined in `src/constants.ts` as `SHARE_LINKS: ShareLink[]`. Each entry has a `buildHref(pageUrl, pageTitle?)` function that constructs the platform-specific share URL with proper encoding. `ShareLinks.astro` accepts an optional `title` prop passed from the post layout. Platforms: X (with `via=dhpwd`), LinkedIn, WhatsApp, Telegram, Email, Facebook.

## Post page footer

`Footer.astro` accepts `stealThisPost` boolean prop. When true (post pages only), replaces the copyright line with "Steal this post → CC BY 4.0 · Code MIT" linking to the GitHub repo. Blog content is CC BY 4.0; code is MIT.

## Theme tokens

AstroPaper uses CSS custom properties mapped to Tailwind via `@theme inline` in `src/styles/global.css`:

`bg-background`, `text-foreground`, `bg-accent`, `bg-muted`, `border-border`

## Plausible Analytics

Script and init added to `src/layouts/Layout.astro` `<head>`. The `async` attribute on the script tag implies `is:inline` in Astro (any attribute besides `src` triggers this), so the tag renders as-is. No Partytown needed – Plausible's script is ~1KB.

Custom events use Title Case with spaces (Plausible convention): e.g. `plausible("Newsletter Signup")`. Newsletter signup conversion tracking implemented via `trackSignup()` helper in `NewsletterSignup.astro` – fires on both Ajax success and native form fallback paths. `plausible` is typed on the `Window` interface in `src/env.d.ts`.

Vercel proxy not yet configured – add rewrites in `vercel.json` to route the script through `danhopwood.com` and bypass ad blockers.

## MCP

Use `astro-docs` MCP for any Astro research.
