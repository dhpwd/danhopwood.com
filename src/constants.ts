import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconWhatsapp from "@/assets/icons/IconWhatsapp.svg";
import IconFacebook from "@/assets/icons/IconFacebook.svg";
import IconTelegram from "@/assets/icons/IconTelegram.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

interface ShareLink {
  name: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
  buildHref: (pageUrl: string, pageTitle?: string) => string;
}

export const SOCIALS: Social[] = [
  {
    name: "X",
    href: "https://x.com/dhpwd",
    linkTitle: `${SITE.title} on X`,
    icon: IconBrandX,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/dhpwd",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: IconLinkedin,
  },
  {
    name: "GitHub",
    href: "https://github.com/dhpwd",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconGitHub,
  },
] as const;

export const SHARE_LINKS: ShareLink[] = [
  {
    name: "X",
    linkTitle: "Share this post on X",
    icon: IconBrandX,
    buildHref: (url, title) => {
      const params = new URLSearchParams({ url, via: "dhpwd" });
      if (title) params.set("text", title);
      return `https://twitter.com/intent/tweet?${params}`;
    },
  },
  {
    name: "LinkedIn",
    linkTitle: "Share this post on LinkedIn",
    icon: IconLinkedin,
    buildHref: url =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "WhatsApp",
    linkTitle: "Share this post via WhatsApp",
    icon: IconWhatsapp,
    buildHref: (url, title) => {
      const text = title ? `${title} ${url}` : url;
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    },
  },
  {
    name: "Telegram",
    linkTitle: "Share this post via Telegram",
    icon: IconTelegram,
    buildHref: (url, title) => {
      const params = new URLSearchParams({ url });
      if (title) params.set("text", title);
      return `https://t.me/share/url?${params}`;
    },
  },
  {
    name: "Mail",
    linkTitle: "Share this post via email",
    icon: IconMail,
    buildHref: (url, title) => {
      const subject = title || "Check this out";
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(url)}`;
    },
  },
  {
    name: "Facebook",
    linkTitle: "Share this post on Facebook",
    icon: IconFacebook,
    buildHref: url =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];
