// :target isn't set yet when a page's script first runs on a load with a #hash
function fragmentTarget(): HTMLElement | null {
  try {
    return document.getElementById(decodeURIComponent(location.hash.slice(1)));
  } catch {
    return null; // a malformed fragment such as #% targets nothing
  }
}

// Where the page comes to rest. The router restores a saved position, and the
// browser scrolls to a #hash, smoothly and after a page's script first runs,
// so the position then is not yet where the visitor lands – see "Client
// scripts and View Transitions" in docs/patterns/client-scripts.md.
export function landingY(): number {
  const saved = history.state?.scrollY;
  if (typeof saved === "number" && saved > 0) return saved;
  const target = fragmentTarget();
  if (!target) return window.scrollY;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(target.getBoundingClientRect().top + window.scrollY, maxY);
}
