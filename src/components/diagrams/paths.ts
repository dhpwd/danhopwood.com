// Path data for a diagram's connectors, in the px of its grid. A line ends on
// a card in a half disc, flat against the card's edge – see "Connectors on a
// fixed grid" in docs/patterns/diagrams.md
const R = 3.5;

// A half disc below a horizontal edge at y, centred on x
export const under = (x: number, y: number) =>
  `M${x - R} ${y}A${R} ${R} 0 0 0 ${x + R} ${y}Z`;

// A half disc above a horizontal edge at y, centred on x
export const over = (x: number, y: number) =>
  `M${x - R} ${y}A${R} ${R} 0 0 1 ${x + R} ${y}Z`;

// A half disc left of a vertical edge at x, centred on y
export const left = (x: number, y: number) =>
  `M${x} ${y - R}A${R} ${R} 0 0 0 ${x} ${y + R}Z`;

// A half disc right of a vertical edge at x, centred on y
export const right = (x: number, y: number) =>
  `M${x} ${y - R}A${R} ${R} 0 0 1 ${x} ${y + R}Z`;

// A bar at y = bar joining a drop at each x, each drop running to y = end
export const bracket = (xs: number[], bar: number, end: number) =>
  `M${xs[0]} ${end}V${bar}H${xs[xs.length - 1]}V${end}` +
  xs
    .slice(1, -1)
    .map(x => `M${x} ${bar}V${end}`)
    .join("");
