import { visit } from "unist-util-visit";

/**
 * Sizes each markdown image's `srcset` pick to the column the image fills,
 * not the viewport, so the browser downloads the smallest generated width
 * that fills the column at the screen's pixel density.
 *
 * Runs before Astro's own `rehypeImages`, which carries the `img`'s
 * properties into `getImage`, and `getImage` keeps a `sizes` it is given.
 * An `img` that already has a `sizes` keeps it. See "Figures" in
 * docs/patterns/post-page.md.
 */

// The column `app-layout` sets: `max-w-app` (48rem) less its 1rem gutters
// from a 48rem viewport up, and the viewport less the gutters below it.
// Mirrored from src/styles/global.css by hand. In rem, like the column, so a
// reader with a larger default font size gets a file for their wider column.
const SIZES = "(min-width: 48rem) 46rem, calc(100vw - 2rem)";

// The few hast fields this plugin reads. `@types/hast` isn't a dependency.
type Node = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
};

export function rehypeImageSizes() {
  return function (tree: Node) {
    visit(tree as never, "element", (node: Node) => {
      if (node.tagName !== "img" || node.properties?.sizes) return;
      node.properties = { ...node.properties, sizes: SIZES };
    });
  };
}
