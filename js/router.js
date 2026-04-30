export function routeToPage(title) {
  window.location.hash = `#/page/${encodeURIComponent(title)}`;
}

export function routeToCategory(category) {
  window.location.hash = `#/category/${encodeURIComponent(category)}`;
}

export function getRoute() {
  const hash = window.location.hash || "#/page/홈";
  const [, type, rawValue] = hash.split("/");
  return {
    type: type || "page",
    value: decodeURIComponent(rawValue || "홈")
  };
}

export function onRouteChange(callback) {
  window.addEventListener("hashchange", callback);
}
