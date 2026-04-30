import { escapeHTML, safeURL } from "./core.js";
import { WIKI_LINK_RE } from "./extract.js";

export function renderInline(text, pages) {
  let html = escapeHTML(text);

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  html = html.replace(/\[\^([^\]]+)\]/g, (_, id) => {
    return `<sup><button type="button" class="footnote-ref" data-footnote-id="${escapeHTML(id)}">[${escapeHTML(id)}]</button></sup>`;
  });

  html = html.replace(WIKI_LINK_RE, (_, rawTarget, rawLabel) => {
    const target = rawTarget.trim();
    const label = (rawLabel || target).trim();

    if (target.startsWith("분류:")) {
      const category = target.replace("분류:", "").trim();
      return `<a class="wiki-link category-inline" href="#/category/${encodeURIComponent(category)}">${escapeHTML(label)}</a>`;
    }

    const exists = Boolean(pages[target]);
    const className = exists ? "wiki-link" : "wiki-link missing";
    return `<a class="${className}" href="#/page/${encodeURIComponent(target)}">${escapeHTML(label)}</a>`;
  });

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const safe = escapeHTML(safeURL(url));
    return `<a class="wiki-link external-link" href="${safe}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>`;
  });

  return html;
}
