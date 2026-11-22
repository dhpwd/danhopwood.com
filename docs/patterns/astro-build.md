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

**Problem:** Astro bundles `<script>` blocks in `.astro` components as module scripts, which run once per full page load. With View Transitions (`<ClientRouter />` in `Layout.astro`), navigating swaps the DOM without re-running them, so listeners are never attached to the new nodes. The page looks correct and the handler never fires again. `astro:page-load` fires after every navigation, but on a full page load the router fires the first one from window `load` (`addEventListener("load", onPageLoad)` in `astro/dist/transitions/router.js`), and `load` waits for the async Plausible script, fonts and eager images. Astro's docs don't say so. A listener added only on `astro:page-load` is missing for that whole time, though the page is already readable: a share click sends no event, and a form submit falls through to its native POST.

**Solution:** put the binding in a named init function, make it safe to run twice with a `data-initialized` guard on each node it binds, register it on `astro:page-load` and call it once at module run:

```ts
document.addEventListener("astro:page-load", initShareLinks);
initShareLinks();
```

Each part covers a case the others miss. The module-run call binds the page's nodes on a full load as soon as the document is parsed, and on a first client-side visit to a page whose script is new, since the router runs that script after the swap and before `astro:page-load`. The listener covers every later navigation, when the module doesn't run again. The guard makes the second call each time a no-op, and keeps a node that survives the swap from being bound twice. A listener on `document` or `window` is added once at module scope, outside the init function: init runs at module run and on every navigation, so a listener added inside it would be added again each time. `NewsletterSignup.astro` is the worked example. `ImageZoom.astro` is a second: each run binds every new `#article img`, marking each with `data-zoom`, and binds the dialog's own listener once, behind `data-initialized`. Work that is safe to repeat needs no guard – `BackButton.astro` sets its link's `href` from `sessionStorage` on each run.

**Anti-pattern:** registering the init function on `astro:page-load` alone, which leaves nothing it binds bound until window `load`.

**Anti-pattern for new work:** `is:inline data-astro-rerun`. It does re-run the script, at the cost of TypeScript, import resolution and deduplication. `document` and `window` survive the swap, so a listener the script adds to either is added again on every navigation: each move from one post to another adds another `scroll` and `astro:after-swap` listener from `PostDetails.astro`. `PostDetails.astro` and `BackToTopButton.astro` both take that route, so expect to find it in the tree – prefer the pattern above for anything new, and keep inline scripts for pre-paint state such as the theme flash guard in `Layout.astro`.

**When to use:** any component that attaches client-side event listeners.

## Disabling a focused button drops focus

**Problem:** setting `disabled` on the focused element moves focus to `<body>`, and re-enabling it doesn't bring focus back. A submit button is focused whenever it was clicked or tabbed to, so a handler that disables it while a request runs leaves keyboard and screen-reader users at the top of the document. Nothing visible marks it.

**Solution:** note `document.activeElement` before disabling, and call `focus()` on it once the control is enabled again. Focus returned this way doesn't draw a `:focus-visible` ring after a mouse click. `NewsletterSignup.astro`'s submit handler is the worked example.

Where the form's spec puts focus on the submit button after every submit, call `focus()` on the button itself instead. Noting `document.activeElement` can't deliver that: after Enter in a field it is the field, and Safari on macOS doesn't focus a button on click, so after a click there it is `<body>`. The enquiry form in `cloud-box-setup.astro` does this.

**When to use:** any handler that disables a control while work is pending.

## Testing client scripts and functions

**Problem:** behaviours of this site, the browser and Node break the obvious test harness, either failing with an error that points elsewhere or passing when the code is wrong.

**Solution:**

- `global.css` applies `motion-safe:scroll-smooth` to `html`, so after Playwright's `fill()` scrolls down a long post the target keeps moving for about a second, and `click()` fails with "element is not stable". Wait for the scroll to settle before clicking
- `html` is `overflow-y-scroll`, and headless Chromium's scrollbar takes 15px at 390, where a phone's overlays the page. Hide it (`html { scrollbar-width: none }` from an init script) before measuring layout or sideways scroll
- A context's `colorScheme` picks the theme only while `localStorage` has no `theme` key. A test click on the theme button writes one, and every later page in that context keeps that theme – remove the key after the click
- A screenshot drops `:hover`, so read a state's computed style while the state is held, between `hover()` or `mouse.down()` and the next mouse move
- A colour from a `/75` utility or a `color-mix()` token computes with alpha or in another space (`oklab(… / 0.75)`, `color(srgb …)`), which is not the colour on screen. To measure contrast, paint the ground's computed colour and then each layer onto a 1×1 canvas and read the pixel
- On `/search`, clicking Clear empties the results, so test "Load more results" before it
- The fonts API registers each family under a hashed name, so `font-family` computes as `Geist-4350b8f6…` or `Geist Mono-1081b9fc…`. Match the face by prefix, with the hash stripped, not by equality
- `<ClientRouter />` saves the scroll position with `history.replaceState`, which fires Playwright's `framenavigated` on the same URL. To assert that a submit didn't navigate, count navigation requests (`request.isNavigationRequest()`) or check a `window` marker survives, not `framenavigated`
- To hold a page before window `load`, hold the `plausible.io` script request in a `route` handler and fulfil it with an empty body once the check is done. The async script holds back `load`, and an empty body leaves an init-script recorder in place of `window.plausible`. Assert `document.readyState` is `"interactive"` before each early action, so a check can't pass on a page that has already loaded
- Submit forms by clicking the button as well as pressing Enter in a field. Only the click leaves focus on the button, so a bug in how the handler treats focus shows on that route alone
- `locator.boundingBox()` is relative to the viewport, and a click can scroll the page. To assert an element didn't move, compare `getBoundingClientRect().top + scrollY`
- A control's state changes over the shared 150ms, so a computed style read straight after `focus()` or `hover()` is the start of the transition – a field's focus ring reads as transparent. Wait past the duration before reading
- A full-page screenshot clipped to an element far below the viewport can show a post image as an empty box, even after it has loaded. Scroll the element into view and `await img.decode()` before the screenshot. Post images are `loading="lazy"`, so set them eager first
- `textContent` runs a link's flex items together ("ai17 posts"). Read what a screen reader announces from `locator.ariaSnapshot()`, which separates them
- `pnpm preview` answers a path with a trailing slash (`/about/`) with the 404 page – see `docs/patterns/urls.md`. A check that queries the page then finds nothing and passes, so write test URLs without the slash
- A position read from a screenshot's pixels, such as where a marker's ink starts, can differ by a pixel between Chromium builds and scale factors. Compare before and after in the same browser at the same scale
- To compare an element pixel for pixel across two builds, hide the site header on both. A change in the header's height moves everything below it by a fraction of a pixel, which changes its anti-aliasing and reads as a difference
- Headless Chromium on `localhost` writes to the clipboard without a permission grant, so an unstubbed copy test passes whatever the page does when a write fails. Replace `navigator.clipboard.writeText` from an init script to test the failure path, and grant `clipboard-read` to read the clipboard back after a real write
- Node's `AbortSignal.timeout` timer doesn't keep the event loop alive. A stubbed `fetch` that hangs until aborted needs its own pending timer, or the test script exits before the timeout fires

Run Playwright against `pnpm build && pnpm preview`. To compare a base and a change, copy each build's `dist/` aside and serve both at once with `pnpm astro preview --port <port> --outDir <copy>`, on ports other sessions aren't using. Stub `api/` routes with `page.route` (preview doesn't serve them), and test a function by calling its default export's `fetch` from a Node script with a stubbed global `fetch`.

**When to use:** browser-testing a client script or a change to what a page renders, or testing an `api/` function.

## Markdown plugins and image optimisation

**Problem:** a markdown plugin that rewrites images can cost them Astro's build-time optimisation, with nothing in the build output to say so. Astro collects local image paths in `remarkCollectImages` and marks the `<img>` elements in `rehypeImages`, both of which run after the plugins configured in `markdown.remarkPlugins` and `markdown.rehypePlugins`. A plugin that replaces an image with raw HTML leaves those passes nothing to find, and the image is then served unprocessed. The ordering lives in `@astrojs/markdown-remark`'s processor rather than the public docs, so read the package to confirm it.

**Solution:** leave the mdast `image` node itself alone and change the structure around it. Set `data.hName` on the surrounding nodes to control the rendered tags instead of emitting raw HTML. `src/utils/remarkFigureCaptions.ts` wraps a captioned image in a `<figure>` this way, and its images still come out with WebP conversion, a responsive `srcset` and explicit dimensions.

`src/utils/rehypeTableLabels.ts`, in `markdown.rehypePlugins`, sets attributes on table elements and changes nothing else, so it needs no such care – see "Tables" in `docs/patterns/post-page.md`. It types the few hast fields it reads in the file, since `@types/hast` isn't a dependency.

**When to use:** writing or changing a markdown plugin that restructures images.

## Module paths in bundled code vs standalone scripts

**Problem:** Astro bundles `src/utils/` modules into `dist/chunks/` at build time, so a path resolved from `import.meta.url` lands outside the project and throws ENOENT in the production build while working in dev.

**Solution:** resolve project asset paths from `process.cwd()` in anything Astro bundles – see `og-templates/shared.js` loading the avatar. Standalone scripts run directly by node, such as `scripts/generate-favicons.mjs`, are the opposite case and correctly use `import.meta.url`.

**When to use:** reading a file from disk in build-time code.
