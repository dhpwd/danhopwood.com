# Astro build and client scripts

## Stale content after deleting a post

**Problem:** deleting a blog markdown file doesn't remove its route from the build output. Astro persists content collection data in `node_modules/.astro/data-store.json`, which survives both the file deletion and clearing `.astro/`.

**Solution:** delete `node_modules/.astro/data-store.json` (and `node_modules/.astro/assets/` if images are stale too), then rebuild.

**When to use:** after deleting or renaming a content collection entry, when a route you removed still appears in `dist/`.

## Server code goes in root `api/`, not the Vercel adapter

**Problem:** the usual Astro answer for an endpoint is the `@astrojs/vercel` adapter with on-demand routes. With the adapter, Vercel deploys `.vercel/output`, which `astro build` writes before the build script's `pagefind --site dist` step runs. The deployed site loses its search index, and the build passes.

**Solution:** write the endpoint as a Vercel function in the root `api/` folder, exporting the web-standard `export default { async fetch(request: Request) { … } }`. Vercel builds it alongside the static Astro output, and `astro.config.ts` and the build script stay unchanged. `api/subscribe.ts` is the worked example – see `docs/external-services.md`. `pnpm dev` and `pnpm preview` don't serve `api/`, so test a function by calling its default export's `fetch` from a Node script.

**When to use:** adding any server-side endpoint.

## Client scripts and View Transitions

**Problem:** Astro bundles `<script>` blocks in `.astro` components as module scripts, which run once per full page load. With View Transitions (`<ClientRouter />` in `Layout.astro`), navigating swaps the DOM without re-running them, so listeners are never attached to the new nodes. The page looks correct and the handler never fires again.

**Solution:** attach listeners inside `document.addEventListener("astro:page-load", init)`. The module script registers that listener once and the event fires on every navigation, including the first load. Guard elements with a `data-initialized` attribute so a node that survives the swap isn't bound twice. `NewsletterSignup.astro` is the worked example.

**Anti-pattern for new work:** `is:inline data-astro-rerun`. It does re-run the script, at the cost of TypeScript, import resolution and deduplication. `PostDetails.astro` and `BackToTopButton.astro` both take that route, so expect to find it in the tree – prefer `astro:page-load` for anything new, and keep inline scripts for pre-paint state such as the theme flash guard in `Layout.astro`.

**When to use:** any component that attaches client-side event listeners.

## Disabling a focused button drops focus

**Problem:** setting `disabled` on the focused element moves focus to `<body>`, and re-enabling it doesn't bring focus back. A submit button is focused whenever it was clicked or tabbed to, so a handler that disables it while a request runs leaves keyboard and screen-reader users at the top of the document. Nothing visible marks it.

**Solution:** note `document.activeElement` before disabling, and call `focus()` on it once the control is enabled again. Focus returned this way doesn't draw a `:focus-visible` ring after a mouse click. `NewsletterSignup.astro`'s submit handler is the worked example.

**When to use:** any handler that disables a control while work is pending.

## Testing client scripts and functions

**Problem:** behaviours of this site, the browser and Node break the obvious test harness, either failing with an error that points elsewhere or passing when the code is wrong.

**Solution:**

- `global.css` applies `scroll-smooth` to `html`, so after Playwright's `fill()` scrolls down a long post the target keeps moving for about a second, and `click()` fails with "element is not stable". Wait for the scroll to settle before clicking
- `<ClientRouter />` saves the scroll position with `history.replaceState`, which fires Playwright's `framenavigated` on the same URL. To assert that a submit didn't navigate, count navigation requests (`request.isNavigationRequest()`) or check a `window` marker survives, not `framenavigated`
- Submit forms by clicking the button as well as pressing Enter in a field. Only the click leaves focus on the button, so a bug in how the handler treats focus shows on that route alone
- `locator.boundingBox()` is relative to the viewport, and a click can scroll the page. To assert an element didn't move, compare `getBoundingClientRect().top + scrollY`
- Node's `AbortSignal.timeout` timer doesn't keep the event loop alive. A stubbed `fetch` that hangs until aborted needs its own pending timer, or the test script exits before the timeout fires

Run Playwright against `pnpm build && pnpm preview`, stub `api/` routes with `page.route` (preview doesn't serve them), and test a function by calling its default export's `fetch` from a Node script with a stubbed global `fetch`.

**When to use:** browser-testing a client script, or testing an `api/` function.

## Markdown plugins and image optimisation

**Problem:** a markdown plugin that rewrites images can cost them Astro's build-time optimisation, with nothing in the build output to say so. Astro collects local image paths in `remarkCollectImages` and marks the `<img>` elements in `rehypeImages`, both of which run after the plugins configured in `markdown.remarkPlugins` and `markdown.rehypePlugins`. A plugin that replaces an image with raw HTML leaves those passes nothing to find, and the image is then served unprocessed. The ordering lives in `@astrojs/markdown-remark`'s processor rather than the public docs, so read the package to confirm it.

**Solution:** leave the mdast `image` node itself alone and change the structure around it. Set `data.hName` on the surrounding nodes to control the rendered tags instead of emitting raw HTML. `src/utils/remarkFigureCaptions.ts` wraps a captioned image in a `<figure>` this way, and its images still come out with WebP conversion, a responsive `srcset` and explicit dimensions.

**When to use:** writing or changing a markdown plugin that restructures images.

## Module paths in bundled code vs standalone scripts

**Problem:** Astro bundles `src/utils/` modules into `dist/chunks/` at build time, so a path resolved from `import.meta.url` lands outside the project and throws ENOENT in the production build while working in dev.

**Solution:** resolve project asset paths from `process.cwd()` in anything Astro bundles – see `og-templates/shared.js` loading the avatar. Standalone scripts run directly by node, such as `scripts/generate-favicons.mjs`, are the opposite case and correctly use `import.meta.url`.

**When to use:** reading a file from disk in build-time code.
