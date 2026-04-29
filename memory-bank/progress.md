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
- Plausible Analytics added to `Layout.astro` (privacy-friendly, no cookie banner, script + init in `<head>`)
- Newsletter Signup custom event tracking added to `NewsletterSignup.astro` (fires on both Ajax success and native form fallback)
- `plausible` typed on `Window` interface in `src/env.d.ts`, removing `as any` casts
- Second blog post published: "Cowork vs Claude Code: the difference isn't the terminal" with `/new-prospect` screenshot
- Newsletter signup moved above share links in PostDetails (higher engagement position)
- Newsletter signup restyled as bordered card (`rounded-lg border p-6`, `dark:border-accent` in dark mode)
- "Steal this post → CC BY 4.0 · Code MIT" footer on post pages (replaces copyright line, links to repo)
- Share links refactored: `buildHref` function per platform replacing static URL concatenation. Fixed X endpoint (`/intent/tweet`), WhatsApp (`api.whatsapp.com/send`), Facebook (canonical path). All URLs now `encodeURIComponent`'d. Added `via=dhpwd` on X shares, dynamic `text`/`subject` params using post title
- LinkedIn share button added (second position after X)
- Reading time added to post list cards and post headers via `reading-time` package + `src/utils/readingTime.ts` utility. Displayed in Datetime component as "· X min read"
- `og:type` meta tag added to Layout.astro (`article` for posts, `website` for other pages)
- Share link click tracking added to `ShareLinks.astro` (`plausible("Share Link", { props: { platform } })`)
- Newsletter card `not-prose` fix for about page (prose styles were adding unwanted whitespace inside the card)
- Share links open in new tab (`target="_blank"`)
- Fidero link added to homepage bio and about page (contextual, same tab, matching style)
- Default footer updated: "All rights reserved" removed (contradicted CC BY 4.0), now "© {year} {SITE.author}"
- README updated: description aligned with micro-niche, licence section corrected to CC BY 4.0 + MIT
- Sentence case applied to headings: "Recent posts", "All posts"
- Post ending reordered: newsletter card directly after article content (above HR), then tags → share links → edit on GitHub. Aligns with Website → Newsletter signup conversion goal
- Heading anchor bug fixed: `addHeadingLinks()` scoped to `#article` only, preventing `#` links on non-article headings (e.g. newsletter card h2)
- Back to Top button removed from post pages (progress bar sufficient, floating circle crowded share links on mobile)
- Share link icons: responsive sizing (`size-8 sm:size-6`), simplified padding (`p-3 sm:p-2`), removed redundant competing scale transforms. Negative margin (`md:-ml-2`) aligns first icon with text on desktop
- Edit on GitHub removed from post header, now footer-only on all screen sizes. Icon sized (`size-5`), flex alignment fixed (`items-center` replacing invalid `justify-baseline`)
- Fixed X and Telegram share links encoding spaces as `+` instead of `%20` (`URLSearchParams` replaced with `encodeURIComponent`). Telegram simplified to URL-only (preview card shows title/description)
- Newsletter signup form hardened for View Transitions: init wrapped in `astro:page-load` listener with `data-initialized` guard. Native POST fallback (new tab) shows honest "Complete signup in the new tab" message instead of false success. `form.target` cleaned up after submit
- Trailing slash normalisation: `vercel.json` created with `trailingSlash: false` (308 redirects in production), `trailingSlash: "never"` added to `astro.config.ts` (dev parity), `trailingSlash: false` added to RSS feed. Fixes Plausible analytics splitting `/slug/` vs `/slug` into separate entries
- Third blog post published: "I used Claude Code to read its own source code" (slug: `i-used-claude-code-to-read-its-own-source-code`)
- Cross-link added in Cowork post referencing new post's "five layers of context management" section
- "Read the latest issue" link added to `NewsletterSignup.astro` — links to Buttondown archive (`buttondown.com/dhpwd/archive`), opens in new tab, styled with dashed underline + `hover:text-accent` (muted by parent `opacity-80`, intentionally subordinate to Subscribe button)
- Post 1 rewritten for Techie plugin: one-command `curl` installer replaces four terminal commands, `/first-steps` guided flow replaces manual Lean Canvas session, "one-thread trap" section added (context window framing), all 5 screenshots replaced, `modDatetime` added, description updated. Cowork post cross-reference updated to match ("one command")
- Fourth blog post published: "The memory bank framework" (slug: `the-memory-bank-framework`). Practical guide to the 6-file structured memory system – project-brief, product-context, tech-context, system-patterns, active-context, progress. Covers initialisation, session loop rules (never compact / one goal per session / update before exit), discipline for keeping files honest. Images: `mb-folder-ghostty.png`, `mb-update-diff.png`. External links use `<a target="_blank">` raw HTML for gist and Cline docs
- Fifth blog post published: "Forgetting isn't the problem" (slug: `forgetting-isnt-the-problem`). Argument piece on AI codebase coherence – contractors analogy, two dimensions of code quality, "continuity has a counter, coherence doesn't" payoff. Staggered release a week after Post 4; the original long-form Post 4 draft had been split into two cross-linked posts (practical → 4, argument → 5). On release: Post 4's stale "lands next week" teaser replaced with a permanent forward-link aside to Post 5
- Cross-links added in Techie, Cowork, and Source-code posts, all pointing to "the memory bank framework" post. Source-code post gets a reciprocal aside at the end of its "Five layers of context management" section, framing the five layers as scaffolding most users need because they don't bring a structured memory layer of their own
- Trailing-slash normalisation on internal links: all `/posts/...` references across five blog files stripped of trailing slashes, including two anchor links where the slash sat before the `#`. Matches site-wide `trailingSlash: false` config (see `tech-context.md` "Trailing slash")
- Sixth blog post published: "I replaced Granola in 2 hours" (slug: `i-replaced-granola-in-2-hours`). Concrete build piece launching `dhpwd/recall-recorder` – a macOS Electron menu-bar app wrapping Recall.ai's Desktop SDK and AssemblyAI's Universal-3-Pro to produce name-tagged markdown transcripts. Framed as "buy what's hard, build what's mine": SDK handles call detection on Zoom/Meet/Teams/Webex, recording, async transcription and speaker diarisation; the wrapper drops files into `~/call-transcripts/inbox/` with structured frontmatter (date, platform, meeting title, participants, duration, Recall upload ID). Image: `recall-recorder-preferences.png`. Description rewritten to lead with the "Them" labelling failure (and the 2-hour hook) rather than restating the body opener. Forward-link teaser to Post 7. Cross-link added in Post 3 ("I used Claude Code to read its own source code") intro pointing to Post 6 as a "building my own SaaS replacements" example

## Blockers

None
