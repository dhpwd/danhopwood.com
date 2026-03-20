export const SITE = {
  website: "https://danhopwood.com/",
  author: "Dan Hopwood",
  profile: "https://danhopwood.com/",
  desc: "Notes from building a company entirely with AI agents.",
  title: "Dan Hopwood",
  ogImage: "og-image.png",
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
