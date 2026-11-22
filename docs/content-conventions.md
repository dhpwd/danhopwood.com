# Writing posts

Posts are markdown files in `src/data/blog/`, loaded by the glob `**/[^_]*.md`. A leading underscore on the filename keeps a post out of the build, which is how idea lists and unfinished drafts sit in the repo without publishing.

The underscore only works on filenames. `[^_]` tests that segment alone, so a `_drafts/` directory is still walked and every post inside it publishes – with the underscore stripped from the URL, so `_drafts/my-post.md` lands at `/posts/my-post`. Prefix the filename, or set `draft: true`.

The homepage opens on one first screen – the headline, the portrait, the newsletter signup and the advisory row – with the post lists directly below it. There is no splash page and no "blog" label.

## Frontmatter

`src/content.config.ts` holds the schema. The fields that carry a convention rather than an obvious meaning:

- `description` is required and capped at 200 characters. It is the one-line hook for the post list, the RSS item, the share card and search-engine snippets (site search doesn't index it), so write a hook rather than a summary. The cap is the OG card's three-line budget – see `docs/patterns/og-images.md`
- `draft: true` keeps a post out of the build. A future `pubDatetime` keeps it out of a production build until 15 minutes before that time (`SITE.scheduledPostMargin`): no page, share card, search entry or sitemap entry, and no listing, RSS item or `llms.txt` line. It goes live with the first production build after that, and nothing schedules one, so a post dated ahead needs a deploy once its time has passed. `pnpm dev` shows it throughout
- `modDatetime` feeds more than the post header. `getSortedPosts` sorts on `modDatetime ?? pubDatetime`, so it sets position on the homepage, the listings, RSS and `llms.txt`, and `rss.xml.ts` uses it as the item's `pubDate`. Setting it on an old post moves that post back to the top and re-notifies feed readers. It also drives the sitemap's `<lastmod>` – see `docs/patterns/machine-readability.md`. Set it only when a published post changes materially
- `tags` defaults to `["others"]`
- `featured: true` puts a post in the homepage's Featured row and takes it out of Recent posts. `featuredOrder` (a whole number from 1) sets its place in that row, lowest first. Featured posts without one follow, newest first by `modDatetime ?? pubDatetime`. Reordering needs no date edit, so it doesn't re-notify feed readers
- `hideEditPost` suppresses the "Edit on GitHub" link on a single post

## Conventions

- Internal links carry no trailing slash, anchors included – see `docs/patterns/urls.md`
- Post images go in `src/assets/images/` and render through `<Image />` – see `docs/patterns/images.md`
- An italic line directly under an image, with no blank line between them, becomes its caption – see `docs/patterns/images.md`
- Reading time is computed from the raw markdown at build time by `src/utils/readingTime.ts`. There is nothing to set
- Renaming a published post's slug breaks inbound links. Add a permanent redirect from the old path as a `routes` entry placed first in `vercel.json` – see `docs/patterns/urls.md`

## Licence

Post content is CC BY 4.0, code is MIT. The post footer states this and links to the repo.
