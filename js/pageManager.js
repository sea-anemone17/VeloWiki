import { extractCategories, extractLinks } from "./parser.js";

export function normalizeTitle(title = "") {
  return title.trim().replace(/\s+/g, " ");
}

export function createEmptyPage(title) {
  const now = new Date().toISOString();
  return {
    title,
    content: `# ${title}\n\n아직 작성되지 않은 문서입니다.\n\n[[분류:미분류]]`,
    categories: ["미분류"],
    createdAt: now,
    updatedAt: now,
    revisionCount: 1
  };
}

export function getPage(data, title) {
  return data.pages[title] || null;
}

export function pageExists(data, title) {
  return Boolean(data.pages[title]);
}

export function upsertPage(data, oldTitle, nextTitle, content) {
  const title = normalizeTitle(nextTitle);
  if (!title) throw new Error("문서 제목이 비어 있습니다.");

  const now = new Date().toISOString();
  const previous = oldTitle ? data.pages[oldTitle] : null;
  const categories = extractCategories(content);

  if (oldTitle && oldTitle !== title) {
    delete data.pages[oldTitle];
  }

  data.pages[title] = {
    title,
    content,
    categories,
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    revisionCount: (previous?.revisionCount || 0) + 1
  };

  return data.pages[title];
}

export function ensurePage(data, title) {
  const normalized = normalizeTitle(title);
  if (!data.pages[normalized]) {
    data.pages[normalized] = createEmptyPage(normalized);
  }
  return data.pages[normalized];
}

export function getAllPages(data) {
  return Object.values(data.pages).sort((a, b) => a.title.localeCompare(b.title, "ko"));
}

export function getRecentPages(data, limit = 8) {
  return Object.values(data.pages)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit);
}

export function searchPages(data, query) {
  const q = query.trim().toLowerCase();
  if (!q) return getAllPages(data);

  return getAllPages(data).filter((page) => {
    return (
      page.title.toLowerCase().includes(q) ||
      page.content.toLowerCase().includes(q) ||
      page.categories.some((category) => category.toLowerCase().includes(q))
    );
  });
}

export function getCategoryMap(data) {
  const map = new Map();
  for (const page of Object.values(data.pages)) {
    for (const category of page.categories || []) {
      if (!map.has(category)) map.set(category, []);
      map.get(category).push(page.title);
    }
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ko"))
    .map(([category, titles]) => ({
      category,
      titles: titles.sort((a, b) => a.localeCompare(b, "ko"))
    }));
}

export function getPagesByCategory(data, category) {
  return getAllPages(data).filter((page) => (page.categories || []).includes(category));
}

export function getBacklinks(data, targetTitle) {
  return getAllPages(data)
    .filter((page) => page.title !== targetTitle && extractLinks(page.content).includes(targetTitle))
    .map((page) => page.title);
}

export function getChildren(data, title) {
  const prefix = `${title}/`;
  return getAllPages(data)
    .filter((page) => page.title.startsWith(prefix))
    .map((page) => page.title);
}

export function getParentTitle(title) {
  if (!title.includes("/")) return null;
  return title.split("/").slice(0, -1).join("/");
}

export function getWantedPages(data) {
  const existing = new Set(Object.keys(data.pages));
  const wanted = new Set();

  for (const page of Object.values(data.pages)) {
    for (const link of extractLinks(page.content)) {
      if (!existing.has(link)) wanted.add(link);
    }
  }

  return [...wanted].sort((a, b) => a.localeCompare(b, "ko"));
}
