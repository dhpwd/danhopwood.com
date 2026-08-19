import type { Paragraph, PhrasingContent, Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Renders an image followed by an italic line as a <figure>/<figcaption> pair:
 *
 *     ![alt text](../../assets/images/example.png)
 *     _The caption._
 *
 * The caption stays ordinary markdown rather than an image `title`, so it is
 * processed like any other prose (links, emphasis, inline code and smart
 * punctuation all apply) and remains visible wherever the post is read as raw
 * markdown – see docs/patterns/images.md.
 *
 * Operating on the mdast, and via hName rather than raw HTML, keeps the image
 * a genuine `image` node: Astro's own collection and optimisation passes run
 * over it unchanged.
 */

// A line break between the image and the caption arrives as a text node holding
// the newline, or as an explicit `break` where the author left two trailing
// spaces. Requiring the newline is what separates a caption from emphasis
// written alongside the image on the same line, which is divided from it by a
// plain space and has to stay inline prose.
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
