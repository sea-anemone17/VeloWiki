export const CATEGORY_RE = /\[\[분류:([^\]]+)\]\]/g;
export const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
export const FOOTNOTE_DEF_RE = /^\[\^([^\]]+)\]:\s*(.*)$/gm;

export function extractCategories(content = "") {
  const categories = [];

  for (const match of content.matchAll(CATEGORY_RE)) {
    const category = match[1].trim();
    if (category && !categories.includes(category)) categories.push(category);
  }

  return categories;
}

export function extractLinks(content = "") {
  const links = [];

  for (const match of content.matchAll(WIKI_LINK_RE)) {
    const target = match[1].trim();

    if (!target.startsWith("분류:") && target && !links.includes(target)) {
      links.push(target);
    }
  }

  return links;
}

export function extractFootnotes(content = "") {
  const footnotes = {};

  for (const match of content.matchAll(FOOTNOTE_DEF_RE)) {
    footnotes[match[1].trim()] = match[2].trim();
  }

  return footnotes;
}

export function stripFootnoteDefinitions(content = "") {
  return content.replace(FOOTNOTE_DEF_RE, "").trim();
}

export function stripCategorySyntax(content = "") {
  return content.replace(CATEGORY_RE, "").trim();
}
