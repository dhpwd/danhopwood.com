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

Two passes, mirroring CI (`.github/workflows/ci.yml`). Run preflight after every change. Full verify runs at completion – `/ship` invokes it as its gate.

### Preflight (every change)

- `pnpm run lint` – ESLint
- `pnpm run format:check` – Prettier (auto-fix with `pnpm run format`)

### Full verify (at completion)

1. Preflight (above)
2. `pnpm run build` – runs `astro check` (typecheck) then the production build

CI runs lint, then format:check, then build – a green local run of all three is the merge gate. Fix any issues before reporting completion.
