export const SITE = {
  website: "https://danhopwood.com/",
  author: "Dan Hopwood",
  profile: "https://danhopwood.com/",
  desc: "Notes from building Fidero entirely with AI agents. Fidero is a data platform for companies whose customer data breaks across domains and systems.",
  title: "Dan Hopwood",
  ogImage: "", // empty = dynamic /og.png (src/utils/og-templates/site.js)
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: false,
  editPost: {
    enabled: true,
    text: "Edit on GitHub",
    url: "https://github.com/dhpwd/danhopwood.com/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "Europe/London",
} as const;
