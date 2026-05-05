# Active context

## Current focus

Site live on Vercel with `danhopwood.com` custom domain. Seven posts published.

1. Configure domain redirects in Vercel: `dhpwd.com` → `danhopwood.com` and `www.danhopwood.com` → `danhopwood.com`
2. Set up Vercel proxy for Plausible to bypass ad blockers (add rewrites to `vercel.json`)
3. Create "Newsletter Signup" and "Share Link" custom event goals in Plausible dashboard
4. Verify LinkedIn share preview via [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) after next deploy

### Recently completed

- Post 7 published: "The recording was the easy bit" (slug: `the-recording-was-the-easy-bit`). Pipeline argument follow-up to Post 6: data → information → intelligence. Same-day release rather than the planned one-week stagger. Image placeholder dropped in favour of an inline frontmatter code block. Cross-link to Post 5 added on the stateless-agents line. On release, Post 6's "more on that next week" forward-link teaser replaced with a direct link to Post 7

## Backlog

- Customise dynamic OG image styling to match site brand (per-post generated images)
- Harden `ShareLinks.astro` Plausible click tracking for View Transitions (`astro:page-load` pattern)

## Housekeeping

This repo is public (required for "Edit on GitHub" links). The memory bank is intentionally committed – eating our own dog food.

**Content rules for public memory bank:**
- No marketing strategy, positioning details, or competitive context
- Keep only what's pertinent to building the website
