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

// Resolved from cwd, not import.meta.url: Astro bundles this module into
// dist/chunks/ at build time, so a module-relative path lands outside the
// project. Safe because the site is a static build – these templates only
// ever run from the project root, never in a serverless runtime.
const avatarBase64 = readFileSync(
  join(process.cwd(), "src/assets/images/avatar.jpeg")
).toString("base64");

export const avatarSrc = `data:image/jpeg;base64,${avatarBase64}`;

export const hostname = new URL(SITE.website).hostname;

export const tagline = "Showing my working.";

export const palette = {
  background: "#fdfdfd", // --background
  foreground: "#282728", // --foreground
  accent: "#006cac", // --accent
  body: "#57565a", // no token – between --foreground and --muted, for body copy
  grid: "#d8d8d8", // no token – --muted (#e6e6e6) is invisible at thumbnail scale
  rule: "#d9d6d6", // no token – --border (#ece9e9) is invisible at thumbnail scale
  separator: "#b0adad", // no token – mid-grey for the "·" separator
  faint: "#8a8a8a", // no token – muted grey for the tagline
};

/** Faint dot grid – the lab-notebook ground shared by both templates. */
export const dotGrid = {
  backgroundImage: `radial-gradient(circle at 16px 16px, ${palette.grid} 6%, transparent 6%)`,
  backgroundSize: "32px 32px",
};

/** Accent bar across the top edge. */
export const accentBar = {
  type: "div",
  props: {
    style: {
      height: "12px",
      width: "100%",
      background: palette.accent,
    },
  },
};

/**
 * Text the font subset must cover. Satori appends U+2026 when lineClamp
 * truncates, so the ellipsis has to be in the subset or it renders as a
 * missing-glyph box.
 */
export const CHROME_GLYPHS = `${hostname}${tagline}·…`;
