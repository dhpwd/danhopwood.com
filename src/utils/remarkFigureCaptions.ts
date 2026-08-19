import type { Paragraph, PhrasingContent, Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Renders an image followed by an italic line on the next line as a
 * <figure>/<figcaption> pair.
 *
 * Why a caption is authored this way rather than as an image `title`:
 * docs/patterns/images.md. Why this rewrites the mdast and sets hName instead
 * of emitting raw HTML, which is what preserves Astro's image optimisation:
 * docs/patterns/astro-build.md.
 */

// A line break arrives as a text node holding the newline, or as an explicit
// `break` where the author left two trailing spaces. Requiring the newline is
// what keeps emphasis written alongside an image on one line as inline prose.
function isLineBreak(node: PhrasingContent): boolean {
  return (
    node.type === "break" || (node.type === "text" && node.value.includes("\n"))
  );
}

export function remarkFigureCaptions() {
  return function (tree: Root) {
    visit(tree, "paragraph", (node: Paragraph) => {
      // The blank-line form (image and italic as separate paragraphs) is left
      // alone: it is how an author opts out of captioning an emphasised line.
      if (node.children.length !== 3) return;

      const [image, lineBreak, caption] = node.children;
      if (image.type !== "image") return;
      if (!isLineBreak(lineBreak)) return;
      if (caption.type !== "emphasis") return;

      // Retagging the emphasis node itself, rather than building a new one,
      // keeps the caption's own children untouched and the tree well-typed.
      caption.data = { ...caption.data, hName: "figcaption" };
      node.data = { ...node.data, hName: "figure" };
      node.children = [image, caption];
    });
  };
}
