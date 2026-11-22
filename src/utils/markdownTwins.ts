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

// Interface text that isn't page content. `.sr-only` text stays, since it is
// what a screen reader reads.
const DROP =
  "[aria-hidden='true'], svg, script, style, button, form, nav, .newsletter-signup, #pagefind-search, [data-pagefind-ui]";

const MARKDOWN_OPTIONS: Options = {
  extensions: [gfmToMarkdown()],
  bullet: "-",
  emphasis: "_",
  rule: "-",
};

const trimSlash = (path: string) => path.replace(/(.)\/$/, "$1");

/** Every URL path in the built sitemap. */
function sitemapPaths(dist: string) {
  return readdirSync(dist)
    .filter(f => /^sitemap-.+\.xml$/.test(f) && f !== "sitemap-index.xml")
    .flatMap(f =>
      [
        ...readFileSync(join(dist, f), "utf-8").matchAll(
          /<loc>([^<]+)<\/loc>/g
        ),
      ].map(m => trimSlash(new URL(m[1]).pathname))
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
function pageToMarkdown(html: string): { markdown?: string; problem?: string } {
  const tree = fromHtml(html);
  const main = select("#main-content", tree);
  if (!main) return { problem: "has no #main-content" };
  const headings = selectAll("h1", main);
  if (headings.length !== 1)
    return { problem: `has ${headings.length} h1 elements in <main>, not one` };
  const [h1] = headings;

  // A post's twin ends with the article, before the signup, tags and links
  // that follow it. Its date line is the eyebrow above the title.
  const article = select("#article", main);
  const content = article
    ? [select(".eyebrow", main), article].filter(node => node !== undefined)
    : [main];
  const root: Root = { type: "root", children: [h1, ...content] };

  // hast-util-to-mdast reads a code block's language from `code`'s class,
  // where Shiki puts it on `pre`.
  for (const pre of selectAll("pre.astro-code[data-language]", root)) {
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
  // Tailwind reads this file for class names, so a class named here that no
  // page uses would add a rule to the site's CSS and change every page.
  for (const box of selectAll(".flex, .inline-flex, .grid", root))
    box.children = box.children.flatMap((child, i) =>
      i === 0 ? [child] : [{ type: "text", value: " " }, child]
    );

  // The h1 leads the twin, so it leaves its place in the content. HTML
  // comments are notes in the source, not page text.
  const drop = new Set<unknown>(selectAll(DROP, root));
  const prune = (node: Root | Element) => {
    node.children = (node.children as Element["children"]).filter(
      child =>
        child.type !== "comment" &&
        !drop.has(child) &&
        (child !== h1 || node === root)
    );
    for (const child of node.children)
      if (child.type === "element") prune(child);
  };
  prune(root);

  return { markdown: toMarkdown(toMdast(root), MARKDOWN_OPTIONS) };
}

/**
 * Writes a twin for every sitemap page into `dist`, then fails the build,
 * naming each offender, if a page can't have one or the twins and
 * vercel.json's page regex disagree.
 */
function writeTwins(dist: string) {
  const problems: string[] = [];
  const twinFile = (path: string) =>
    join(dist, path === "/" ? "index.md" : `${path}.md`);

  const paths = sitemapPaths(dist);
  for (const path of paths) {
    const { markdown, problem } = pageToMarkdown(
      readFileSync(join(dist, path.slice(1), "index.html"), "utf-8")
    );
    if (markdown === undefined) {
      problems.push(`${path}'s page ${problem}`);
      continue;
    }
    if (!markdown.startsWith("# "))
      problems.push(`${path}'s twin doesn't start with "# "`);
    writeFileSync(twinFile(path), markdown);
  }

  // Read back from disk, so a page the loop above skips is caught too.
  const twins = new Set(paths.filter(path => existsSync(twinFile(path))));
  for (const path of paths)
    if (!twins.has(path))
      problems.push(`${path} is in the sitemap but has no twin`);

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
  const sources = new Set(pageRoutes.map(r => r.src));
  if (pageRoutes.length !== 2 || sources.size !== 1) {
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
    const pageRegex = new RegExp([...sources][0] ?? "");
    for (const path of builtPagePaths(dist)) {
      const matches = [path, `${path}/`].map(p => pageRegex.exec(p));
      const wrong = matches.find(m => m && `/${m[1]}` !== path);
      if (!twins.has(path)) {
        if (matches.some(Boolean))
          problems.push(
            `vercel.json's page regex matches ${path}, which has no twin`
          );
      } else if (!matches.every(Boolean)) {
        problems.push(
          `vercel.json's page regex misses ${path} or ${path}/, which has a twin`
        );
      } else if (wrong) {
        problems.push(
          `vercel.json's page regex sends ${path} to /${wrong[1]}.md, not its twin`
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
