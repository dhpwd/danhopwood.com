import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
}

interface ShareLink {
  // Sent as the Plausible "Share Link" event's platform, so it stays put
  name: string;
  // Shown in place of the name, where the two differ
  label?: string;
  linkTitle: string;
  buildHref: (pageUrl: string, pageTitle?: string) => string;
}

export const SOCIALS: Social[] = [
  {
    name: "X",
    href: "https://x.com/dhpwd",
    linkTitle: `${SITE.title} on X`,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/dhpwd",
    linkTitle: `${SITE.title} on LinkedIn`,
  },
  {
    name: "GitHub",
    href: "https://github.com/dhpwd",
    linkTitle: `${SITE.title} on GitHub`,
  },
] as const;

export const SHARE_LINKS: ShareLink[] = [
  {
    name: "X",
    linkTitle: "Share this post on X",
    buildHref: (url, title) => {
      let href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&via=dhpwd`;
      if (title) href += `&text=${encodeURIComponent(title)}`;
      return href;
    },
  },
  {
    name: "LinkedIn",
    linkTitle: "Share this post on LinkedIn",
    buildHref: url =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "WhatsApp",
    linkTitle: "Share this post via WhatsApp",
    buildHref: (url, title) => {
      const text = title ? `${title} ${url}` : url;
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    },
  },
  {
    name: "Telegram",
    linkTitle: "Share this post via Telegram",
    buildHref: url => `https://t.me/share/url?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Mail",
    label: "Email",
    linkTitle: "Share this post via email",
    buildHref: (url, title) => {
      const subject = title || "Check this out";
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(url)}`;
    },
  },
  {
    name: "Facebook",
    linkTitle: "Share this post on Facebook",
    buildHref: url =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];
