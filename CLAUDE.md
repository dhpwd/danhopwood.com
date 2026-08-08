# danhopwood.com

Personal site for Dan Hopwood, a public lab notebook built on the AstroPaper v5.5.1 theme (Astro + Tailwind) and deployed on Vercel.

@~/Workspace/cli-agents/shared/coding.md

## Strategic context

<!-- Digest of vault strategy: only constraints that change engineering decisions in this repo, stated as rules, not narrative. The vault is canonical – when vault strategy moves, update this digest, never the reverse. Never replace the digest with a vault link: sessions must be self-sufficient in the repo. -->

- **The repo is public** – the "Edit on GitHub" link on every post depends on it. Everything committed is world-readable, including `docs/` and commit messages. Commit only what building the site needs, and keep business strategy, positioning and competitive context out of the repo

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
2. `pnpm run build` – runs `astro check`, then the production build

## Pattern index

- styling a component, or changing a font, colour or theme token → read `docs/patterns/design-system.md`
- adding or replacing images, the avatar or favicons → read `docs/patterns/images.md`
- editing `src/utils/og-templates/` → read `docs/patterns/og-images.md`
- sitemap, `llms.txt`, JSON-LD or OG metadata → read `docs/patterns/machine-readability.md`
- changing what appears after the article body → read `docs/patterns/post-page.md`
- adding routes, changing route config or writing internal links → read `docs/patterns/urls.md`
- client-side scripts, content collections or stale build output → read `docs/patterns/astro-build.md`

## Key references

- writing or editing a post → `docs/content-conventions.md`
- Vercel, Plausible or Buttondown configuration → `docs/external-services.md`
- Astro framework questions → the `astro-docs` MCP
