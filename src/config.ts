export const SITE = {
  website: "https://danhopwood.com/",
  author: "Dan Hopwood",
  profile: "https://danhopwood.com/",
  desc: "Notes from building Fidero entirely with AI agents. Fidero is a data platform for companies whose deals close in a CRM, or whose subscriptions start in an app or a billing tool.",
  title: "Dan Hopwood",
  ogImage: "", // deliberately empty – see docs/patterns/machine-readability.md
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
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
