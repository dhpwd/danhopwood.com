# Active context

## Current focus

Site live on Vercel with `danhopwood.com` custom domain. Three posts published.

1. Configure domain redirects in Vercel: `dhpwd.com` → `danhopwood.com` and `www.danhopwood.com` → `danhopwood.com`
2. Set up Vercel proxy for Plausible to bypass ad blockers (add rewrites to `vercel.json`)
3. Create "Newsletter Signup" and "Share Link" custom event goals in Plausible dashboard
4. Verify LinkedIn share preview via [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) after next deploy

### Recently completed

- Post 1 ("Claude Code for founders who hate the terminal") rewritten end-to-end for Techie plugin: one-command install replaces four-command tutorial, `/first-steps` guided flow replaces manual Lean Canvas creation, "one-thread trap" framing added, all screenshots replaced, `modDatetime` added
- Cowork post closing line updated: "four commands" → "one command" to match rewritten Post 1

## Backlog

- Customise dynamic OG image styling to match site brand (per-post generated images)
- Consider adding first name field to newsletter once sending regularly (Buttondown supports `metadata__first-name`)
- Harden `ShareLinks.astro` Plausible click tracking for View Transitions (`astro:page-load` pattern)

## Housekeeping

This repo is public (required for "Edit on GitHub" links). The memory bank is intentionally committed – eating our own dog food.

**Content rules for public memory bank:**
- No marketing strategy, positioning details, or competitive context
- Keep only what's pertinent to building the website
