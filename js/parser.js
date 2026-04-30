export { escapeHTML } from "./parser/core.js";
export { extractCategories, extractFootnotes, extractLinks } from "./parser/extract.js";

import { extractCategories, extractFootnotes, stripCategorySyntax, stripFootnoteDefinitions } from "./parser/extract.js";
import { escapeHTML } from "./parser/core.js";
import { renderInline } from "./parser/inline.js";
import { renderInfobox } from "./parser/infobox.js";
import { extractHeadings, renderToc } from "./parser/toc.js";
import { renderBlocks } from "./parser/blocks.js";

function renderFootnotes(footnotes, pages) {
  const entries = Object.entries(footnotes);

  if (!entries.length) return "";

  return `
    <section class="footnotes">
      <h2>주석</h2>
      <ol>
        ${entries.map(([id, text]) => `
          <li data-footnote-item="${escapeHTML(id)}">
            <strong>[${escapeHTML(id)}]</strong> ${renderInline(text, pages)}
          </li>
        `).join("")}
      </ol>
    </section>
  `;
}

function renderCategories(categories) {
  if (!categories.length) return "";

  return `
    <section class="category-box">
      ${categories.map((category) => `
        <a href="#/category/${encodeURIComponent(category)}">분류:${escapeHTML(category)}</a>
      `).join("")}
    </section>
  `;
}

export function renderWiki(content = "", pages = {}) {
  const categories = extractCategories(content);
  const footnotes = extractFootnotes(content);

  let visibleContent = stripCategorySyntax(content);
  visibleContent = stripFootnoteDefinitions(visibleContent);

  const infoboxResult = renderInfobox(visibleContent, pages);
  visibleContent = infoboxResult.content;

  const headings = extractHeadings(visibleContent);
  const tocHTML = renderToc(headings);
  const body = renderBlocks(visibleContent, pages);
  const footnoteHTML = renderFootnotes(footnotes, pages);
  const categoryHTML = renderCategories(categories);

  return `${tocHTML}${infoboxResult.infoboxHTML}${body}${footnoteHTML}${categoryHTML}`;
}
