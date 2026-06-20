import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";

const SUMMARY =
  "Personal site and public lab notebook of Dan Hopwood, who is building " +
  "Fidero (a data platform for companies whose customer data breaks across " +
  "domains and systems) entirely with AI agents. Writing on agentic coding, " +
  "AI agents, Claude Code, data platforms and the discipline that makes both " +
  "customer data and AI agents reliable.";

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
