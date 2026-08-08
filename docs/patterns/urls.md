# URLs and internal links

**Problem:** production URLs carry no trailing slash, but no single setting enforces that. Astro's `trailingSlash` doesn't reach production for a static build, and the RSS helper ignores it entirely.

**Solution:** three settings, each covering a layer the others can't.

1. `vercel.json` `trailingSlash: false` – issues the 308 redirect in production. This is the setting that actually enforces the rule
2. `astro.config.ts` `trailingSlash: "never"` – makes the dev server and `Astro.url` behave like production. For a static build it reaches no further than that, since trailing slashes on prerendered pages are the host's business
3. `src/pages/rss.xml.ts` `trailingSlash: false` – Astro's RSS helper appends slashes by default, regardless of the Astro config

**Writer convention:** omit trailing slashes on internal `/posts/...` links in markdown, anchors included – `/posts/slug#heading`, not `/posts/slug/#heading`.

**When to use:** adding routes, changing route config or writing internal links.
