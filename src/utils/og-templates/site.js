import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

const avatarBase64 = readFileSync(
  join(process.cwd(), "src/assets/images/avatar.jpeg")
).toString("base64");
const avatarSrc = `data:image/jpeg;base64,${avatarBase64}`;

const hostname = new URL(SITE.website).hostname;
const tagline = "Showing my working.";

export default async () => {
  return satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fdfdfd",
          backgroundImage:
            "radial-gradient(circle at 16px 16px, #d8d8d8 6%, transparent 6%)",
          backgroundSize: "32px 32px",
          fontFamily: "Google Sans Code",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                height: "12px",
                width: "100%",
                background: "#006cac",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                flexGrow: 1,
                padding: "64px 72px",
              },
              children: [
                {
                  type: "img",
                  props: {
                    src: avatarSrc,
                    width: 280,
                    height: 280,
                    style: {
                      borderRadius: "9999px",
                      marginRight: "64px",
                    },
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      flexShrink: 1,
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "block",
                            fontSize: 64,
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: "#282728",
                          },
                          children: SITE.title,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "block",
                            lineClamp: 4,
                            marginTop: "24px",
                            fontSize: 28,
                            fontWeight: 400,
                            lineHeight: 1.5,
                            color: "#57565a",
                          },
                          children: SITE.desc,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            marginTop: "32px",
                          },
                          children: [
                            {
                              type: "span",
                              props: {
                                style: {
                                  fontSize: 26,
                                  fontWeight: 400,
                                  color: "#006cac",
                                },
                                children: hostname,
                              },
                            },
                            {
                              type: "span",
                              props: {
                                style: {
                                  fontSize: 26,
                                  margin: "0 14px",
                                  color: "#b0adad",
                                },
                                children: "·",
                              },
                            },
                            {
                              type: "span",
                              props: {
                                style: {
                                  fontSize: 26,
                                  fontWeight: 400,
                                  color: "#8a8a8a",
                                },
                                children: tagline,
                              },
                            },
                          ],
                        },
                      },
                    ],
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
      embedFont: true,
      fonts: await loadGoogleFonts(
        SITE.title + SITE.desc + hostname + tagline + "·"
      ),
    }
  );
};
