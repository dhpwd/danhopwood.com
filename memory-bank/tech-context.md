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
public/                  # Static assets (favicon)
```

## Built-in features (no work needed)

Dark/light mode, RSS + sitemap, pagefind search, draft posts, dynamic OG image generation, SEO tags, pagination.

## Reading time

Computed on-demand from `post.body` (raw markdown) using the `reading-time` npm package. Utility at `src/utils/readingTime.ts` returns formatted string (e.g. "5 min read"). Called in `Card.astro` (post list) and `PostDetails.astro` (post header), passed to `Datetime.astro` via `readingTime` prop. Not stored in schema – computed at build time per page.

## Images

- **`src/assets/images/`** – optimised by Astro at build time (WebP, cache-busting, CLS prevention). Import and render with `<Image />` from `astro:assets`
- **`public/`** – served as-is, no processing. Use for assets referenced by URL string. Current assets: `favicon.jpeg`
- Avatar lives at `src/assets/images/avatar.jpeg`

## Buttondown integration

Implemented as `src/components/NewsletterSignup.astro`. Embedded in `PostDetails.astro` and `AboutLayout.astro`. POST to `https://buttondown.com/api/emails/embed-subscribe/dhpwd`. Tags subscribers with `website` via hidden input. Has `compact` prop for layout variants.

Form submits via JS fetch with inline success/error messages (no page redirect). Hidden `embed=1` input required by Buttondown's embed API. Falls back to native form POST in a new tab when fetch fails (e.g. Buttondown human verification step returns non-200). Init wrapped in `astro:page-load` for View Transitions support, with `data-initialized` guard to prevent double-attaching. Metadata fields (e.g. first name) can be added later via `name="metadata__<key>"` inputs.

"Read the latest issue" link below the form points to the Buttondown archive (`buttondown.com/dhpwd/archive`). Styled with `opacity-80` parent, dashed underline, `hover:text-accent` – intentionally muted relative to the Subscribe button to maintain CTA hierarchy.

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

## Type system

Two faces, two registers, loaded via Astro's experimental fonts API (Google provider, config in `astro.config.ts`, `<Font>` preloads in `Layout.astro`):

- **Geist** (`--font-app`) – prose and general UI. Weights 400/500/600/700
- **Geist Mono** (`--font-mono`) – headings (global `h1–h6` base rule in `global.css`), dates/metadata, breadcrumb, code, UI labels (e.g. copy button). Weights 400/500/600/700

No italic faces exist for Geist – semantic emphasis (`em`, blockquotes) renders as browser-synthesised oblique, which is accepted; decorative italics were removed instead. Don't hand-set font families per component – use the registers (see `system-patterns.md` "Type registers").

Code blocks highlight with shiki themes `vitesse-light` / `vitesse-dark` (set in `astro.config.ts`), chosen for neutral grounds that sit with the theme palettes.

## Theme tokens

AstroPaper uses CSS custom properties mapped to Tailwind via `@theme inline` in `src/styles/global.css`:

`bg-background`, `text-foreground`, `bg-accent`, `bg-muted`, `border-border`

Accent is teal: `#0f766e` (light) / `#6fb3a8` (dark).

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

Writer convention: omit trailing slashes on internal `/posts/...` links in markdown, including anchor links (`/posts/slug#heading`, not `/posts/slug/#heading`).

Three-layer config for consistency:

1. **Vercel** (`vercel.json`): `trailingSlash: false` – creates 308 redirects in production (the load-bearing piece)
2. **Astro** (`astro.config.ts`): `trailingSlash: "never"` – dev server matches production behaviour
3. **RSS** (`src/pages/rss.xml.ts`): `trailingSlash: false` – Astro's RSS helper adds trailing slashes by default regardless of Astro config

## Sitemap lastmod

`@astrojs/sitemap`'s `serialize` hook (in `astro.config.ts`) stamps `<lastmod>` on post URLs as a freshness signal. Dates come from each post's frontmatter, using the same `modDatetime ?? pubDatetime` precedence as `getSortedPosts`, not git commit dates. Frontmatter lives in the checked-out file content, so it survives Vercel's shallow clone (`--depth=10`, which truncates commit history, not the working tree) and is identical locally and in production. Git-based `lastmod` does not: `git log` sees only the last ~10 commits, so stable pages return an empty date (or, worse, a fabricated build-time fallback), exactly where a freshness signal matters most. Do not reintroduce git dates without a deep-clone setting (e.g. `VERCEL_DEEP_CLONE=true`).

The map is built by `src/utils/getPostModDates.ts`, which reads the blog markdown directly: `astro.config.ts` can't import `astro:content` (no `getCollection`), so the util parses the frontmatter block and reconstructs each post URL with a faithful mirror of `getPath` – directory segments slugified via `slugifyStr` with `_`-prefixed segments dropped (as `getPath` does), filename used verbatim as the slug (the schema has no `slug` override). It walks all directories and excludes only `_`-prefixed filenames, matching the loader glob `**/[^_]*.md`. Each candidate date is validated before use, so an empty, null or unparseable `modDatetime` (the field is `.nullable()`) falls back to `pubDatetime` rather than dropping the post. Drift from `getPath` only costs a missing `<lastmod>`, never a broken build. Non-post routes (home, listing, pagination, tags) get no `lastmod` – an absent hint beats a false one.

## Open Graph image dimensions

`Layout.astro` declares `og:image:width`/`og:image:height` as `1200`/`630`. Every OG image is that size and generated at build time by satori: `/og.png` for non-post pages (`src/utils/og-templates/site.js`) and `/posts/<slug>/index.png` per post (`post.js`), sharing constants via `shared.js`. `SITE.ogImage` is deliberately empty – setting it would point every non-post page at a static file instead of `/og.png`. Any future per-post `ogImage` should follow the same size standard.

The per-post card renders title, description, author, domain and tagline. See `system-patterns.md` "Satori OG templates" for the constraints that govern edits to it.

## llms.txt

Dynamic endpoint at `src/pages/llms.txt.ts`, served at `/llms.txt` (per the llmstxt.org spec). Sources posts like `rss.xml.ts` (`getCollection("blog")` → `getSortedPosts`, so drafts and future-scheduled posts are excluded via `postFilter`) and builds the plain-text response like `robots.txt.ts` (typed `APIRoute`, `site` from context). Each post path comes from `getPath(id, filePath)` wrapped in `new URL(..., site)` for absolute, trailing-slash-free URLs. Output is markdown: H1 title, blockquote summary, then `## Posts` / `## About` / `## Optional` (RSS) link lists. Returned as `text/plain; charset=utf-8`. File-extension endpoints are always served without a trailing slash regardless of `trailingSlash` config, so no Vercel/Astro change needed. `llms-full.txt` and per-page `.md` variants intentionally not implemented.

## JSON-LD structured data

`src/layouts/Layout.astro` emits a single `<script type="application/ld+json">` built as a `@graph` array. Site-identity nodes are emitted on every page: `WebSite`, `Person` (with `sameAs` from `SOCIALS`), and an `Organization` node for Fidero (`worksFor` on the Person). Post pages additionally push a `BlogPosting` node, gated on `pubDatetime` presence (the same signal that drives `og:type`); author/publisher reference the Person by `@id` rather than inlining, and `headline` strips the ` | {SITE.title}` suffix that `PostDetails` adds to the page title.

## MCP

Use `astro-docs` MCP for any Astro research.
