# Project brief

## Scope

Personal site at `danhopwood.com` – a public lab notebook. Posts live on the homepage. No "blog" label, no splash page.

## Decisions

Final unless explicitly revisited.

- **Domain:** `danhopwood.com` (primary). `dhpwd.com` redirects to it
- **Stack:** AstroPaper v5.5.1 (Astro + TailwindCSS)
- **Hosting:** Vercel (existing account). Deploy once site is ready locally
- **Repo:** `dhpwd/danhopwood.com` on GitHub (personal account)
- **Launch rule:** Minimum 1 substantial post before going live

## Design spec

- **Homepage = post list.** Avatar, short bio, social links, straight into posts. No splash page, no hero *(implemented)*
- **Build Notes signup on every post and about page.** Embedded Buttondown form (same component everywhere). One-line anti-sell: frequency + "zero fluff". Buttondown is backend infrastructure – no public-facing Buttondown URLs *(implemented)*
- **One-line post hooks.** Every post needs a strong description/subtitle for the index, RSS, and social sharing previews
- **Read time on posts.** AstroPaper supports this natively
- **"Edit on GitHub" links.** Open-source the blog content. Link to `dhpwd/danhopwood.com` repo *(implemented and verified)*
- **About page** *(implemented in `src/pages/about.md`)*
- **Tags** for categorisation once there's enough content
