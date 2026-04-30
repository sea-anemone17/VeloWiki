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
    return `<sup>
      <button type="button" class="footnote-ref" data-footnote-id="${escapeHTML(id)}">
        [${escapeHTML(id)}]
      </button>
    </sup>`;
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

function renderEmbeds(content, pages) {
  let html = content;

  html = html.replace(/\{\{image:([^|}]+)\|?([^}]*)\}\}/g, (_, src, caption) => {
    return `
      <figure class="media-card">
        <img src="${escapeHTML(src.trim())}" alt="${escapeHTML(caption.trim() || "이미지")}" loading="lazy" />
        ${caption.trim() ? `<figcaption>${escapeHTML(caption.trim())}</figcaption>` : ""}
      </figure>
    `;
  });

  html = html.replace(/\{\{youtube:([^}]+)\}\}/g, (_, id) => {
    const videoId = id.trim();
    return `
      <div class="video-card">
        <iframe
          src="https://www.youtube.com/embed/${escapeHTML(videoId)}"
          title="YouTube video"
          loading="lazy"
          allowfullscreen>
        </iframe>
      </div>
    `;
  });

  html = html.replace(/\{\{link:([^|}]+)\|?([^}]*)\}\}/g, (_, url, label) => {
    const safeUrl = escapeHTML(url.trim());
    const safeLabel = escapeHTML(label.trim() || url.trim());

    return `
      <a class="link-card" href="${safeUrl}" target="_blank" rel="noopener noreferrer">
        <span class="link-card-title">${safeLabel}</span>
        <span class="link-card-url">${safeUrl}</span>
      </a>
    `;
  });

  return html;
}

function renderInfobox(content, pages) {
  const match = /\{\{정보상자([\s\S]*?)\}\}/.exec(content);
  if (!match) {
    return {
      content,
      infoboxHTML: ""
    };
  }

  const raw = match[1].trim();
  const rows = raw
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.startsWith("|"))
    .map(line => {
      const [key, ...rest] = line.slice(1).split("=");
      return {
        key: key.trim(),
        value: rest.join("=").trim()
      };
    });

  const imageRow = rows.find(row => row.key === "이미지");
  const normalRows = rows.filter(row => row.key !== "이미지");

  const infoboxHTML = `
    <aside class="infobox">
      ${imageRow ? `<img src="${escapeHTML(imageRow.value)}" alt="정보상자 이미지" />` : ""}
      ${normalRows.map(row => `
        <div class="infobox-row">
          <strong>${escapeHTML(row.key)}</strong>
          <span>${renderInline(row.value, pages)}</span>
        </div>
      `).join("")}
    </aside>
  `;

  return {
    content: content.replace(match[0], "").trim(),
    infoboxHTML
  };
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

  const infoboxResult = renderInfobox(visibleContent, pages);
  visibleContent = infoboxResult.content;

  const body = renderEmbeds(renderBlocks(visibleContent, pages), pages);

  const footnoteHTML = Object.keys(footnotes).length
    ? `<section class="footnotes"><h2>주석</h2><ol>${Object.entries(footnotes)
        .map(([id, text]) => `<li data-footnote-item="${escapeHTML(id)}"><strong>[${escapeHTML(id)}]</strong> ${renderInline(text, pages)}</li>`)
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
              <button type="button" class="toc-link" data-section="section-${index}">
                ${escapeHTML(heading.text)}
              </button>
            </li>
          `).join("")}
        </ul>
      </nav>
    `
    : "";

  return `${tocHTML}${infoboxResult.infoboxHTML}${body}${footnoteHTML}${categoryHTML}`;
}
