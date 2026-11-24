import { visit } from "unist-util-visit";

/**
 * Sizes each markdown image's `srcset` pick to the post column rather than
 * the viewport. See "Figures" in docs/patterns/post-page.md, and "Markdown
 * plugins and image optimisation" in docs/patterns/astro-build.md for why a
 * `sizes` set here reaches the rendered `<img>`.
 */

// `max-w-app` (48rem) less `app-layout`'s 1rem gutters, and the viewport
// less the gutters below it. Mirrored from src/styles/global.css by hand.
const SIZES = "(min-width: 48rem) 46rem, calc(100vw - 2rem)";

// The few hast fields this plugin reads. `@types/hast` isn't a dependency.
type Node = {
  tagName?: string;
  properties?: Record<string, unknown>;
};

export function rehypeImageSizes() {
  return function (tree: Node) {
    visit(tree as never, "element", (node: Node) => {
      // A `sizes` set earlier in the pipeline knows more than the column, so it stays
      if (node.tagName !== "img" || node.properties?.sizes) return;
      node.properties = { ...node.properties, sizes: SIZES };
    });
  };
}
