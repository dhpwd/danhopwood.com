const THEME = "theme";
const LIGHT = "light";
const DARK = "dark";

// "light", "dark", or empty to follow the system's prefers-color-scheme.
const initialColorScheme = "";

function getPreferTheme(): string {
  const currentTheme = localStorage.getItem(THEME);
  if (currentTheme) return currentTheme;

  if (initialColorScheme) return initialColorScheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK
    : LIGHT;
}

// window.theme is seeded by the inline pre-paint script in Layout.astro.
let themeValue = window.theme?.themeValue ?? getPreferTheme();

function setPreference(): void {
  localStorage.setItem(THEME, themeValue);
  reflectPreference();
}

function reflectPreference(): void {
  document.firstElementChild?.setAttribute("data-theme", themeValue);

  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);

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
  // A swap replaces the theme button, so its aria-label needs setting again.
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

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    themeValue = isDark ? DARK : LIGHT;
    window.theme?.setTheme(themeValue);
    setPreference();
  });
