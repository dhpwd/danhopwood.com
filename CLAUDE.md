# danhopwood.com

Personal site for Dan Hopwood. Built with AstroPaper (Astro theme).

@~/Workspace/cli-agents/shared/coding.md

## Commands

```bash
pnpm dev        # local dev server at localhost:4321
pnpm build      # production build to ./dist/
pnpm preview    # preview production build locally
```

## Verification

Run preflight after every change. Full verify runs at completion (`/ship` gates on it).

### Preflight (every change)

- `pnpm run lint`
- `pnpm run check` – Astro typecheck

### Full verify (at completion)

1. Preflight
2. `pnpm run build` – `astro check` then the production build

Fix any issues before reporting completion.
