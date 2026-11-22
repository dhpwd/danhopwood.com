import { visit } from "unist-util-visit";

/**
 * Prepares markdown tables for the phone layout, where each row is a block
 * and each cell after the first carries its column heading as a label.
 *
 * Sets `data-label` on every body cell from the heading above it, which the
 * table rules in src/styles/typography.css print through `attr()`. Sets the
 * ARIA table roles as well, because a browser drops a table's semantics once
 * its rows and cells are `display: block`. See "Tables" in
 * docs/patterns/post-page.md.
 */

// The few hast fields this plugin reads. `@types/hast` isn't a dependency.
type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

const ROLES: Record<string, string> = {
  table: "table",
  thead: "rowgroup",
  tbody: "rowgroup",
  tr: "row",
  th: "columnheader",
  td: "cell",
};

function textOf(node: Node): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function elements(node: Node, tagName: string): Node[] {
  return (node.children ?? []).filter(child => child.tagName === tagName);
}

export function rehypeTableLabels() {
  return function (tree: Node) {
    visit(tree as never, "element", (node: Node) => {
      const role = node.tagName && ROLES[node.tagName];
      if (role) node.properties = { ...node.properties, role };

      if (node.tagName !== "table") return;
      const table = node;

      const headRow = elements(table, "thead").flatMap(head =>
        elements(head, "tr")
      )[0];
      const labels = headRow ? elements(headRow, "th").map(textOf) : [];

      for (const body of elements(table, "tbody")) {
        for (const row of elements(body, "tr")) {
          elements(row, "td").forEach((cell, index) => {
            const label = labels[index]?.trim();
            if (label) {
              cell.properties = { ...cell.properties, dataLabel: label };
            }
          });
        }
      }
    });
  };
}
