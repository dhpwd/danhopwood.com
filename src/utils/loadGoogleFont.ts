type Font = { name: string; data: ArrayBuffer; weight: number; style: string };

async function loadGoogleFont(
  font: string,
  weight: number
): Promise<ArrayBuffer> {
  const API = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`;

  const css = await (
    await fetch(API, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) throw new Error("Failed to download dynamic font");

  const res = await fetch(resource[1]);

  if (!res.ok) {
    throw new Error("Failed to download dynamic font. Status: " + res.status);
  }

  return res.arrayBuffer();
}

const fontsConfig = [
  {
    name: "Geist",
    font: "Geist",
    weight: 400,
    style: "normal",
  },
  {
    name: "Geist",
    font: "Geist",
    weight: 600,
    style: "normal",
  },
  {
    name: "Geist Mono",
    font: "Geist+Mono",
    weight: 400,
    style: "normal",
  },
  {
    name: "Geist Mono",
    font: "Geist+Mono",
    weight: 700,
    style: "normal",
  },
];

// One download per font per build, shared by every card. A rejected load is
// dropped so the next call retries rather than replaying the failure for the
// life of the process (`pnpm dev`).
let fonts: Promise<Font[]> | undefined;

function loadGoogleFonts(): Promise<Font[]> {
  fonts ??= Promise.all(
    fontsConfig.map(async ({ name, font, weight, style }) => {
      const data = await loadGoogleFont(font, weight);
      return { name, data, weight, style };
    })
  ).catch(error => {
    fonts = undefined;
    throw error;
  });

  return fonts;
}

export default loadGoogleFonts;
