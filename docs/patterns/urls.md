# URLs and internal links

**Problem:** production URLs carry no trailing slash, but no single setting enforces that. Astro's `trailingSlash` doesn't reach production for a static build, and the RSS helper ignores it entirely.

**Solution:** three settings, each covering a layer the others can't.

1. `vercel.json` `trailingSlash: false` – issues the 308 redirect in production. This is the setting that actually enforces the rule
2. `astro.config.ts` `trailingSlash: "never"` – makes the dev server and `Astro.url` behave like production, and makes `pnpm preview` answer a path with a trailing slash with the 404 page where production redirects it. For a static build it reaches no further than that, since trailing slashes on prerendered pages are the host's business
3. `src/pages/rss.xml.ts` `trailingSlash: false` – Astro's RSS helper appends slashes by default, regardless of the Astro config

**Renamed slugs:** the legacy redirects are `routes` entries placed first in `vercel.json`, each a 308 from an old path with or without its trailing slash. A renamed post also redirects its `.md` twin, `/posts/<old>.md` to `/posts/<new>.md`, since the `link` header advertises twins. A new renamed-slug redirect goes there too, never under a top-level `redirects` key. Beside `routes`, `vercel build` compiles `redirects` after `{ "handle": "filesystem" }` and the Markdown 404, so an agent asking for Markdown at the old URL would get the 404 – see "Agents asking for Markdown" in `docs/patterns/machine-readability.md`.

**Writer convention:** omit trailing slashes on internal `/posts/...` links in markdown, anchors included – `/posts/slug#heading`, not `/posts/slug/#heading`. A client-side visit through a redirect loses its `#fragment`: the router follows the redirect with `fetch`, whose `Response.url` has none, so the page opens at the top. An internal link therefore never relies on the trailing-slash 308. Pagefind's index gives its links a trailing slash (`/posts/<slug>/`, from `posts/<slug>/index.html`), so `processResult` in `search.astro` strips it.

**When to use:** adding routes, changing route config or writing internal links.
