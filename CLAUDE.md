# danhopwood.com

Personal site for Dan Hopwood, a public lab notebook built on the AstroPaper v5.5.1 theme (Astro + Tailwind) and deployed on Vercel.

@~/Workspace/cli-agents/shared/coding.md

## Constraints

<!-- Only what changes engineering decisions in this repo, stated as rules, not narrative. Never replace a constraint with a link: sessions must be self-sufficient in the repo. -->

- **The repo is public** – the "Edit on GitHub" link on every post depends on it. Everything committed is world-readable, including `docs/` and commit messages. Commit only what building the site needs, and keep business strategy, positioning and competitive context out of the repo
- **Every page must read as made with care before a word is read: precise, calm and understated, never showy.** The site should look like a notebook kept with care, not a blog theme. One upgraded page makes the others look unfinished, so a change to one page holds every page to the bar. A phone is composed on its own terms at 390, with the same weight as 1440. The design rules that carry this are in `docs/patterns/design-system.md`, and the calls already settled are in `docs/design-decisions.md`

## Commands

```bash
pnpm dev                # dev server at localhost:4321
pnpm build
pnpm preview
pnpm generate:favicons  # regenerate public/ favicons from the brand tokens
```

## Verification

### Preflight (every change)

- `pnpm run lint`
- `pnpm run check` – Astro typecheck
- `pnpm run format:check` – Prettier (CI enforces it, so preflight must too)

### Full verify (at completion)

1. Preflight
2. `pnpm run build` – `astro check`, the production build, then Pagefind, which writes its index into `public/`
3. Browser check, for any change to what a page renders – serve the build with `pnpm preview`, load each affected page in the Playwright MCP at 1440 and 390 in light and dark, and confirm the layout, no sideways scroll and no console errors. A colour change also measures contrast from computed colours composited onto their ground. A change to a control also reads each state's computed style while the state is held. Method: "Testing client scripts and functions" in `docs/patterns/browser-testing.md`

## Pattern index

- styling a component, changing a font, colour or theme token, or a hover, press or focus state → read `docs/patterns/design-system.md`
- adding a bulleted or numbered list, or changing how lists are indented → read `docs/patterns/lists.md`
- any visual, layout, colour or motion change, or reviewing one → read `docs/design-decisions.md` before proposing
- adding a dashed link, a ruled row or an icon inside a control, or changing one of the small details → read `docs/patterns/small-details.md`
- adding or replacing images, the avatar or favicons → read `docs/patterns/images.md`
- editing `src/utils/og-templates/` or `src/utils/loadGoogleFont.ts`, or changing the satori version → read `docs/patterns/og-images.md`
- sitemap, `llms.txt`, JSON-LD, OG metadata, `vercel.json` routes, response headers or the Markdown twins → read `docs/patterns/machine-readability.md`
- a post's title block, body, tables, figures or what follows the article → read `docs/patterns/post-page.md`
- adding routes, changing route config or writing internal links → read `docs/patterns/urls.md`
- client-side scripts, server endpoints (`api/`), content collections (including any route that reads posts), stale build output, build-time code that names CSS classes, nested CSS, the build's browser targets, upgrading Astro or editing `patches/` → read `docs/patterns/astro-build.md`
- browser-testing a client script or a change to what a page renders, testing an `api/` function, or checking build-time code with a temporary log → read `docs/patterns/browser-testing.md`
- adding, removing or upgrading a dependency → read `docs/patterns/dependencies.md`

## Key references

- writing or editing a post → `docs/content-conventions.md`
- Vercel, Plausible, Buttondown or Web3Forms configuration → `docs/external-services.md`
- Astro framework questions → the `astro-docs` MCP
