import readingTime from "reading-time";

export function calculateReadingTime(content: string): string {
  const minutes = Math.ceil(readingTime(content).minutes);
  return `${minutes} min read`;
}
