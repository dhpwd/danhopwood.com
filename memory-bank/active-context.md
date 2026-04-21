# Active context

## Current focus

Site live on Vercel with `danhopwood.com` custom domain. Five posts published.

1. Configure domain redirects in Vercel: `dhpwd.com` → `danhopwood.com` and `www.danhopwood.com` → `danhopwood.com`
2. Set up Vercel proxy for Plausible to bypass ad blockers (add rewrites to `vercel.json`)
3. Create "Newsletter Signup" and "Share Link" custom event goals in Plausible dashboard
4. Verify LinkedIn share preview via [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) after next deploy

### Recently completed

- Post 5 published: "Forgetting isn't the problem" – voice pass on the draft before flipping to non-draft and setting `pubDatetime: 2026-04-21T09:00:00Z`
- Post 4 forward-link swap: stale "lands next week" teaser replaced with a permanent forward-link aside to Post 5
- Newsletter first-name field removed from backlog – "notes to self" voice doesn't fit reader-addressed personalisation

## Backlog

- Customise dynamic OG image styling to match site brand (per-post generated images)
- Harden `ShareLinks.astro` Plausible click tracking for View Transitions (`astro:page-load` pattern)

## Housekeeping

This repo is public (required for "Edit on GitHub" links). The memory bank is intentionally committed – eating our own dog food.

**Content rules for public memory bank:**
- No marketing strategy, positioning details, or competitive context
- Keep only what's pertinent to building the website
