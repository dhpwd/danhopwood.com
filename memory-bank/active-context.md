# Active context

## Current focus

Site live on Vercel with `danhopwood.com` custom domain. Remaining setup is external dashboard work:

1. Configure domain redirects in Vercel: `dhpwd.com` → `danhopwood.com` and `www.danhopwood.com` → `danhopwood.com`
2. Set up Vercel proxy for Plausible to bypass ad blockers (add rewrites to `vercel.json` – see `tech-context.md` "Plausible Analytics")
3. Create "Newsletter Signup" and "Share Link" custom event goals in Plausible dashboard
4. Verify LinkedIn share preview via [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) after next deploy

## Open follow-ups

- Harden `ShareLinks.astro` Plausible click tracking for View Transitions (`astro:page-load` pattern – see `system-patterns.md` "View Transitions and script re-execution")

## Open decisions

- **Post description length.** The OG card fits roughly 200 characters. Two posts exceed it and truncate with an ellipsis. Either cap `description` in the content schema and edit those posts, or accept truncation. A cap is independently defensible – the field also feeds the HTML meta description, which search engines cut around 155-160
- **Site-level share card.** `/og.png` (rendered by `og-templates/site.js`) is unreferenced while `SITE.ogImage` is set, so non-post pages serve the hand-built `public/og-image.png` instead. The two designs differ. Either adopt the new card site-wide, regenerate the static one to match, or keep them deliberately distinct as a profile card versus a content card

## Blockers

None
