import satori from "satori";
import loadGoogleFonts from "../loadGoogleFont";
import {
  CHROME_GLYPHS,
  accentBar,
  avatarSrc,
  dotGrid,
  hostname,
  palette,
  tagline,
} from "./shared";

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
          background: palette.background,
          ...dotGrid,
          fontFamily: "Google Sans Code",
        },
        children: [
          accentBar(),
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
                            color: palette.foreground,
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
                            fontSize: 26,
                            fontWeight: 400,
                            lineHeight: 1.5,
                            color: palette.body,
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
                      borderTop: `3px dashed ${palette.rule}`,
                    },
                    children: [
                      {
                        type: "img",
                        props: {
                          src: avatarSrc(),
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
                            color: palette.foreground,
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
                            color: palette.separator,
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
                            color: palette.accent,
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
                            color: palette.faint,
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
          CHROME_GLYPHS
      ),
    }
  );
};
