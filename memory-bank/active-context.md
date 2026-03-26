# Active context

## Current focus

Site live on Vercel with `danhopwood.com` custom domain. Two posts published.

1. Configure domain redirects in Vercel: `dhpwd.com` → `danhopwood.com` and `www.danhopwood.com` → `danhopwood.com`
2. Set up Vercel proxy for Plausible to bypass ad blockers (add rewrites to `vercel.json`)
3. Create "Newsletter Signup" and "Share Link" custom event goals in Plausible dashboard
4. Verify LinkedIn share preview via [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) after next deploy

### Recently completed

- Trailing slash normalisation: `vercel.json` (`trailingSlash: false`) for 308 redirects in production, `astro.config.ts` (`trailingSlash: "never"`) for dev parity, RSS `trailingSlash: false` to match. Fixes split Plausible analytics

## Backlog

- Customise dynamic OG image styling to match site brand (per-post generated images)
- Consider adding first name field to newsletter once sending regularly (Buttondown supports `metadata__first-name`)
- Harden `ShareLinks.astro` Plausible click tracking for View Transitions (`astro:page-load` pattern)

## Housekeeping

This repo is public (required for "Edit on GitHub" links). The memory bank is intentionally committed – eating our own dog food.

**Content rules for public memory bank:**
- No marketing strategy, positioning details, or competitive context
- Keep only what's pertinent to building the website
