# Progress

## Done

- AstroPaper project scaffolded at `~/dev/danhopwood.com`
- Dependencies installed
- Git initialised
- Astro docs MCP added (project-scoped)
- Memory bank initialised
- Site identity configured in `src/config.ts` (title, description, author, domain, timezone, edit link)
- Social links set in `src/constants.ts` (X, LinkedIn, GitHub)
- Homepage hero updated with bio in `src/pages/index.astro`
- About page written in `src/pages/about.md`
- All sample blog posts and AstroPaper images deleted
- Clean build passing (0 errors, 7 pages)
- Avatar added to homepage hero (`src/assets/images/avatar.jpeg`, 120px, rendered with `<Image />`)
- Hero layout: avatar + bio side-by-side on desktop, stacked on mobile. h1 visually hidden (sr-only) for SEO
- RSS icon inline with social icons using matching `LinkButton` and `stroke-current`
- Buttondown newsletter signup component created (`src/components/NewsletterSignup.astro`)
- Newsletter signup embedded in `PostDetails.astro` (after share links) and `AboutLayout.astro` (after content)
- "Edit on GitHub" config set and verified working with first post
- First commit pushed to `origin/main` (GitHub repo created via `gh`)
- First blog post published: "Claude Code for founders who hate the terminal" with 6 optimised screenshots
- Back button disabled (`showBackButton: false` in `src/config.ts`)
- Share links reordered: X, WhatsApp, Telegram, Email, Facebook (Pinterest removed)
- Newsletter signup upgraded: JS fetch with inline success/error feedback, added missing `embed` hidden input
- Dark theme updated to warm neutral palette (near-black bg, muted teal accent)
- Custom favicon added (`public/favicon.jpeg`), replacing default Astro SVG favicon
- Custom OG/social share image added (`public/og-image.png`), replacing default AstroPaper image
- Deployed to Vercel with `danhopwood.com` custom domain

## Blockers

None
