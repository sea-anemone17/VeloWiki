export const CATEGORY_RE = /\[\[분류:([^\]]+)\]\]/g;
export const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
export const FOOTNOTE_DEF_RE = /^\[\^([^\]]+)\]:\s*(.*)$/gm;

export function stripCodeBlocks(content = "") {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "");
}

export function parseWikiTarget(rawTarget = "", currentSpace = "study") {
  const target = rawTarget.trim();
  if (target.startsWith("분류:")) return { type: "category", space: currentSpace, title: target.replace("분류:", "").trim() };
  const colon = target.indexOf(":");
  if (colon > 0) {
    const prefix = target.slice(0, colon).trim();
    const title = target.slice(colon + 1).trim();
    if (["프로필", "profile"].includes(prefix)) return { type: "page", space: "profile", title };
    if (["개념", "study"].includes(prefix)) return { type: "page", space: "study", title };
  }
  return { type: "page", space: currentSpace, title: target };
}

export function extractCategories(content = "") {
  const text = stripCodeBlocks(content);
  const categories = [];
  for (const match of text.matchAll(CATEGORY_RE)) {
    const category = match[1].trim();
    if (category && !categories.includes(category)) categories.push(category);
  }
  return categories;
}

export function extractLinks(content = "", currentSpace = "study") {
  const text = stripCodeBlocks(content);
  const links = [];
  const seen = new Set();
  for (const match of text.matchAll(WIKI_LINK_RE)) {
    const parsed = parseWikiTarget(match[1], currentSpace);
    if (parsed.type !== "page" || !parsed.title) continue;
    const key = `${parsed.space}::${parsed.title}`;
    if (!seen.has(key)) { seen.add(key); links.push(parsed); }
  }
  return links;
}

export function extractFootnotes(content = "") {
  const text = stripCodeBlocks(content);
  const footnotes = {};
  for (const match of text.matchAll(FOOTNOTE_DEF_RE)) footnotes[match[1].trim()] = match[2].trim();
  return footnotes;
}

export function stripFootnoteDefinitions(content = "") { return content.replace(FOOTNOTE_DEF_RE, "").trim(); }
export function stripCategorySyntax(content = "") { return content.replace(CATEGORY_RE, "").trim(); }
