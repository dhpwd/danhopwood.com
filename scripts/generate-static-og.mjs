/**
 * Regenerates the static site OG image (public/og-image.png).
 * Run: node scripts/generate-static-og.mjs
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const NAME = "Dan Hopwood";
const TAGLINE = ["Building with AI agents.", "Showing my working."];
const DOMAIN = "danhopwood.com";

const UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

async function loadFont(weight, text) {
  const api = `https://fonts.googleapis.com/css2?family=Google+Sans+Code:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(api, { headers: { "User-Agent": UA } })).text();
  const url = css.match(/src: url\((.+?)\)/)?.[1];
  if (!url) throw new Error(`No font URL for weight ${weight}`);
  return await (await fetch(url)).arrayBuffer();
}

const allText = NAME + TAGLINE.join("") + DOMAIN;
const [regular, bold] = await Promise.all([
  loadFont(400, allText),
  loadFont(700, allText),
]);

const avatar = fs.readFileSync(path.join(root, "src/assets/images/avatar.jpeg"));
const avatarSrc = `data:image/jpeg;base64,${avatar.toString("base64")}`;

const svg = await satori(
  {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7f5",
        gap: "72px",
      },
      children: [
        {
          type: "img",
          props: {
            src: avatarSrc,
            width: 355,
            height: 355,
            style: { borderRadius: "50%", objectFit: "cover" },
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column" },
            children: [
              {
                type: "p",
                props: {
                  style: {
                    fontSize: 76,
                    fontWeight: 700,
                    color: "#18181b",
                    margin: 0,
                  },
                  children: NAME,
                },
              },
              ...TAGLINE.map((line, i) => ({
                type: "p",
                props: {
                  style: {
                    fontSize: 36,
                    color: "#27272a",
                    margin: 0,
                    marginTop: i === 0 ? 36 : 10,
                  },
                  children: line,
                },
              })),
              {
                type: "p",
                props: {
                  style: {
                    fontSize: 32,
                    color: "#a1a1aa",
                    margin: 0,
                    marginTop: 34,
                  },
                  children: DOMAIN,
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Google Sans Code", data: regular, weight: 400, style: "normal" },
      { name: "Google Sans Code", data: bold, weight: 700, style: "normal" },
    ],
  }
);

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
}).render().asPng();

fs.writeFileSync(path.join(root, "public/og-image.png"), png);
// eslint-disable-next-line no-console
console.log("Written public/og-image.png");
