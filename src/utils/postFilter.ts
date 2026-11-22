import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";

// Read once per build – see "Reading posts in a route" in docs/patterns/astro-build.md
const buildTime = Date.now();

const postFilter = ({ data }: CollectionEntry<"blog">) => {
  const isPublishTimePassed =
    buildTime > new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export default postFilter;
