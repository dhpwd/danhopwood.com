# Active context

## Current focus

Site live on Vercel with `danhopwood.com` custom domain. Six posts published.

1. Configure domain redirects in Vercel: `dhpwd.com` → `danhopwood.com` and `www.danhopwood.com` → `danhopwood.com`
2. Set up Vercel proxy for Plausible to bypass ad blockers (add rewrites to `vercel.json`)
3. Create "Newsletter Signup" and "Share Link" custom event goals in Plausible dashboard
4. Verify LinkedIn share preview via [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) after next deploy

### In progress

- Post 7 "The recording was the easy bit" – `draft: true`, `pubDatetime: 2026-05-06T09:00:00Z` (one-week stagger after Post 6, matching Posts 4 → 5 pattern). Pre-publish TODO: generate `recall-recorder-frontmatter.png` for the placeholder `<img>` comment at line 31, or delete the comment if not needed

### Recently completed

- Post 6 published: "I replaced Granola in 2 hours" – open-sources `dhpwd/recall-recorder` (macOS Electron menu-bar app wrapping Recall.ai's Desktop SDK + AssemblyAI Universal-3-Pro). Forward-link teaser to Post 7. Cross-link added in Post 3 (source-code post) framing it as a "building my own SaaS replacements" example

## Backlog

- Customise dynamic OG image styling to match site brand (per-post generated images)
- Harden `ShareLinks.astro` Plausible click tracking for View Transitions (`astro:page-load` pattern)

## Housekeeping

This repo is public (required for "Edit on GitHub" links). The memory bank is intentionally committed – eating our own dog food.

**Content rules for public memory bank:**
- No marketing strategy, positioning details, or competitive context
- Keep only what's pertinent to building the website
