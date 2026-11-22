/**
 * Shared constants for the dynamic OG templates (post.js, site.js).
 *
 * Palette mirrors the light-mode theme tokens in src/styles/global.css by
 * hand: satori resolves no CSS custom properties, so a token change there
 * must be propagated here. Values marked "no token" are deliberate
 * deviations – the muted/border tokens are too faint to survive a feed
 * thumbnail at this size.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SITE } from "@/config";

let cachedAvatar;

/**
 * Read lazily, not at module scope: importing this module must not do I/O,
 * so a build with dynamicOgImage off never touches the file and a missing
 * avatar fails where it is used rather than on import.
 *
 * Resolved from cwd, not import.meta.url: Astro bundles this module into
 * dist/chunks/ at build time, so a module-relative path lands outside the
 * project. Safe because the site is a static build – these templates only
 * ever run from the project root, never in a serverless runtime.
 */
export function avatarSrc() {
  if (!cachedAvatar) {
    const data = readFileSync(
      join(process.cwd(), "src/assets/images/avatar.jpeg")
    ).toString("base64");
    cachedAvatar = `data:image/jpeg;base64,${data}`;
  }
  return cachedAvatar;
}

export const hostname = new URL(SITE.website).hostname;

export const tagline = "Showing my working.";

export const palette = {
  background: "#fdfdfd", // --background
  foreground: "#282728", // --foreground
  accent: "#a13124", // --accent
  body: "#57565a", // no token – between --foreground and --muted, for body copy
  grid: "#d8d8d8", // no token – --muted (#e6e6e6) is invisible at thumbnail scale
  rule: "#d9d6d6", // no token – --border (#ece9e9) is invisible at thumbnail scale
  separator: "#b0adad", // no token – mid-grey for the "·" separator
  faint: "#8a8a8a", // no token – muted grey for the tagline
};

/** Card title – the site's page-title treatment at card scale. */
export const titleStyle = {
  display: "block",
  fontSize: 64,
  fontWeight: 600,
  lineHeight: 1.12,
  letterSpacing: "-0.028em",
  color: palette.foreground,
  fontFamily: "Geist",
};

/** Faint dot grid – the lab-notebook ground shared by both templates. */
export const dotGrid = {
  backgroundImage: `radial-gradient(circle at 16px 16px, ${palette.grid} 6%, transparent 6%)`,
  backgroundSize: "32px 32px",
};

/** Accent bar across the top edge. A factory, so no element object is
 * shared between render trees. */
export const accentBar = () => ({
  type: "div",
  props: {
    style: {
      height: "12px",
      width: "100%",
      flexShrink: 0,
      background: palette.accent,
    },
  },
});
