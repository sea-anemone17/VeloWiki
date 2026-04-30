export function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function safeURL(url = "") {
  const trimmed = String(url).trim();

  try {
    const parsed = new URL(trimmed, window.location.href);
    const allowed = ["http:", "https:", "data:", "blob:"];
    if (!allowed.includes(parsed.protocol)) return "#";
    return trimmed;
  } catch {
    return "#";
  }
}
