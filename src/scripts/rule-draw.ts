// A ruled row below the viewport draws its rule the first time the visitor
// scrolls to it. Each row's `data-rule` holds its state (empty, then
// "pending", "run" and "seen"), which also makes a second init a no-op – see
// "The rule that draws" in docs/patterns/small-details.md.

let observer: IntersectionObserver | undefined;

function initRuleDraw(): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  observer ??= new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.rule = "run";
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  for (const row of document.querySelectorAll<HTMLElement>("[data-rule]")) {
    if (row.dataset.rule) continue;
    // A row already in view at arrival never plays, since nothing the
    // visitor did brought it there.
    if (row.getBoundingClientRect().top < window.innerHeight) {
      row.dataset.rule = "seen";
      continue;
    }
    row.dataset.rule = "pending";
    observer.observe(row);
  }
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
