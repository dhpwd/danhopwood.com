import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { fromHtml } from "hast-util-from-html";
import { select, selectAll } from "hast-util-select";
import { toMdast } from "hast-util-to-mdast";
import { gfmToMarkdown } from "mdast-util-gfm";
import { toMarkdown, type Options } from "mdast-util-to-markdown";

/**
 * Writes the Markdown twin of every page in the sitemap beside its built HTML
 * (`/about` → `/about.md`), and fails the build when the twin set and
 * vercel.json's page regex disagree. What each part reads and why: "Agents
 * asking for Markdown" in docs/patterns/machine-readability.md.
 */

type Root = ReturnType<typeof fromHtml>;
type Element = NonNullable<ReturnType<typeof select>>;

// Interface text that isn't page content, and on a post what follows the
// article. `.sr-only` text stays, since it is what a screen reader reads.
const DROP =
  "[aria-hidden='true'], svg, script, style, button, form, nav, .newsletter-signup, #pagefind-search, [data-pagefind-ui], #article ~ *";

const MARKDOWN_OPTIONS: Options = {
  extensions: [gfmToMarkdown()],
  bullet: "-",
  emphasis: "_",
  rule: "-",
};

/** Every URL path in the built sitemap. */
function sitemapPaths(dist: string) {
  return readdirSync(dist)
    .filter(f => /^sitemap-\d+\.xml$/.test(f))
    .flatMap(f =>
      [
        ...readFileSync(join(dist, f), "utf-8").matchAll(
          /<loc>([^<]+)<\/loc>/g
        ),
      ].map(m => new URL(m[1]).pathname)
    );
}

/** The URL path of every built `index.html` below the root, at any depth. */
function builtPagePaths(dist: string, path = ""): string[] {
  return readdirSync(join(dist, path), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(entry => {
      const child = `${path}/${entry.name}`;
      const nested = builtPagePaths(dist, child);
      return existsSync(join(dist, child, "index.html"))
        ? [child, ...nested]
        : nested;
    });
}

/** A built page's title and main content as Markdown, or what stops it. */
function pageToMarkdown(
  html: string
): { markdown: string } | { problem: string } {
  const tree = fromHtml(html);
  const main = select("#main-content", tree);
  if (!main) return { problem: "has no #main-content" };
  const headings = selectAll("h1", main);
  if (headings.length !== 1)
    return { problem: `has ${headings.length} h1 elements in <main>, not one` };
  const [h1] = headings;
  const root: Root = { type: "root", children: [h1, main] };

  // hast-util-to-mdast reads a code block's language from `code`'s class,
  // where Shiki puts it on `pre`.
  for (const pre of selectAll("pre.astro-code[data-language]", main)) {
    const code = pre.children.find(
      (child): child is Element =>
        child.type === "element" && child.tagName === "code"
    );
    const lang = String(pre.properties.dataLanguage);
    if (code && lang !== "plaintext")
      code.properties.className = [`language-${lang}`];
  }

  // A flex or grid item is its own box, so on the page its text never runs
  // on from the item before it (a tag's name and its count on /tags).
  for (const box of selectAll(".flex, .inline-flex, .grid, .ledger", main))
    box.children = box.children.flatMap((child, i) =>
      i === 0 ? [child] : [{ type: "text", value: " " }, child]
    );

  // The h1 leads the twin, so it leaves its place in the content. HTML
  // comments are notes in the source, not page text.
  const drop = new Set<unknown>([...selectAll(DROP, main), h1]);
  const prune = (node: Element) => {
    node.children = node.children.filter(
      child => child.type !== "comment" && !drop.has(child)
    );
    for (const child of node.children)
      if (child.type === "element") prune(child);
  };
  prune(h1);
  prune(main);

  return { markdown: toMarkdown(toMdast(root), MARKDOWN_OPTIONS) };
}

/**
 * Writes a twin for every sitemap page into `dist`, then fails the build,
 * naming each offender, if a page can't have one or the twins and
 * vercel.json's page regex disagree.
 */
function writeTwins(dist: string) {
  const problems: string[] = [];
  const twins = new Set<string>();

  const paths = sitemapPaths(dist);
  for (const path of paths) {
    const result = pageToMarkdown(
      readFileSync(join(dist, path, "index.html"), "utf-8")
    );
    if ("problem" in result) {
      problems.push(`${path} has no twin: its page ${result.problem}`);
      continue;
    }
    if (!result.markdown.startsWith("# "))
      problems.push(`${path}'s twin doesn't start with "# "`);
    writeFileSync(
      join(dist, path === "/" ? "index.md" : `${path}.md`),
      result.markdown
    );
    twins.add(path);
  }

  // vercel.json's `^/$` routes serve /index.md whatever the sitemap holds.
  if (!paths.includes("/"))
    problems.push(
      "/ isn't in the sitemap, so it has no twin, but vercel.json's ^/$ routes serve /index.md"
    );

  // The routes that use the page regex, found by what they do: the alternate
  // `Link` to `/$1.md` and the negotiation to `/$1.md`.
  const { routes } = JSON.parse(
    readFileSync(join(process.cwd(), "vercel.json"), "utf-8")
  ) as {
    routes: {
      src?: string;
      dest?: string;
      handle?: string;
      headers?: { link?: string };
    }[];
  };
  const pageRoutes = routes.filter(
    r => r.dest === "/$1.md" || r.headers?.link?.startsWith("</$1.md>")
  );
  if (pageRoutes.length !== 2 || pageRoutes[0].src !== pageRoutes[1].src) {
    problems.push(
      "vercel.json's alternate-link and negotiation routes no longer share one page regex"
    );
  } else {
    const filesystem = routes.findIndex(r => r.handle === "filesystem");
    if (
      filesystem === -1 ||
      pageRoutes.some(r => routes.indexOf(r) > filesystem)
    )
      problems.push(
        'vercel.json\'s page-regex routes must come before { "handle": "filesystem" }'
      );
    // Both slash forms of a page with a twin must match and capture its own
    // path, since the routes send `$1` to /$1.md.
    const pageRegex = new RegExp(pageRoutes[0].src ?? "");
    for (const path of builtPagePaths(dist)) {
      const forms = [path, `${path}/`];
      if (!twins.has(path)) {
        if (forms.some(p => pageRegex.test(p)))
          problems.push(
            `vercel.json's page regex matches ${path}, which has no twin`
          );
      } else if (!forms.every(p => pageRegex.exec(p)?.[1] === path.slice(1))) {
        problems.push(
          `vercel.json's page regex doesn't send ${path} and ${path}/ to its twin`
        );
      }
    }
  }

  if (problems.length)
    throw new Error(
      `Markdown twins: ${problems.join("; ")} – see "Agents asking for Markdown" in docs/patterns/machine-readability.md`
    );
}

/** Runs after `sitemap()`, whose output it reads. */
export function markdownTwins(): AstroIntegration {
  return {
    name: "danhopwood-twins",
    hooks: {
      "astro:build:done": ({ dir }) => writeTwins(fileURLToPath(dir)),
    },
  };
}
