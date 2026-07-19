/**
 * Generates the favicon set in public/ from the brand tokens: "dh" in
 * Geist Mono 700 on the teal accent.
 *
 * Standalone script run directly by node (`pnpm generate:favicons`), so
 * paths resolve from import.meta.url, not process.cwd() – see
 * memory-bank/system-patterns.md "Satori OG templates" for the split.
 *
 * Colours mirror src/styles/global.css light-mode tokens by hand (satori
 * resolves no CSS custom properties): --accent #0f766e, --background
 * #fdfdfd. A token change there means regenerating here.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const ACCENT = "#0f766e";
const BACKGROUND = "#fdfdfd";
const MONOGRAM = "dh";

// Same subset mechanism as src/utils/loadGoogleFont.ts (not imported – that
// file is TypeScript and this script runs under plain node).
async function loadGeistMono700(text) {
  const api = `https://fonts.googleapis.com/css2?family=Geist+Mono:wght@700&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(api, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  );
  if (!resource) throw new Error("Failed to resolve Geist Mono font URL");
  const res = await fetch(resource[1]);
  if (!res.ok) throw new Error(`Font download failed: ${res.status}`);
  return res.arrayBuffer();
}

function tile(borderRadius) {
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ACCENT,
        borderRadius,
        fontFamily: "Geist Mono",
        fontWeight: 700,
        fontSize: 280,
        color: BACKGROUND,
      },
      children: MONOGRAM,
    },
  };
}

const font = await loadGeistMono700(MONOGRAM);
const fonts = [{ name: "Geist Mono", data: font, weight: 700, style: "normal" }];

async function render(node, size, file) {
  const svg = await satori(node, { width: 512, height: 512, fonts });
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
  }).render();
  writeFileSync(join(publicDir, file), png.asPng());
  // eslint-disable-next-line no-console -- CLI script, progress output is the interface
  console.log(`${file} (${size}x${size})`);
}

// Tab favicon keeps its own rounded corners (browsers render it as-is);
// the apple-touch-icon is full-bleed square because iOS applies its own mask.
await render(tile("96px"), 64, "favicon.png");
await render(tile("0"), 180, "apple-touch-icon.png");
