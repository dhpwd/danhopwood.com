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

export default async post => {
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
                flexDirection: "column",
                flexGrow: 1,
                padding: "64px 72px 56px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      flexGrow: 1,
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "block",
                            lineClamp: 3,
                            fontSize: 60,
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: "#282728",
                          },
                          children: post.data.title,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "block",
                            lineClamp: 3,
                            marginTop: "28px",
                            fontSize: 30,
                            fontWeight: 400,
                            lineHeight: 1.5,
                            color: "#57565a",
                          },
                          children: post.data.description,
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      paddingTop: "36px",
                      borderTop: "3px dashed #d9d6d6",
                    },
                    children: [
                      {
                        type: "img",
                        props: {
                          src: avatarSrc,
                          width: 72,
                          height: 72,
                          style: {
                            borderRadius: "9999px",
                            marginRight: "24px",
                          },
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: 27,
                            fontWeight: 700,
                            color: "#282728",
                          },
                          children: post.data.author,
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: 27,
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
                            fontSize: 27,
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
                            marginLeft: "auto",
                            fontSize: 24,
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
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(
        post.data.title +
          post.data.description +
          post.data.author +
          hostname +
          tagline +
          "·"
      ),
    }
  );
};
