# Astro build and client scripts

## Stale content after deleting a post

**Problem:** deleting a blog markdown file doesn't remove its route from the build output. Astro persists content collection data in `node_modules/.astro/data-store.json`, which survives both the file deletion and clearing `.astro/`.

**Solution:** delete `node_modules/.astro/data-store.json` (and `node_modules/.astro/assets/` if images are stale too), then rebuild.

**When to use:** after deleting or renaming a content collection entry, when a route you removed still appears in `dist/`.

## Reading posts in a route

**Problem:** `postFilter` (`src/utils/postFilter.ts`) decides which posts are public: not a draft and, in a production build, past its `pubDatetime` less `SITE.scheduledPostMargin`. A route that filters the blog collection on `!data.draft` alone builds a scheduled post in production. It gets a page, a share card, a sitemap entry and a search entry, while the listings hide it. `pnpm dev` hides the leak, because `postFilter` passes every non-draft post in dev.

**Solution:** pass `postFilter` to `getCollection`: `getCollection("blog", postFilter)`, or `post => postFilter(post) && …` where the route adds a condition, as the share-card route `index.png.ts` does. A route that also needs the listing order calls `getSortedPosts`, which applies `postFilter` itself. The date check lives in `postFilter` alone. `postFilter` compares against a cut-off it reads once, when its module loads, so every route in one build agrees on which posts are public. Astro builds routes one after another, so a cut-off read on each call lets a build that runs across a post's go-live time list the post in some routes without building its page.

To check a change here, add a temporary post with `draft: false` and a `pubDatetime` a day ahead, then run a production build. Confirm `dist/posts/<slug>/` doesn't exist and no other built file names the slug. Then on `pnpm preview`, look up a phrase from the post's body on `/search`: the Pagefind index is compressed, so a grep of `dist/` misses it. Delete `node_modules/.astro/data-store.json` before each build (see above).

**Anti-pattern:** `getCollection("blog", ({ data }) => !data.draft)`, which leaks scheduled posts into any route that doesn't then call `getSortedPosts`. And a clock read outside `postFilter`'s cut-off, such as `Date.now()` in a route: routes built either side of a post's go-live time then disagree about it.

**When to use:** writing or changing any route that reads the blog collection.

## Calendar dates of a post

**Problem:** a `Date` from the blog collection is an instant. `getFullYear()`, `getMonth()` and `getDate()` read it in the build machine's timezone – UTC on Vercel, whatever `TZ` a local build runs under – while `Datetime.astro` shows each post's date in its `timezone` frontmatter, or `SITE.timezone` (Europe/London) when it has none. Code that groups or labels posts with those calls files a post published in the last hour of a BST month under that month in production while its card reads the 1st of the next, and a London build files it under the next. Nothing in the build reports it.

**Solution:** read calendar fields from the conversion `Datetime.astro` uses, `dayjs(data.pubDatetime).tz(data.timezone || SITE.timezone)`, then `.year()`, `.month() + 1` or `.date()`. Import and `dayjs.extend` the `utc` and `timezone` plugins in the file that converts, rather than relying on `Datetime.astro` having extended them. `src/pages/archives/index.astro` groups by year and month this way. Sorting and comparing instants (`getTime()`, `postFilter`'s cut-off, `toISOString()`) needs no conversion.

To check a change here, add a temporary post with `pubDatetime: 2026-06-30T23:30:00Z` and no `timezone`, build once under `TZ=UTC` and once under `TZ=Europe/London`, and confirm both builds put it under July, the month its card shows.

**Anti-pattern:** `post.data.pubDatetime.getFullYear()` or `getMonth()` in a route or component.

**When to use:** grouping, filtering or labelling posts by year, month or day.

## Server code goes in root `api/`, not the Vercel adapter

**Problem:** the usual Astro answer for an endpoint is the `@astrojs/vercel` adapter with on-demand routes. With the adapter, Vercel deploys `.vercel/output`, which `astro build` writes before the build script's `pagefind --site dist` step runs. The deployed site loses its search index, and the build passes.

**Solution:** write the endpoint as a Vercel function in the root `api/` folder, exporting the web-standard `export default { async fetch(request: Request) { … } }`. Vercel builds it alongside the static Astro output, and `astro.config.ts` and the build script stay unchanged. `api/subscribe.ts` is the worked example – see `docs/external-services.md`. `pnpm dev` and `pnpm preview` don't serve `api/`, so test a function by calling its default export's `fetch` from a Node script.

**When to use:** adding any server-side endpoint.

## Client scripts and View Transitions

**Problem:** Astro bundles `<script>` blocks in `.astro` components as module scripts, which run once per full page load. With View Transitions (`<ClientRouter />` in `Layout.astro`), navigating swaps the DOM without re-running them, so listeners are never attached to the new nodes. The page looks correct and the handler never fires again. `astro:page-load` fires after every navigation, but on a full page load the router fires the first one from window `load` (`addEventListener("load", onPageLoad)` in `astro/dist/transitions/router.js`), and `load` waits for the async Plausible script, fonts and eager images. Astro's docs don't say so. A listener added only on `astro:page-load` is missing for that whole time, though the page is already readable: a share click sends no event, and a form submit falls through to its native POST.

**Solution:** put the binding in a named init function, make it safe to run twice with a `data-initialized` guard on each node it binds, register it on `astro:page-load` and call it once at module run:

```ts
document.addEventListener("astro:page-load", initShareLinks);
initShareLinks();
```

Each part covers a case the others miss. The module-run call binds the page's nodes on a full load as soon as the document is parsed, and on a first client-side visit to a page whose script is new, since the router runs that script after the swap and before `astro:page-load`. The listener covers every later navigation, when the module doesn't run again. The guard makes the second call each time a no-op, and keeps a node that survives the swap from being bound twice. A listener on `document` or `window` is added once at module scope, outside the init function: init runs at module run and on every navigation, so a listener added inside it would be added again each time. `NewsletterSignup.astro` is the worked example. `ImageZoom.astro` is a second: each run binds every new `#article img`, marking each with `data-zoom`, and binds the dialog's own listener once, behind `data-initialized`. `src/scripts/rule-draw.ts` is a third, for a script that observes rather than binds: one `IntersectionObserver`, created on the first run and disconnected on `astro:before-swap`, with each row's `data-rule` state as its guard. It also shows how to read layout at init. The router restores a reload's scroll position with a smooth `scrollTo` (`html` has `scroll-behavior: smooth`), and a `#hash` load scrolls smoothly too, so both are still under way when the script runs. A script that asks what is in view reads where the page will land (`history.state.scrollY`, or the fragment's element) rather than `scrollY`. `:target` isn't set yet on that first run, so it finds the fragment's element by decoding `location.hash`, inside a `try` for a malformed one. Work that is safe to repeat needs no guard – `BackButton.astro` sets its link's `href` from `sessionStorage` on each run.

**Anti-pattern:** registering the init function on `astro:page-load` alone, which leaves nothing bound until window `load`.

**Anti-pattern for new work:** `is:inline data-astro-rerun`. It does re-run the script, at the cost of TypeScript, import resolution and deduplication. `document` and `window` survive the swap, so a listener the script adds to either is added again on every navigation: `PostDetails.astro` adds its one `document` listener, the progress bar's `scroll` handler, behind a `window.postProgressBound` flag so the visit gets one. `PostDetails.astro` and `BackToTopButton.astro` both take that route, so expect to find it in the tree – prefer the pattern above for anything new, and keep inline scripts for pre-paint state such as the theme flash guard in `Layout.astro`.

**When to use:** any component that attaches client-side event listeners.

## Scroll position and View Transitions

**Nothing scrolls on** `astro:after-swap`**.** The router scrolls a new page to the top, or restores the saved position on a Back or Forward, before it fires `astro:after-swap`. A `scrollTo` in that event undoes the restore, and a listener on `document` keeps doing so on every later page. `src/scripts/restore-scroll.ts` makes the restore jump rather than glide, because the router's `scrollTo(x, y)` otherwise takes `html`'s smooth `scroll-behavior`. A reload's restore, and a Back or Forward within one page after a `#hash` link, don't fire the swap events and still glide. Astro 7.4.3 and later pass `behavior: "instant"` to the router's restores themselves, on a Back or Forward and on a reload (withastro/astro#18506), so `restore-scroll.ts` and its `<script>` tag come out in the upgrade to Astro 7.

**A page that renders its content after the swap restores its own position.** The router's restore lands on the short page and is clamped to it, so the page holds the saved position and scrolls there itself once the content has loaded. It reads the position from `history.state` at `astro:before-preparation`, which the router fires in the `popstate` task, and when its script first runs, never later. Once the router has moved to the entry, `scrollend` writes the current position into `history.state`, so a scroll that ends on the page being left while the router fetches, and the router's `scrollTo(0, 0)` on the swap, each overwrite the saved one. The page applies the held position at `astro:before-swap`, which also ends a restore still waiting on a page the visitor has left. `src/pages/search.astro` is the worked example, and it also restores the number of Pagefind results that were showing.

**When to use:** any script that scrolls the page, and any page that renders its content after the swap.

## Disabling a focused button drops focus

**Problem:** setting `disabled` on the focused element moves focus to `<body>`, and re-enabling it doesn't bring focus back. A submit button is focused whenever it was clicked or tabbed to, so a handler that disables it while a request runs leaves keyboard and screen-reader users at the top of the document. Nothing visible marks it.

**Solution:** note `document.activeElement` before disabling, and call `focus()` on it once the control is enabled again. Focus returned this way doesn't draw a `:focus-visible` ring after a mouse click. `NewsletterSignup.astro`'s submit handler is the worked example.

Where the form's spec puts focus on the submit button after every submit, call `focus()` on the button itself instead. Noting `document.activeElement` can't deliver that: after Enter in a field it is the field, and Safari on macOS doesn't focus a button on click, so after a click there it is `<body>`. The enquiry form in `cloud-box-setup.astro` does this.

**When to use:** any handler that disables a control while work is pending.

## Markdown plugins and image optimisation

**Problem:** a markdown plugin that rewrites images can cost them Astro's build-time optimisation, with nothing in the build output to say so. Astro collects local image paths in `remarkCollectImages` and marks the `<img>` elements in `rehypeImages`, both of which run after the plugins configured in `markdown.remarkPlugins` and `markdown.rehypePlugins`. A plugin that replaces an image with raw HTML leaves those passes nothing to find, and the image is then served unprocessed. The ordering lives in `@astrojs/markdown-remark`'s processor rather than the public docs, so read the package to confirm it.

**Solution:** leave the mdast `image` node itself alone and change the structure around it. Set `data.hName` on the surrounding nodes to control the rendered tags instead of emitting raw HTML. `src/utils/remarkFigureCaptions.ts` wraps a captioned image in a `<figure>` this way, and its images still come out with WebP conversion, a responsive `srcset` and explicit dimensions.

`src/utils/rehypeTableLabels.ts`, in `markdown.rehypePlugins`, sets attributes on table elements and changes nothing else, so it needs no such care – see "Tables" in `docs/patterns/post-page.md`. It types the few hast fields it reads in the file, since `@types/hast` isn't a dependency.

**When to use:** writing or changing a markdown plugin that restructures images.

## Astro is patched for Markdown image alt text

**Problem:** Astro's `rehypeImages` stores each local image's props, alt included, as JSON in an `__ASTRO_IMAGE_` attribute, which hast-util-to-html serialises with `"`, `'`, `&` and `` ` `` as `&#x22;`, `&#x27;`, `&#x26;` and `&#x60;`. For a post, Astro 5 decodes only `&#x22;` before `JSON.parse`, then escapes the alt into the `<img>`, so an apostrophe or ampersand reaches the page as `&amp;#x27;` or `&amp;#x26;`, and a screen reader reads the literal `Clara&#x27;s queue`. A Markdown page in `src/pages/` also decodes `&#x27;`, so only the ampersand breaks there.

**Solution:** `patches/astro@5.16.6.patch`, registered under `patchedDependencies` in `pnpm-workspace.yaml`, backports the decode from withastro/astro#18086 to `dist/content/runtime.js`, which renders every post, and to the two `images()` loops in the code `dist/vite-plugin-markdown/images.js` generates for Markdown pages in `src/pages/`. The lookup in that code's `updateImageReferences` keeps its `&#x22;`-only decode: 5.16.6 stores each image under its path with `'` still encoded, so decoding the path there misses the key and the build fails on an image whose file name holds an apostrophe. Ampersands decode last, so an alt that holds an entity name as text (`&quot;`, written `&amp;quot;` in the source) comes out as written. Like upstream, the patch leaves `&#x60;` encoded, so a backtick escaped in the alt (`` \` ``) still reaches the page as `&amp;#x60;`. A code span in an alt loses its backticks before Astro sees it.

The key carries Astro's exact version, so a change to the Astro version fails the install with `ERR_PNPM_UNUSED_PATCH` until the patch is dealt with. Nothing else guards the fix. Write or regenerate the patch with pnpm 10 (`npx pnpm@10 patch astro@<version>`, edit the copy, then `npx pnpm@10 patch-commit <dir>`), per "Adding a package without lockfile churn" in `docs/patterns/dependencies.md`. The patch comes out when Astro reaches a version carrying #18086 (7.3.4 or later): delete the file and its `patchedDependencies` entry in the upgrade.

To check the patch, build a temporary post and a temporary Markdown page in `src/pages/` whose image alt holds `'`, `&`, `"` and `&amp;amp;`, each with a second image whose file name holds `'`. Confirm the build passes, and compare each image's accessible name (`locator.ariaSnapshot()`) with the source.

**When to use:** upgrading Astro, or an install or build failing on `patches/`.

## Module paths in bundled code vs standalone scripts

**Problem:** Astro bundles `src/utils/` modules into `dist/chunks/` at build time, so a path resolved from `import.meta.url` lands outside the project and throws ENOENT in the production build while working in dev.

**Solution:** resolve project asset paths from `process.cwd()` in anything Astro bundles – see `og-templates/shared.js` loading the avatar. Standalone scripts run directly by node, such as `scripts/generate-favicons.mjs`, are the opposite case and correctly use `import.meta.url`.

**When to use:** reading a file from disk in build-time code.

## Class names in build-time code reach the CSS

**Problem:** Tailwind v4 finds its classes by scanning every source file it isn't told to skip, not only templates. A build-time module that names classes as strings, such as a selector in an integration, is read the same way, and any name no page uses yet adds a rule to the site's CSS. The stylesheet's hashed file name then changes, and with it every page's HTML, though no page uses the rule. Nothing in the build reports it.

**Solution:** exclude the module with `@source not "<path>"` in `src/styles/global.css`, beside the import of Tailwind. `src/utils/markdownTwins.ts` is excluded this way. To confirm a module adds nothing, diff the built CSS (or every page's HTML) against the base build.

**When to use:** writing build-time code that names classes, such as selectors in an integration or a rehype plugin.

## Nested CSS and the CSS build target

**Problem:** Astro builds its client and server bundles with Vite's `build.target` set to `"esnext"`, which the project's own `vite.build` overrides key by key (`node_modules/astro/dist/core/build/static-build.js`), and Vite's `build.cssTarget` defaults to `build.target`. Left at that, esbuild's CSS minify lowers nothing, and nested CSS in an Astro `<style>` block reaches the browser as written: Chrome before 120 and Safari before 17.2 drop some or all of its nested rules. Tailwind lowers its own stylesheet, so what ships nested is CSS written in `<style>` blocks, and nothing in the build reports it.

**Solution:** `astro.config.ts` sets `vite.build.cssTarget` to Tailwind v4's browser floor, below which the site's CSS (cascade layers, `@property`, `color-mix()`) doesn't render as designed whatever the build does. esbuild's CSS minify then lowers nesting in every stylesheet Vite builds, Astro `<style>` blocks included: `#pagefind-search { input { … } }` in `search.astro` ships as `#pagefind-search input{…}`. It lowers little else at these targets. Newer syntax such as `light-dark()`, relative colours, `@starting-style` and `@scope` passes through unchanged, so check its support against the floor.

Nested CSS is fine to write in a `<style>` block, within these limits:

- In a scoped `<style>` (the default), Astro's compiler scopes only the outer selector, so a nested selector also matches inside child components and slotted content. Write a selector flat where it must stay scoped. An `is:global` block, like `search.astro`'s, has no scoping to lose
- Put a rule's declarations before its nested rules. esbuild moves declarations that follow a nested at-rule ahead of it, so a trailing declaration that wins in `pnpm dev` can lose in production
- Write an at-rule for a pseudo-element flat, as `@media (hover: hover) { .x::before { … } }`. esbuild lowers `.x::before { @media (hover: hover) { … } }` to a rule with no selector, which every browser drops
- A `<style is:inline>` block skips Vite and ships as written

`pnpm dev` serves CSS unlowered, because Vite minifies CSS only in a build, so check older-browser output in the production build: `dist/_astro/*.css`, and the `<style>` tags of the built pages, where Astro inlines small stylesheets.

**Anti-pattern:** flattening nested CSS by hand for browser support, which fixes that block and leaves the next nested rule unlowered. Setting `vite.build.target` to reach the CSS, which changes every JS bundle too. And turning off `vite.build.minify` or `vite.build.cssMinify`, which turns the lowering off with it.

**When to use:** writing nested CSS, adding a `<style is:inline>` block or changing the browsers the build supports.
