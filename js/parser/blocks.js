import { escapeHTML } from "./core.js";
import { renderInline } from "./inline.js";
import { isEmbedBlock, renderEmbedBlock } from "./embeds.js";

export function renderBlocks(content, pages) {
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

    if (isEmbedBlock(trimmed)) {
      flushParagraph();
      flushList();
      html.push(renderEmbedBlock(trimmed));
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);

    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2];

      html.push(`<h${level} id="section-${headingIndex++}">${renderInline(text, pages)}</h${level}>`);
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
