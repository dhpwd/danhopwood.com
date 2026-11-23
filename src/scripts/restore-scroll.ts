// Makes a Back or Forward restore jump rather than glide – see "Nothing
// scrolls on astro:after-swap" in docs/patterns/astro-build.md.
document.addEventListener(
  "astro:before-swap",
  ({ navigationType, newDocument }) => {
    if (navigationType === "traverse")
      newDocument.documentElement.style.scrollBehavior = "auto";
  }
);

document.addEventListener("astro:after-swap", () => {
  document.documentElement.style.removeProperty("scroll-behavior");
});
