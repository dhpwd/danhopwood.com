/**
 * Shiki transformer for the `file="filename"` meta attribute on a code block.
 *
 * `style` picks the label treatment: `"v1"` sits it as a tab above the block,
 * `"v2"` as a badge overlapping the top border. The `--file-name-offset`
 * custom property it sets is read by the copy-button script in
 * `src/layouts/PostDetails.astro`, which shares that position.
 */
export const transformerFileName = ({
  style = "v2",
  hideDot = false,
} = {}) => ({
  pre(node) {
    const fileNameOffset = style === "v1" ? "0.75rem" : "-0.75rem";
    node.properties.style =
      (node.properties.style || "") + `--file-name-offset: ${fileNameOffset};`;

    const raw = this.options.meta?.__raw?.split(" ");

    if (!raw) return;

    const metaMap = new Map();

    for (const item of raw) {
      const [key, value] = item.split("=");
      if (!key || !value) continue;
      metaMap.set(key, value.replace(/["'`]/g, ""));
    }

    const file = metaMap.get("file");

    if (!file) return;

    // The label sits at or above the block's top edge, so it needs the room.
    this.addClassToHast(
      node,
      `mt-8 ${style === "v1" ? "rounded-tl-none" : ""}`
    );

    node.children.push({
      type: "element",
      tagName: "span",
      properties: {
        class: [
          "absolute py-1 text-foreground text-xs font-medium leading-4",
          hideDot
            ? "px-2"
            : "pl-4 pr-2 before:inline-block before:size-1 before:bg-green-500 before:rounded-full before:absolute before:top-[45%] before:left-2",
          style === "v1"
            ? "left-0 -top-6 rounded-t-md border border-b-0 bg-muted/50"
            : "left-2 top-(--file-name-offset) border rounded-md bg-background",
        ],
      },
      children: [
        {
          type: "text",
          value: file,
        },
      ],
    });
  },
});
