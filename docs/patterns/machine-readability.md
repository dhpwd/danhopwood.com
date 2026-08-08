# Machine-readable metadata

Four outputs describe the site to machines: the sitemap, `/llms.txt`, the JSON-LD graph and the OG tags. Each carries a decision that reads like an oversight from the code alone.

## Sitemap `lastmod` comes from frontmatter, never git

The `serialize` hook in `astro.config.ts` stamps `<lastmod>` on post URLs from each post's frontmatter, using the same `modDatetime ?? pubDatetime` precedence as `getSortedPosts`. Frontmatter lives in the checked-out file, so it survives Vercel's shallow clone – `--depth=10` truncates commit history, not the working tree – and reads identically locally and in production.

Git commit dates don't survive it. `git log` sees only the last ten or so commits, so stable pages come back with an empty date, or worse a fabricated build-time fallback, exactly where a freshness signal matters most. Don't reintroduce git dates without a deep-clone setting such as `VERCEL_DEEP_CLONE=true`.

`src/utils/getPostModDates.ts` builds the map by parsing the blog markdown directly, because `astro.config.ts` can't import `astro:content` and so has no `getCollection`. It reconstructs each post URL with a faithful mirror of `getPath`: directory segments slugified through `slugifyStr` with `_`-prefixed segments dropped, filename used verbatim as the slug. It walks every directory and excludes only `_`-prefixed filenames, matching the loader glob. Each candidate date is validated, so an empty or unparseable `modDatetime` falls back to `pubDatetime` rather than dropping the post. Drift from `getPath` costs a missing `<lastmod>`, never a broken build. Non-post routes get no `lastmod` at all – an absent hint beats a false one.

## `SITE.ogImage` is deliberately empty

Setting it points every non-post page at one static file instead of the generated `/og.png`. Leave it empty. Any future per-post `ogImage` override keeps the same 1200x630 standard.

## `llms.txt` scope

`src/pages/llms.txt.ts` sources posts the way `rss.xml.ts` does – `getCollection("blog")` then `getSortedPosts`, so `postFilter` excludes drafts and future-dated posts – and builds the plain-text response the way `robots.txt.ts` does. Paths come from `getPath` wrapped in `new URL(..., site)`, giving absolute URLs with no trailing slash. File-extension endpoints are served without a trailing slash whatever `trailingSlash` says, so this needs no Vercel or Astro change. `llms-full.txt` and per-page `.md` variants are intentionally not implemented.

## JSON-LD is one graph, not per-page scripts

`Layout.astro` emits a single `@graph`. `WebSite`, `Person` and the Fidero `Organization` appear on every page. Post pages push a `BlogPosting` gated on `pubDatetime`, the same signal that drives `og:type`. Author and publisher reference the `Person` by `@id` rather than inlining it, and `headline` strips the ` | {SITE.title}` suffix that `PostDetails` adds to the page title.

**When to use:** changing what the site emits to crawlers, feeds or share previews.
