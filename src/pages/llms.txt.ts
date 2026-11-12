import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";

const SUMMARY =
  "Personal site and public lab notebook of Dan Hopwood, who is building " +
  "Fidero entirely with AI agents. Written for founders and their leadership " +
  "teams working out how their own company should run on AI agents, with " +
  "practitioner detail on agentic coding and Claude Code. Fidero is a data " +
  "platform for companies whose deals close in a CRM, or whose subscriptions " +
  "start in an app or a billing tool. The thread through both is the " +
  "discipline that makes customer data trustworthy and AI agents reliable. " +
  "Dan also advises founders and leadership teams on AI agents and data.";

export const GET: APIRoute = async ({ site }) => {
  const posts = getSortedPosts(await getCollection("blog"));

  const postLines = posts
    .map(({ data, id, filePath }) => {
      const url = new URL(getPath(id, filePath), site).href;
      return `- [${data.title}](${url}): ${data.description}`;
    })
    .join("\n");

  const aboutUrl = new URL("about", site).href;
  const rssUrl = new URL("rss.xml", site).href;

  const body = `# ${SITE.title}

> ${SUMMARY}

## Posts

${postLines}

## About

- [About ${SITE.author}](${aboutUrl}): Background and what this site is for.

## Optional

- [RSS feed](${rssUrl}): Full chronological feed of all posts.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
