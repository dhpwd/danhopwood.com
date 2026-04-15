# Active context

## Current focus

Site live on Vercel with `danhopwood.com` custom domain. Four posts published. Post 5 ("Forgetting isn't the problem") drafted and held for staggered release a few days after Post 4.

1. Ship Post 5: flip `draft: true` → `false`, update `pubDatetime`, uncomment the forward-link aside at the end of Post 4
2. Configure domain redirects in Vercel: `dhpwd.com` → `danhopwood.com` and `www.danhopwood.com` → `danhopwood.com`
3. Set up Vercel proxy for Plausible to bypass ad blockers (add rewrites to `vercel.json`)
4. Create "Newsletter Signup" and "Share Link" custom event goals in Plausible dashboard
5. Verify LinkedIn share preview via [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) after next deploy

### Recently completed

- Post 4 published: "The memory bank framework" – practical guide to the 6-file structured memory system, session loop rules (never compact / one goal per session / update before exit), discipline for keeping files honest. Two images: `mb-folder-ghostty.png`, `mb-update-diff.png`. External links (gist, Cline docs) use `<a target="_blank">` raw HTML for new-tab opening
- Post 5 drafted (`draft: true`): "Forgetting isn't the problem" – argument piece on AI codebase coherence. The original long-form Post 4 draft was split into two cross-linked posts (practical → 4, argument → 5). Post 4 has a commented-out forward-link aside to Post 5, to be uncommented on Post 5's release day
- Cross-links added in Techie, Cowork, and Source-code posts, each pointing to Post 4. Source-code post gets a reciprocal aside at the end of its "Five layers of context management" section
- Trailing-slash normalisation: all internal `/posts/...` links across five blog files stripped of trailing slashes, including two anchor links where the slash sat before the `#`
- `_ideas.md` cleanup: "The memory bank framework" section removed (now Post 4), "Structuring agent sessions for complex implementations" bullet absorbed, new "Memory bank failure modes" bullet captured for a standalone follow-up (stale-misleads-harder-than-empty + bloat-as-parallel-failure insights cut from Post 4 for space)

## Backlog

- Customise dynamic OG image styling to match site brand (per-post generated images)
- Consider adding first name field to newsletter once sending regularly (Buttondown supports `metadata__first-name`)
- Harden `ShareLinks.astro` Plausible click tracking for View Transitions (`astro:page-load` pattern)

## Housekeeping

This repo is public (required for "Edit on GitHub" links). The memory bank is intentionally committed – eating our own dog food.

**Content rules for public memory bank:**
- No marketing strategy, positioning details, or competitive context
- Keep only what's pertinent to building the website
