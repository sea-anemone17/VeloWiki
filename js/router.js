import { getHomePage, isContentSpace } from "./constants.js";
export function routeToPage(space, title, tab="view") { window.location.hash = `#/${space}/page/${encodeURIComponent(title)}${tab !== "view" ? `/${tab}` : ""}`; }
export function routeToCategory(space, category) { window.location.hash = `#/${space}/category/${encodeURIComponent(category)}`; }
export function routeToSpecial(name) { window.location.hash = `#/special/${name}`; }
export function getRoute() {
  const hash=(window.location.hash || "#/study/page/홈").slice(1);
  const parts=hash.split("/").filter(Boolean);
  if(parts[0]==="special") return { space:"special", type:"special", value:parts[1] || "wanted", tab:"view" };
  const space=isContentSpace(parts[0]) ? parts[0] : "study";
  const type=parts[1] || "page";
  const value=decodeURIComponent(parts[2] || (type==="page" ? getHomePage(space) : ""));
  const tab=parts[3] || "view";
  return {space,type,value,tab};
}
export function onRouteChange(callback){ window.addEventListener("hashchange",callback); }
