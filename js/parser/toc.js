import { escapeHTML } from "./core.js";

export function extractHeadings(content = "") {
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

export function renderToc(headings = []) {
  if (headings.length <= 1) return "";

  return `
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
  `;
}
