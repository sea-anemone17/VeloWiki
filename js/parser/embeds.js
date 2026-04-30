import { escapeHTML, safeURL } from "./core.js";
function parseYouTubeId(value = "") {
  const input = value.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split(/[/?#]/)[0];
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
  } catch { return ""; }
  return "";
}
export function isEmbedBlock(line) { return /^\{\{(?:image|youtube|video|link):/.test(line.trim()); }
export function renderEmbedBlock(line) {
  const image = /^\{\{image:([^|}]+)(?:\|([^}]*))?\}\}$/.exec(line);
  if (image) {
    const src = escapeHTML(safeURL(image[1])); const caption = (image[2] || "").trim();
    return `<figure class="media-card"><img src="${src}" alt="${escapeHTML(caption || "이미지")}" loading="lazy" />${caption ? `<figcaption>${escapeHTML(caption)}</figcaption>` : ""}</figure>`;
  }
  const youtube = /^\{\{(?:youtube|video):([^}]+)\}\}$/.exec(line);
  if (youtube) {
    const videoId = parseYouTubeId(youtube[1]);
    if (!videoId) return `<p class="empty">유효하지 않은 YouTube 주소입니다.</p>`;
    return `<div class="video-card"><iframe src="https://www.youtube-nocookie.com/embed/${escapeHTML(videoId)}" title="YouTube video" loading="lazy" allowfullscreen></iframe></div>`;
  }
  const link = /^\{\{link:([^|}]+)(?:\|([^}]*))?\}\}$/.exec(line);
  if (link) {
    const url = safeURL(link[1]); const safeUrl = escapeHTML(url); const safeLabel = escapeHTML((link[2] || link[1]).trim());
    return `<a class="link-card" href="${safeUrl}" target="_blank" rel="noopener noreferrer"><span class="link-card-title">${safeLabel}</span><span class="link-card-url">${safeUrl}</span></a>`;
  }
  return "";
}
