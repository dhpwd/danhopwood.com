# Astro build

## Stale content from Astro's content store

**Problem:** Astro persists content collection data in `node_modules/.astro/data-store.json`, which survives clearing `.astro/`. Deleting or renaming a post doesn't leave a stale route: on every sync the glob loader drops each stored entry whose file it no longer finds, so the store keeps nothing for a file that's gone.

What goes stale is rendered HTML. The store holds each post's rendered HTML, and Astro renders a post again only when its file, the content config or the Astro config changes. The Astro config's digest serialises a plugin as `null`, so an edit inside a markdown plugin changes none of them, and every unchanged post keeps the HTML the old plugin made. Adding or removing a plugin does change the digest. Vercel restores `node_modules` from its build cache, so a deploy keeps that HTML too.

**Solution:** delete `node_modules/.astro/data-store.json` (and `node_modules/.astro/assets/` if images are stale too), then rebuild. On Vercel, redeploy without the build cache.

**When to use:** after editing a markdown plugin in `src/utils/`, or when a built post's HTML doesn't match its source.

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

## Markdown plugins and image optimisation

**Problem:** a markdown plugin that rewrites images can cost them Astro's build-time optimisation, with nothing in the build output to say so. Astro collects local image paths in `remarkCollectImages` and marks the `<img>` elements in `rehypeImages`, both of which run after the plugins configured in `markdown.remarkPlugins` and `markdown.rehypePlugins`. A plugin that replaces an image with raw HTML leaves those passes nothing to find, and the image is then served unprocessed. The ordering lives in `@astrojs/markdown-remark`'s processor rather than the public docs, so read the package to confirm it.

**Solution:** leave the mdast `image` node itself alone and change the structure around it. Set `data.hName` on the surrounding nodes to control the rendered tags instead of emitting raw HTML. `src/utils/remarkFigureCaptions.ts` wraps a captioned image in a `<figure>` this way, and its images still come out with WebP conversion, a responsive `srcset` and explicit dimensions.

`src/utils/rehypeTableLabels.ts`, in `markdown.rehypePlugins`, sets attributes on table elements and changes nothing else, so it needs no such care – see "Tables" in `docs/patterns/post-page.md`. It types the few hast fields it reads in the file, since `@types/hast` isn't a dependency.

A property a rehype plugin sets on an `img` reaches `getImage`, since `rehypeImages` copies the element's properties into the image's props, and `getImage` keeps a `sizes` it is given: `src/utils/rehypeImageSizes.ts` relies on both to size post images to the column, so an Astro upgrade re-checks that the rendered `<img>` still carries its `sizes`.

**When to use:** writing or changing a markdown plugin that restructures images or sets their properties.

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

## A `Props` type with an `as` key goes untyped

**Problem:** Astro types a component's `Astro.props`, and checks its callers, from the `Props` the component declares. `@astrojs/compiler` (2.13.0) doesn't find a `type Props = { … }` alias that has a key named `as`: the generated types fall back to `Record<string, any>`, so a caller's misspelt or missing prop passes `astro check`. The only sign is a hint, "'Props' is declared but never used" (ts 6196).

**Solution:** declare those props as an interface, `interface Props extends HTMLAttributes<"div"> { … }`, which the compiler reads with the `as` key. `LedgerRow.astro` does this. Where the interface extends no other type, the destructuring names it too (`const { summary, as: Wrapper = "figure" }: Props = Astro.props` in `Diagram.astro`): without that the hint stays and a misspelt prop still passes.

**When to use:** writing a component with an `as` prop, or when `astro check` reports that hint for `Props`.

## An import named like its file

**Problem:** `astro check` gives each `.astro` file's own component the file's name in PascalCase: `cloud-box-setup.astro` declares `CloudBoxSetup`. An import of the same name in that file, such as a `CloudBoxSetup` component imported into `cloud-box-setup.astro`, fails with ts(2440), "Import declaration conflicts with local declaration".

**Solution:** name a component for what it is, not for the page or component that imports it. The setup page's diagram is `ServerSessions`, not `CloudBoxSetup`.

**When to use:** naming a component, or when `astro check` reports ts(2440) on an import.

## Class names in build-time code reach the CSS

**Problem:** Tailwind v4 finds its classes by scanning every source file it isn't told to skip, not only templates. A build-time module that names classes as strings, such as a selector in an integration, is read the same way, and any name no page uses yet adds a rule to the site's CSS. The stylesheet's hashed file name then changes, and with it every page's HTML, though no page uses the rule. Nothing in the build reports it.

**Solution:** exclude the module with `@source not "<path>"` in `src/styles/global.css`, beside the import of Tailwind. `src/utils/markdownTwins.ts` is excluded this way, and so is `docs/`, whose pattern files name classes in their examples and anti-patterns. To confirm a module adds nothing, diff the built CSS (or every page's HTML) against the base build.

**When to use:** writing build-time code that names classes, such as selectors in an integration or a rehype plugin.

## Nested CSS and the CSS build target

**Problem:** Astro builds its client and server bundles with Vite's `build.target` set to `"esnext"`, which the project's own `vite.build` overrides key by key (`node_modules/astro/dist/core/build/static-build.js`), and Vite's `build.cssTarget` defaults to `build.target`. Left at that, esbuild's CSS minify lowers nothing, and nested CSS in an Astro `<style>` block reaches the browser as written: Chrome before 120 and Safari before 17.2 drop some or all of its nested rules. Tailwind lowers its own stylesheet, so what ships nested is CSS written in `<style>` blocks, and nothing in the build reports it.

**Solution:** `astro.config.ts` sets `vite.build.cssTarget` to Tailwind v4's browser floor, below which the site's CSS (cascade layers, `@property`, `color-mix()`) doesn't render as designed whatever the build does. esbuild's CSS minify then lowers nesting in every stylesheet Vite builds, Astro `<style>` blocks included: `#pagefind-search { input { … } }` in `search.astro` ships as `#pagefind-search input{…}`. It lowers little else at these targets. Newer syntax such as `light-dark()`, relative colours, `@starting-style` and `@scope` passes through unchanged, so check its support against the floor. Where it is newer than the floor, write the floor's version first and the newer one after it, inside `@supports`, as the line of ink does for `round()` (Chrome 125) in `global.css`. In a custom property the guard is the only protection: the property accepts any value, so an unsupported function fails only in the property that reads it, which falls back to its initial value – for `--ink-y`, `background-position` at the box's top left.

Nested CSS is fine to write in a `<style>` block, within these limits:

- In a scoped `<style>` (the default), Astro's compiler scopes only the outer selector, so a nested selector also matches inside child components and slotted content. Write a selector flat where it must stay scoped. An `is:global` block, like `search.astro`'s, has no scoping to lose
- Put a rule's declarations before its nested rules. esbuild moves declarations that follow a nested at-rule ahead of it, so a trailing declaration that wins in `pnpm dev` can lose in production
- Write an at-rule for a pseudo-element flat, as `@media (hover: hover) { .x::before { … } }`. esbuild lowers `.x::before { @media (hover: hover) { … } }` to a rule with no selector, which every browser drops
- A `<style is:inline>` block skips Vite and ships as written

`pnpm dev` serves CSS unlowered, because Vite minifies CSS only in a build, so check older-browser output in the production build: `dist/_astro/*.css`, and the `<style>` tags of the built pages, where Astro inlines small stylesheets.

**Anti-pattern:** flattening nested CSS by hand for browser support, which fixes that block and leaves the next nested rule unlowered. Setting `vite.build.target` to reach the CSS, which changes every JS bundle too. And turning off `vite.build.minify` or `vite.build.cssMinify`, which turns the lowering off with it.

**When to use:** writing nested CSS, adding a `<style is:inline>` block or changing the browsers the build supports.
