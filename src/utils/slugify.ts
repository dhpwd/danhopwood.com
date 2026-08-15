import kebabcase from "lodash.kebabcase";
import slugify from "slugify";

const hasNonLatin = (str: string): boolean => /[^\x00-\x7F]/.test(str);

/**
 * Two libraries, because neither covers both cases: slugify handles numbers and
 * acronyms better ("TypeScript 5.0" -> "typescript-5.0") but strips non-Latin
 * characters entirely, which kebabcase preserves.
 */
export const slugifyStr = (str: string): string => {
  if (hasNonLatin(str)) {
    return kebabcase(str);
  }
  return slugify(str, { lower: true });
};

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));
