import { escapeHTML, safeURL } from "./core.js";
import { renderInline } from "./inline.js";

export function renderInfobox(content, pages) {
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
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"))
    .map((line) => {
      const [key, ...rest] = line.slice(1).split("=");

      return {
        key: key.trim(),
        value: rest.join("=").trim()
      };
    })
    .filter((row) => row.key);

  const imageRow = rows.find((row) => row.key === "이미지");
  const normalRows = rows.filter((row) => row.key !== "이미지");

  const infoboxHTML = `
    <aside class="infobox">
      ${imageRow ? `<img src="${escapeHTML(safeURL(imageRow.value))}" alt="정보상자 이미지" loading="lazy" />` : ""}
      ${normalRows.map((row) => `
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
