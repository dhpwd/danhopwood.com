// A ruled row below the viewport draws its rule the first time the visitor
// scrolls to it. Each row's `data-rule` holds its state (empty, then
// "pending", "run" and "seen"), which also makes a second init a no-op – see
// "The rule that draws" in docs/patterns/small-details.md.

let observer: IntersectionObserver | undefined;

// :target isn't set yet when this first runs on a page loaded with a #hash
function fragmentTarget(): HTMLElement | null {
  try {
    return document.getElementById(decodeURIComponent(location.hash.slice(1)));
  } catch {
    return null; // a malformed fragment such as #% targets nothing
  }
}

// Where the page comes to rest. The router restores a saved position, and the
// browser scrolls to a #hash, smoothly and after this runs, so the position
// now is not yet where the visitor lands.
function landingY(): number {
  const saved = history.state?.scrollY;
  if (typeof saved === "number" && saved > 0) return saved;
  const target = fragmentTarget();
  if (!target) return window.scrollY;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(target.getBoundingClientRect().top + window.scrollY, maxY);
}

function initRuleDraw(): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const io = (observer ??= new IntersectionObserver(
    (entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.rule = "run";
        self.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  ));

  const rows = [
    ...document.querySelectorAll<HTMLElement>("[data-rule]"),
  ].filter(row => !row.dataset.rule);
  // Every position is read before any row is marked, so marking one doesn't
  // make the next read recalculate styles.
  const tops = rows.map(
    row => row.getBoundingClientRect().top + window.scrollY
  );
  const landingBottom = landingY() + window.innerHeight;
  rows.forEach((row, i) => {
    // A row in view where the visitor lands, or above it, never plays, since
    // nothing the visitor did brought it there.
    if (tops[i] < landingBottom) {
      row.dataset.rule = "seen";
      return;
    }
    row.dataset.rule = "pending";
    io.observe(row);
  });
}

// The phone menu's rule plays rule-draw too, on an element with no
// data-rule, so only a row that is running moves on.
document.addEventListener("animationend", event => {
  if (event.animationName !== "rule-draw") return;
  const row = event.target as HTMLElement;
  if (row.dataset.rule === "run") row.dataset.rule = "seen";
});

document.addEventListener("astro:before-swap", () => {
  observer?.disconnect();
  observer = undefined;
});

document.addEventListener("astro:page-load", initRuleDraw);
initRuleDraw();
