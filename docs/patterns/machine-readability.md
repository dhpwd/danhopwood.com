# Machine-readable metadata

Five outputs describe the site to machines: the sitemap, `/llms.txt`, the JSON-LD graph, the OG tags and the Markdown twins agents are served. Each carries a decision that reads like an oversight from the code alone.

## Sitemap `lastmod` comes from frontmatter, never git

The `serialize` hook in `astro.config.ts` stamps `<lastmod>` on post URLs from each post's frontmatter, using the same `modDatetime ?? pubDatetime` precedence as `getSortedPosts`. Frontmatter lives in the checked-out file, so it survives Vercel's shallow clone – `--depth=10` truncates commit history, not the working tree – and reads identically locally and in production.

Git commit dates don't survive it. `git log` sees only the last ten or so commits, so stable pages come back with an empty date, or worse a fabricated build-time fallback, exactly where a freshness signal matters most. Don't reintroduce git dates without a deep-clone setting such as `VERCEL_DEEP_CLONE=true`.

`src/utils/getPostModDates.ts` builds the map by parsing the blog markdown directly, `.md` and `.mdx` alike, because `astro.config.ts` can't import `astro:content` and so has no `getCollection`. It reconstructs each post URL with a faithful mirror of `getPath`: directory segments slugified through `slugifyStr` with `_`-prefixed segments dropped, filename used verbatim as the slug. It walks every directory and excludes only `_`-prefixed filenames, matching the loader glob. Each candidate date is validated, so an empty or unparseable `modDatetime` falls back to `pubDatetime` rather than dropping the post. Drift from `getPath` costs a missing `<lastmod>`, never a broken build. Non-post routes get no `lastmod` at all – an absent hint beats a false one.

## `SITE.ogImage` is deliberately empty

Setting it points every non-post page at one static file instead of the generated `/og.png`. Leave it empty. Any future per-post `ogImage` override keeps the same 1200x630 standard.

## `llms.txt` scope

`src/pages/llms.txt.ts` sources posts the way `rss.xml.ts` does – `getCollection("blog")` then `getSortedPosts`, so `postFilter` excludes drafts and future-dated posts – and builds the plain-text response the way `robots.txt.ts` does. Paths come from `getPath` wrapped in `new URL(..., site)`, giving absolute URLs with no trailing slash. File-extension endpoints are served without a trailing slash whatever `trailingSlash` says, so this needs no Vercel or Astro change.

The file is the `# ` title, the `SUMMARY` blockquote, `## When to use this site`, `## Posts`, `## About` and `## Optional`. `## When to use this site` is the `WHEN_TO_USE` constant beside `SUMMARY`: the questions to cite the site for and the ones to send elsewhere. It is copy, placed verbatim. `llms-full.txt` is not implemented. Each page's full text reaches agents as its Markdown twin instead – see "Agents asking for Markdown" below.

## JSON-LD is one graph, not per-page scripts

`Layout.astro` emits a single `@graph`. `WebSite`, `Person` and the Fidero `Organization` appear on every page. The `Person` carries a one-sentence `description`, placed verbatim as copy, since agent-readiness scanners mark a `Person` without one as incomplete. Post pages push a `BlogPosting` gated on `pubDatetime`, the same signal that drives `og:type`. Author and publisher reference the `Person` by `@id` rather than inlining it, and `headline` strips the ` | {SITE.title}` suffix that `PostDetails` adds to the page title.

## Agents asking for Markdown

**Problem:** agents ask for Markdown in two ways. One sends `Accept: text/markdown` to a page's own URL, the other fetches the URL plus `.md`. Agent-readiness scanners check both: the homepage as Markdown (`content-type: text/markdown` with `Vary: Accept`), a `.md` twin of sampled pages whose body starts with a top-level heading, an advertised Markdown alternate, and an unknown path answering `404` with a Markdown body that points at `llms.txt` or the sitemap. The site is static with no adapter, so the build can't vary a response by request header, and whatever does the varying sits in front of every human page view.

**Solution:** no function runs for any request. `vercel.json` `routes` do the routing and headers at Vercel's CDN, and the `danhopwood-twins` integration (`src/utils/markdownTwins.ts`) writes a Markdown twin beside the built HTML of every page in the sitemap.

### Routes

`vercel.json` holds `$schema`, `trailingSlash: false` and `routes`, in this order:

1. The renamed-post redirects: each old post path, with or without its trailing slash, answers `308` to the new one (`^/posts/writing-loops-is-a-ladder-not-a-command/?$` to `/posts/writing-loops`, for example), and a post renamed since the twins were advertised also sends its old `.md` URL to the new twin
2. `^/$` adds `link: </index.md>; rel="alternate"; type="text/markdown"` and continues
3. The page regex, `^/((?!_astro/|pagefind/|api/)[^.]+?)/?$`, adds `link: </$1.md>; …` and continues
4. `^/.+\.md$` adds `x-robots-tag: noindex` and continues
5. `^/$` with a `has` on `accept` matching `.*text/markdown.*` serves `/index.md` with `content-type: text/markdown; charset=utf-8` and `vary: Accept`
6. The page regex with the same `has` serves `/$1.md` with the same two headers. An unknown path has no twin, so the request falls through to the filesystem miss
7. `{ "handle": "filesystem" }`
8. `^/.*$` with the same `has` answers `404` with `/404.md` and the same two headers. Browsers get `404.html` from Vercel's error route after it

`vercel build` compiles them in this order, after the Astro preset's `continue` cache-header routes for `/assets` and `/_astro` and the `^/(.*)/$` 308 that `trailingSlash: false` compiles to, and before Vercel's `/api` 404, `{ "handle": "error" }` and the `404.html` route.

- **The renamed-post redirects are routes, placed first.** Beside `routes`, `vercel build` compiles top-level `redirects` after the `handle` and the Markdown 404, so a Markdown request to an old URL would get the 404, and its HTML 308 would carry an alternate `link` to a twin that doesn't exist. A renamed slug's redirect goes here too – see `docs/patterns/urls.md`
- **`trailingSlash: false` stays.** Its 308 compiles ahead of every user route, so a slashed URL redirects before a Markdown route sees it
- **`routes`, not `rewrites`.** `rewrites` compile after the filesystem check, so `index.html` would win on `/`
- **Header rules are `routes` entries, not top-level `headers`**, which compile past the `handle`, where they never reach an existing page
- **No Routing Middleware.** It adds a function call to every request its matcher takes, and outside Next.js its matcher takes paths only, so it can't be keyed on `Accept`
- **No `Vary` on HTML responses.** Vercel's CDN already keys its cache on `Accept`, so human responses gain only the `link` header
- **`noindex` only on `.md` URLs.** The rule matches the request path, so HTML pages, and Markdown negotiated at a page's own URL, never carry it. Search engines keep citing the HTML page
- **`api/` is outside the page regex**, so `/api/subscribe` gets no alternate `link`
- **Accepted:** an unknown dot-free path's HTML 404 carries an alternate `link` to a twin that doesn't exist, since route 3 runs before the filesystem check, and a Markdown request for `/404` gets `public/404.md` with a `200`

If Vercel stops accepting `handle` (a deploy error naming it, or mixed routing properties), or the Markdown 404 fails on production, the fallback for the 404 alone is Routing Middleware narrowed to unknown paths. That puts a function on human 404 views, so it is a page-speed decision to take first, not a fix to apply.

### Twins

`markdownTwins()` runs last in `astro.config.ts`'s `integrations`, after `sitemap()`, because it reads the built sitemap in `astro:build:done` and Astro runs those hooks in order. For every URL in the sitemap it writes `dist/<path>.md`: `/` becomes `index.md`, and `/posts` becomes `posts.md` beside `posts/`. The sitemap filter stays the one definition of what gets a twin, and a twin adds no words of its own.

- **Source: the built HTML, one method for every page.** A post (its page has `#article`) gives its title block (the date line and the `h1`) and `#article`, so what follows the article stays out. Every other page gives `#main-content`. Post source Markdown isn't used: its images point at `../../assets/…` where only the HTML has the optimised URLs, the figure-caption plugin hasn't run on it, and list pages would still need converting
- **Order.** A twin opens with the page's one `h1` as `# `, then the rest of the selected content in document order with the `h1` removed. The homepage's eyebrow sits before its `h1` in the markup, so it follows the title in the twin
- **Conversion.** `hast-util-from-html`, then the module's `DROP` selectors (interface text such as `aria-hidden` content, icons, buttons, forms, nav and the signup) and HTML comments, then `hast-util-to-mdast` and `mdast-util-to-markdown` with GFM. `.sr-only` text stays, since it is what a screen reader reads, and so does a `figcaption`. A `pre` handler gives a Shiki block the language Shiki keeps on `pre[data-language]` (none for `plaintext`), and puts a fence's file-name label, which the file-name transformer adds inside `pre`, on a line above the block rather than in the code. Images keep their alt text and built `src`. A space goes between the children of a flex or grid element (`.flex`, `.inline-flex`, `.grid`, `.ledger`), because each child is its own box and its text never runs on from the one before on the page (`/tags`' name and count). `svg` stays in `DROP` even though `hast-util-to-mdast` ignores it, since a space inserted before an icon would otherwise survive inside a link. `global.css` excludes the module from Tailwind's class scan, so a class its selectors name adds no CSS – see "Class names in build-time code reach the CSS" in `docs/patterns/astro-build.md`
- **Guard.** The same hook fails the build, naming each offender, when a sitemap page's `<main>` has no `h1` or more than one, a sitemap URL has no twin, a twin doesn't start with `# `, or `/` leaves the sitemap (the `^/$` routes serve `/index.md` whatever it holds). It also finds the two page-regex routes in `vercel.json` by their `/$1.md` link and destination, and fails when they don't share one `src` or don't sit before the `handle`. It tests that regex against every built `index.html` other than `/`: a page with a twin must match in both slash forms and capture its own path, and a page without one must not match. Every built page but `404.html` is in the sitemap, so the regex has no page exclusions, and a page kept out of the sitemap needs one. The regex skips dotted paths, so a page whose path has a dot (a tag such as "Claude 4.5", which `slugifyStr` keeps as `claude-4.5`) fails the build
- **`/404.md` is `public/404.md`**, labels and pointers placed byte for byte, with the trailing newline Prettier's check of `public/` expects

The `has` on `accept` matches any mention of `text/markdown`, so it ignores q-values: `text/html, text/markdown;q=0.1` gets Markdown. That is accepted, since no browser sends `text/markdown`.

### Verifying

`pnpm dev` and `pnpm preview` don't apply `vercel.json`, so the routes are checked twice.

- **Compile the routes locally.** In a clean export of the branch (`git archive HEAD | tar -x -C <dir>`) with `node_modules` linked in and a built `dist/` copied in, write `.vercel/project.json` by hand, since `vercel link` and `vercel pull` change the project: `{"projectId":"<projectId>","orgId":"<orgId>","settings":{"framework":"astro","buildCommand":"true","outputDirectory":"dist","installCommand":"true","devCommand":null,"rootDirectory":null}}`, taking `projects[0].id` and `projects[0].orgId` from the main checkout's gitignored `.vercel/repo.json`. Run `vercel build`, read `.vercel/output/config.json`'s `routes` for the order above, and confirm `.vercel/output/functions/` holds `api/subscribe.func` and nothing else. The twins never change the HTML, so diff every built page against the base build with the `application/ld+json` script removed from both. After a converter change, compare each twin with its page: the non-whitespace characters of the selected content (drop list applied, `h1` first, image alt text included) must equal those of the twin parsed back with `mdast-util-from-markdown` and GFM and flattened with `mdast-util-to-string`. That check is blind to whitespace, and a file-name label moves above its block, so read the changed twins too
- **Check production.** A human response whose status, HTML hash or any header but the added `link` differs from before means reverting. With a browser `Accept` and with `Accept: text/markdown`, `curl -sS -i` `/`, a post, `/posts/2` and a post's `.md` URL, and compare status, `content-type`, `vary`, `link`, `x-robots-tag` and body hashes against `dist/`. Send both `Accept` values to unknown paths, dot-free and dotted (which only the 404 route sees): Markdown gets a `404` with `public/404.md`'s body, a browser the HTML 404. Check the renamed posts' old URLs and a slashed URL answer `308` for both. Request a page as Markdown and then as HTML to show the cache keeps them apart, and send a multi-value `Accept` (`text/html;q=0.9, text/markdown`). Check `/api/subscribe` answers `405` to a GET and `400` to a POST with an empty email, neither of which reaches Buttondown, and that `vercel inspect danhopwood.com` lists it as the only function. Then rescan at is-agentic.com and read each check's result

**Anti-patterns:** Routing Middleware or `rewrites` for header routing, top-level `headers` or `redirects` beside the `handle`, `Vary: Accept` on HTML responses, a `<link rel="alternate">` in the head (it changes every page's HTML), a hand-written list of twin pages (it drifts from the sitemap) and serving post source Markdown as a twin.

**When to use:** changing what the site emits to crawlers, feeds, share previews or agents, including `vercel.json` routes and response headers.
