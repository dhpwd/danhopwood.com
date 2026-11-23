const THEME = "theme";
const LIGHT = "light";
const DARK = "dark";

// "light", "dark", or empty to follow the system's prefers-color-scheme.
const initialColorScheme = "";

// Reading localStorage throws where the browser blocks storage, and writing
// it also throws on a full quota. A failed read leaves the theme following the
// system, and a dropped write still holds the pick for this page-life.
function readStoredTheme(): string | null {
  try {
    return localStorage.getItem(THEME);
  } catch {
    return null;
  }
}

// Set by a pick, so it holds against a system change even when storage
// dropped it. The module runs once per full load, so the flag survives
// client-side navigation.
let pickedThisLoad = false;

function getPreferTheme(): string {
  const currentTheme = readStoredTheme();
  if (currentTheme) return currentTheme;

  if (initialColorScheme) return initialColorScheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK
    : LIGHT;
}

// window.theme is seeded by the inline pre-paint script in Layout.astro.
let themeValue = window.theme?.themeValue ?? getPreferTheme();

function setPreference(): void {
  pickedThisLoad = true;
  try {
    localStorage.setItem(THEME, themeValue);
  } catch {
    // Dropped – see readStoredTheme().
  }
  reflectPreference();
}

function reflectPreference(): void {
  const root = document.documentElement;

  // Held for one painted frame so controls flip with the text around them –
  // see "A theme change flips every colour in one frame" in
  // docs/patterns/design-system.md.
  if (root.getAttribute("data-theme") !== themeValue) {
    root.setAttribute("data-theme-switching", "");
    root.setAttribute("data-theme", themeValue);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.removeAttribute("data-theme-switching"))
    );
  }

  document
    .querySelector("#theme-btn")
    ?.setAttribute("aria-pressed", String(themeValue === DARK));

  const body = document.body;

  if (body) {
    const computedStyles = window.getComputedStyle(body);
    const bgColor = computedStyles.backgroundColor;

    document
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", bgColor);
  }
}

if (window.theme) {
  window.theme.setPreference = setPreference;
  window.theme.reflectPreference = reflectPreference;
} else {
  window.theme = {
    themeValue,
    setPreference,
    reflectPreference,
    getTheme: () => themeValue,
    setTheme: (val: string) => {
      themeValue = val;
    },
  };
}

// The inline script in Layout.astro sets data-theme only: the theme-color meta
// is taken from the body background, and <body> does not exist when it runs.
reflectPreference();

function setThemeFeature(): void {
  // A swap replaces the theme button, so its aria-pressed needs setting again.
  reflectPreference();

  document.querySelector("#theme-btn")?.addEventListener("click", () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    window.theme?.setTheme(themeValue);
    setPreference();
  });
}

setThemeFeature();

document.addEventListener("astro:after-swap", setThemeFeature);

// Carry theme-color across the swap, or Android dark mode flickers the
// navigation bar mid-transition.
document.addEventListener("astro:before-swap", event => {
  const astroEvent = event;
  const bgColor = document
    .querySelector("meta[name='theme-color']")
    ?.getAttribute("content");

  if (bgColor) {
    astroEvent.newDocument
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", bgColor);
  }
});

// A visitor's pick outlasts system changes, and only a click stores one, so a
// visitor who never picks follows the system on every visit. The stored theme
// is read here rather than at load, to catch a pick made in another tab.
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    if (pickedThisLoad || readStoredTheme()) return;

    themeValue = isDark ? DARK : LIGHT;
    window.theme?.setTheme(themeValue);
    reflectPreference();
  });
