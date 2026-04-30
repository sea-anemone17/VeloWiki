import { escapeHTML, safeURL, getPageKey } from "./core.js";
import { WIKI_LINK_RE, parseWikiTarget } from "./extract.js";

export function renderInline(text, data, currentSpace = "study") {
  let html = escapeHTML(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\[\^([^\]]+)\]/g, (_, id) => `<sup><button type="button" class="footnote-ref" data-footnote-id="${escapeHTML(id)}">[${escapeHTML(id)}]</button></sup>`);
  html = html.replace(WIKI_LINK_RE, (_, rawTarget, rawLabel) => {
    const parsed = parseWikiTarget(rawTarget, currentSpace);
    const label = (rawLabel || parsed.title || rawTarget).trim();
    if (parsed.type === "category") return `<a class="wiki-link category-inline" href="#/${parsed.space}/category/${encodeURIComponent(parsed.title)}">${escapeHTML(label)}</a>`;
    const exists = Boolean(data.pages[getPageKey(parsed.space, parsed.title)]);
    const className = exists ? "wiki-link" : "wiki-link missing";
    return `<a class="${className}" href="#/${parsed.space}/page/${encodeURIComponent(parsed.title)}">${escapeHTML(label)}</a>`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => `<a class="wiki-link external-link" href="${escapeHTML(safeURL(url))}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>`);
  return html;
}
