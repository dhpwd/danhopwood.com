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

Form submits via JS fetch with inline success/error messages (no page redirect). Hidden `embed=1` input required by Buttondown's embed API. Falls back to native form POST in a new tab when fetch fails (e.g. Buttondown human verification step returns non-200). Init wrapped in `astro:page-load` for View Transitions support, with `data-initialized` guard to prevent double-attaching. Metadata fields (e.g. first name) can be added later via `name="metadata__<key>"` inputs.

"Read the latest issue" link below the form points to the Buttondown archive (`buttondown.com/dhpwd/archive`). Styled with `opacity-80` parent, dashed underline, `hover:text-accent` — intentionally muted relative to the Subscribe button to maintain CTA hierarchy.

## Share links

Defined in `src/constants.ts` as `SHARE_LINKS: ShareLink[]`. Each entry has a `buildHref(pageUrl, pageTitle?)` function that constructs the platform-specific share URL with proper encoding. `ShareLinks.astro` accepts an optional `title` prop passed from the post layout. Platforms: X (with `via=dhpwd`), LinkedIn, WhatsApp, Telegram, Email, Facebook.

Icons use responsive sizing: `size-8` (32px) on mobile for tap targets, `size-6` (24px) on desktop. Padding `p-3 sm:p-2`. Icon row has `md:-ml-2` to left-align the first icon with the "Share this post on:" text on desktop (centred on mobile).

## Post ending layout

Order of elements after article content in `PostDetails.astro`:

1. Newsletter signup card (directly after `<Content />`, above the HR – primary CTA)
2. HR separator (dashed)
3. Tags
4. Share links
5. Edit on GitHub (footer-only, all screen sizes)
6. HR separator
7. Previous/Next post navigation

Back to Top button removed (progress bar sufficient). `addHeadingLinks()` scoped to `#article` to prevent anchor links on non-article headings.

## Post page footer

`Footer.astro` accepts `stealThisPost` boolean prop. When true (post pages only), replaces the copyright line with "Steal this post → CC BY 4.0 · Code MIT" linking to the GitHub repo. Blog content is CC BY 4.0; code is MIT.

## Theme tokens

AstroPaper uses CSS custom properties mapped to Tailwind via `@theme inline` in `src/styles/global.css`:

`bg-background`, `text-foreground`, `bg-accent`, `bg-muted`, `border-border`

## Plausible Analytics

Script and init added to `src/layouts/Layout.astro` `<head>`. The `async` attribute on the script tag implies `is:inline` in Astro (any attribute besides `src` triggers this), so the tag renders as-is. No Partytown needed – Plausible's script is ~1KB.

Custom events use Title Case with spaces (Plausible convention). `plausible` is typed on the `Window` interface in `src/env.d.ts`. Two custom events tracked:

- **Newsletter Signup** – fired via `trackSignup()` in `NewsletterSignup.astro` on both Ajax success and native form fallback
- **Share Link** – fired on click in `ShareLinks.astro` with `{ props: { platform } }` for per-platform breakdown

Vercel proxy not yet configured – add rewrites in `vercel.json` to route the script through `danhopwood.com` and bypass ad blockers.

## Vercel configuration

`vercel.json` at project root. Key settings:

- **`trailingSlash: false`** – 308 redirects trailing-slash URLs to clean form (e.g. `/posts/slug/` → `/posts/slug`). This is the production-side fix; Astro's `trailingSlash: "never"` only affects the dev server and `Astro.url` for static/prerendered sites (Astro docs: "Trailing slashes on prerendered pages are handled by the hosting platform"). Plausible proxy rewrites to be added here too

## Trailing slash

Three-layer config for consistency:

1. **Vercel** (`vercel.json`): `trailingSlash: false` – creates 308 redirects in production (the load-bearing piece)
2. **Astro** (`astro.config.ts`): `trailingSlash: "never"` – dev server matches production behaviour
3. **RSS** (`src/pages/rss.xml.ts`): `trailingSlash: false` – Astro's RSS helper adds trailing slashes by default regardless of Astro config

## MCP

Use `astro-docs` MCP for any Astro research.
