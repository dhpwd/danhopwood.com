import { readdirSync, readFileSync } from "node:fs";
import { slugifyStr } from "./slugify";

/**
 * Build a map of post URL path -> last-modified Date, sourced from each post's
 * frontmatter using the same `modDatetime ?? pubDatetime` precedence as
 * getSortedPosts (it does not replicate postFilter's scheduled-post exclusion;
 * an orphan entry for a future-dated post is never read, as the serialize hook
 * only stamps URLs the sitemap already emits).
 *
 * Consumed by the sitemap `serialize` hook in astro.config.ts to emit
 * `<lastmod>` freshness signals. It lives here, parsing markdown directly,
 * because astro.config cannot import `astro:content` (no getCollection).
 * Frontmatter dates are a more honest signal than git commit dates, which
 * collapse to the build time on shallow-clone deployments.
 */

// Kept in sync with BLOG_PATH in src/content.config.ts (can't import it here:
// content.config pulls in astro:content).
const BLOG_PATH = "src/data/blog";

// Mirror of getPath() URL construction (src/utils/getPath.ts) for the no-custom-
// slug case: directory segments are slugified (with `_`-prefixed segments
// dropped, as getPath does), and the filename is used verbatim as the slug.
// Drift only costs a missing <lastmod>, never a broken build.
const postUrlPath = (idSegments: string[]): string => {
  const dirs = idSegments
    .slice(0, -1)
    .filter(segment => !segment.startsWith("_"))
    .map(slugifyStr);
  const slug = idSegments[idSegments.length - 1];
  return ["/posts", ...dirs, slug].join("/");
};

// Recursively collect published post files, mirroring the loader glob
// "**/[^_]*.md": any `.md` whose filename does not start with `_`. Directories
// are traversed unconditionally (including `_`-prefixed ones) to match the glob;
// getPath then strips `_` segments from the resulting URL.
const collectPostFiles = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      out.push(...collectPostFiles(full));
    } else if (entry.name.endsWith(".md") && !entry.name.startsWith("_")) {
      out.push(full);
    }
  }
  return out;
};

const frontmatterValue = (block: string, key: string): string | undefined => {
  const match = block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1].trim().replace(/^["']|["']$/g, "");
};

// Parse a frontmatter date value to a valid Date, or undefined when absent,
// empty, null, or unparseable, so the modDatetime -> pubDatetime fallback fires
// instead of dropping the post (modDatetime is `.nullable()` in the schema).
const parseDate = (value: string | undefined): Date | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const getPostModDates = (): Map<string, Date> => {
  const dates = new Map<string, Date>();
  for (const file of collectPostFiles(BLOG_PATH)) {
    const raw = readFileSync(file, "utf-8");
    const block = raw.split(/^---\s*$/m)[1] ?? "";
    if (/^draft:\s*true\s*$/m.test(block)) continue;

    const date =
      parseDate(frontmatterValue(block, "modDatetime")) ??
      parseDate(frontmatterValue(block, "pubDatetime"));
    if (!date) continue;

    const idSegments = file
      .slice(BLOG_PATH.length + 1)
      .replace(/\.md$/, "")
      .split("/");
    dates.set(postUrlPath(idSegments), date);
  }
  return dates;
};
