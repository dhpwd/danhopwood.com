# Writing posts

Posts are markdown files in `src/data/blog/`, loaded by the glob `**/[^_]*.md`. A leading underscore keeps a file out of the build, which is how idea lists and unfinished drafts sit in the repo without publishing.

The homepage is the post list. There is no splash page, no hero and no "blog" label.

## Frontmatter

`src/content.config.ts` holds the schema. The fields that carry a convention rather than an obvious meaning:

- `description` is required and capped at 200 characters. It is the one-line hook for the post list, the RSS item, the share card and search results, so write a hook rather than a summary. The cap is the OG card's three-line budget – see `docs/patterns/og-images.md`
- `draft: true` keeps a post out of the build. A future `pubDatetime` does the same until it passes, with a 15-minute margin (`SITE.scheduledPostMargin`)
- `modDatetime` feeds both the post header and the sitemap's `<lastmod>`. Set it when a published post changes materially
- `tags` defaults to `["others"]`
- `hideEditPost` suppresses the "Edit on GitHub" link on a single post

## Conventions

- Internal links carry no trailing slash, anchors included – see `docs/patterns/urls.md`
- Post images go in `src/assets/images/` and render through `<Image />` – see `docs/patterns/images.md`
- Reading time is computed from the raw markdown at build time by `src/utils/readingTime.ts`. There is nothing to set
- Renaming a published post's slug breaks inbound links. Add a permanent redirect from the old path in `vercel.json`

## Licence

Post content is CC BY 4.0, code is MIT. The post footer states this and links to the repo.
