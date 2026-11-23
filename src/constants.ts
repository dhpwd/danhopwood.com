import type { SvgComponent } from "astro/types";
import { SITE } from "@/config";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconFacebook from "@/assets/icons/IconFacebook.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconMail from "@/assets/icons/IconMail.svg";
import IconTelegram from "@/assets/icons/IconTelegram.svg";
import IconWhatsapp from "@/assets/icons/IconWhatsapp.svg";

interface Social {
  name: string;
  icon: SvgComponent;
  href: string;
  linkTitle: string;
}

interface ShareLink {
  // Sent as the Plausible "Share Link" event's platform, so it stays put
  name: string;
  // The link's name for screen readers, where it differs from `name`
  label?: string;
  icon: SvgComponent;
  linkTitle: string;
  buildHref: (pageUrl: string, pageTitle?: string) => string;
}

export const SOCIALS: Social[] = [
  {
    name: "X",
    icon: IconBrandX,
    href: "https://x.com/dhpwd",
    linkTitle: `${SITE.title} on X`,
  },
  {
    name: "LinkedIn",
    icon: IconLinkedin,
    href: "https://www.linkedin.com/in/dhpwd",
    linkTitle: `${SITE.title} on LinkedIn`,
  },
  {
    name: "GitHub",
    icon: IconGitHub,
    href: "https://github.com/dhpwd",
    linkTitle: `${SITE.title} on GitHub`,
  },
] as const;

export const SHARE_LINKS: ShareLink[] = [
  {
    name: "X",
    icon: IconBrandX,
    linkTitle: "Share this post on X",
    buildHref: (url, title) => {
      let href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&via=dhpwd`;
      if (title) href += `&text=${encodeURIComponent(title)}`;
      return href;
    },
  },
  {
    name: "LinkedIn",
    icon: IconLinkedin,
    linkTitle: "Share this post on LinkedIn",
    buildHref: url =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "WhatsApp",
    icon: IconWhatsapp,
    linkTitle: "Share this post via WhatsApp",
    buildHref: (url, title) => {
      const text = title ? `${title} ${url}` : url;
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    },
  },
  {
    name: "Telegram",
    icon: IconTelegram,
    linkTitle: "Share this post via Telegram",
    buildHref: url => `https://t.me/share/url?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Mail",
    icon: IconMail,
    label: "Email",
    linkTitle: "Share this post via email",
    buildHref: (url, title) => {
      const subject = title || "Check this out";
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(url)}`;
    },
  },
  {
    name: "Facebook",
    icon: IconFacebook,
    linkTitle: "Share this post on Facebook",
    buildHref: url =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];
