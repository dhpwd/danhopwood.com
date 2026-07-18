# Active context

## Current focus

Site live on Vercel with `danhopwood.com` custom domain. Remaining setup is external dashboard work:

1. Configure domain redirects in Vercel: `dhpwd.com` → `danhopwood.com` and `www.danhopwood.com` → `danhopwood.com`
2. Set up Vercel proxy for Plausible to bypass ad blockers (add rewrites to `vercel.json` – see `tech-context.md` "Plausible Analytics")
3. Create "Newsletter Signup" and "Share Link" custom event goals in Plausible dashboard
4. Verify LinkedIn share preview via [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) after next deploy

## Open follow-ups

- Harden `ShareLinks.astro` Plausible click tracking for View Transitions (`astro:page-load` pattern – see `system-patterns.md` "View Transitions and script re-execution")

## Blockers

None
