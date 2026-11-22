# Dependencies

## Adding a package without lockfile churn

**Problem:** CI installs with pnpm 10.11.1 (`.github/workflows/ci.yml`), which runs a frozen install, but the lockfile holds fields that version doesn't write. Adding a package with 10.11.1 drops every `libc:` field from the lockfile, and without them CI installs the musl build of each native package (sharp, lightningcss, rollup, resvg, Tailwind's oxide) beside the glibc one. A newer major, such as the box's pnpm 12, rewrites the peer-dependency suffixes on unrelated entries instead. CI accepts the 10.11.1 output, so nothing reports the extra installs.

**Solution:** add with the latest pnpm 10, `npx pnpm@10 add <package>`, which writes the lockfile in the form it already holds: the diff is the new entries only. Then confirm CI accepts it with `npx pnpm@10.11.1 install --frozen-lockfile`. If a later pnpm 10 also rewrites unrelated entries, read the lockfile diff and pick the version whose diff is additions only.

**When to use:** any change to `package.json`'s dependencies or `pnpm-lock.yaml`.
