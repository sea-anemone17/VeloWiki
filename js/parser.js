const CATEGORY_RE = /\[\[분류:([^\]]+)\]\]/g;
const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const FOOTNOTE_DEF_RE = /^\[\^([^\]]+)\]:\s*(.*)$/gm;

export function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

function stripFootnoteDefinitions(content = "") {
  return content.replace(FOOTNOTE_DEF_RE, "").trim();
}

function stripCategorySyntax(content = "") {
  return content.replace(CATEGORY_RE, "").trim();
}

function renderInline(text, pages) {
  let html = escapeHTML(text);

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  html = html.replace(/\[\^([^\]]+)\]/g, (_, id) => {
    const safeId = encodeURIComponent(id);
    return `<sup><a href="#footnote-${safeId}" id="ref-${safeId}">[${escapeHTML(id)}]</a></sup>`;
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

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    return `<img class="wiki-image" src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy" />`;
  });

  return html;
}

function extractHeadings(content = "") {
  const headings = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim()
      });
    }
  }

  return headings;
}

function renderBlocks(content, pages) {
  const lines = content.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let list = [];
  let inCode = false;
  let codeLines = [];
  let headingIndex = 0;

  function flushParagraph() {
    if (paragraph.length) {
      html.push(`<p>${renderInline(paragraph.join(" "), pages)}</p>`);
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length) {
      html.push(`<ul>${list.map((item) => `<li>${renderInline(item, pages)}</li>`).join("")}</ul>`);
      list = [];
    }
  }

  function flushCode() {
    if (codeLines.length) {
      html.push(`<pre><code>${escapeHTML(codeLines.join("\n"))}</code></pre>`);
      codeLines = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2];
      html.push(
        `<h${level} id="section-${headingIndex++}">
          ${renderInline(text, pages)}
        </h${level}>`
      );
      continue;
    }

    const bullet = /^[-*]\s+(.+)$/.exec(trimmed);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${renderInline(trimmed.slice(2), pages)}</blockquote>`);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushCode();
  flushParagraph();
  flushList();

  return html.join("\n");
}

export function renderWiki(content = "", pages = {}) {
  const categories = extractCategories(content);
  const footnotes = extractFootnotes(content);

  let visibleContent = stripCategorySyntax(content);
  visibleContent = stripFootnoteDefinitions(visibleContent);

  const body = renderBlocks(visibleContent, pages);

  const footnoteHTML = Object.keys(footnotes).length
    ? `<section class="footnotes"><h2>주석</h2><ol>${Object.entries(footnotes)
        .map(([id, text]) => `<li id="footnote-${encodeURIComponent(id)}"><strong>[${escapeHTML(id)}]</strong> ${renderInline(text, pages)}</li>`)
        .join("")}</ol></section>`
    : "";

  const categoryHTML = categories.length
    ? `<section class="category-box">${categories
        .map((category) => `<a href="#/category/${encodeURIComponent(category)}">분류:${escapeHTML(category)}</a>`)
        .join("")}</section>`
    : "";

  const headings = extractHeadings(visibleContent);

  const tocHTML = headings.length > 1
    ? `
      <nav class="toc-box">
        <h2>목차</h2>
        <ul>
          ${headings.map((heading, index) => `
            <li class="toc-level-${heading.level}">
              <a href="#section-${index}">${escapeHTML(heading.text)}</a>
            </li>
          `).join("")}
        </ul>
      </nav>
    `
    : "";

  return `${tocHTML}${body}${footnoteHTML}${categoryHTML}`;
}
