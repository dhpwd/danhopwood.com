# Tech context

## Stack

- **Framework:** Astro with AstroPaper v5.5.1 theme
- **Styling:** TailwindCSS
- **Package manager:** pnpm
- **Search:** Pagefind (static, built-in)
- **Hosting:** Vercel (not yet configured)

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

Dark/light mode, RSS + sitemap, pagefind search, draft posts, dynamic OG image generation, reading time, SEO tags, pagination.

## Images

- **`src/assets/images/`** – optimised by Astro at build time (WebP, cache-busting, CLS prevention). Import and render with `<Image />` from `astro:assets`
- **`public/`** – served as-is, no processing. Use for favicon, OG images referenced by URL string
- Avatar lives at `src/assets/images/avatar.jpeg`

## Buttondown integration

Implemented as `src/components/NewsletterSignup.astro`. Embedded in `PostDetails.astro` and `AboutLayout.astro`. POST to `https://buttondown.com/api/emails/embed-subscribe/dhpwd`. Tags subscribers with `website` via hidden input. Has `compact` prop for layout variants.

Form submits via JS fetch with inline success/error messages (no page redirect). Hidden `embed=1` input required by Buttondown's embed API. Falls back to standard form POST if JS fails. Metadata fields (e.g. first name) can be added later via `name="metadata__<key>"` inputs.

Buttondown is backend infrastructure – no public-facing Buttondown URLs anywhere on the site.

## Theme tokens

AstroPaper uses CSS custom properties mapped to Tailwind via `@theme inline` in `src/styles/global.css`:

`bg-background`, `text-foreground`, `bg-accent`, `bg-muted`, `border-border`

## MCP

Use `astro-docs` MCP for any Astro research.
