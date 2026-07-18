import satori from "satori";
import { SITE } from "@/config";
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
                flexDirection: "row",
                alignItems: "center",
                flexGrow: 1,
                padding: "64px 72px",
              },
              children: [
                {
                  type: "img",
                  props: {
                    src: avatarSrc(),
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
                            color: palette.foreground,
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
                            color: palette.body,
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
                                  color: palette.accent,
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
                                  color: palette.separator,
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
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(SITE.title + SITE.desc + CHROME_GLYPHS),
    }
  );
};
