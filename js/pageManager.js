import { extractCategories, extractLinks, getPageKey } from "./parser.js";
import { getHomePage, isContentSpace } from "./constants.js";
const KO_COLLATOR = new Intl.Collator("ko-KR", { numeric: true, sensitivity: "base" });
export function sortKoreanTitles(titles){ return [...titles].sort(KO_COLLATOR.compare); }
export function sortPages(pages){ return [...pages].sort((a,b)=>KO_COLLATOR.compare(a.title,b.title)); }
export function normalizeTitle(title=""){ return title.trim().replace(/\s+/g," "); }
export { getPageKey };
export function createEmptyPage(title, space="study") { const now=new Date().toISOString(); return {title,space,content:`# ${title}\n\n아직 작성되지 않은 문서입니다.\n\n[[분류:미분류]]`,categories:["미분류"],createdAt:now,updatedAt:now,revisionCount:1}; }
export function getPage(data, space, title){ return data.pages[getPageKey(space,title)] || null; }
export function pageExists(data, space, title){ return Boolean(getPage(data,space,title)); }
export function upsertPage(data, oldSpace, oldTitle, nextSpace, nextTitle, content, options={}) {
  const title=normalizeTitle(nextTitle); const space=nextSpace || oldSpace || "study"; if(!title) throw new Error("문서 제목이 비어 있습니다.");
  if(!isContentSpace(space)) throw new Error("올바르지 않은 공간입니다.");
  const oldKey=oldTitle ? getPageKey(oldSpace,title===oldTitle?oldTitle:oldTitle) : null; const previous=oldTitle ? getPage(data,oldSpace,oldTitle) : null;
  const now=new Date().toISOString(); const categories=extractCategories(content); const newKey=getPageKey(space,title);
  if(previous && (oldSpace!==space || oldTitle!==title)) delete data.pages[getPageKey(oldSpace,oldTitle)];
  const previousRevision=previous?.revisionCount || 0; const shouldCountRevision=options.countRevision!==false;
  data.pages[newKey]={title,space,content,categories,createdAt:previous?.createdAt||now,updatedAt:now,revisionCount:shouldCountRevision?previousRevision+1:Math.max(previousRevision,1)};
  return data.pages[newKey];
}
export function ensurePage(data, space, title){ const normalized=normalizeTitle(title); const key=getPageKey(space,normalized); if(!data.pages[key]) data.pages[key]=createEmptyPage(normalized,space); return data.pages[key]; }
export function getAllPages(data, space=null){ const pages=Object.values(data.pages).filter(p=>!space || p.space===space); return sortPages(pages); }
export function getPagesBySpace(data, space){ return getAllPages(data,space); }
export function getRecentPages(data, limit=8, space=null){ return Object.values(data.pages).filter(p=>!space||p.space===space).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,limit); }
export function searchPages(data, query, space=null){ const q=query.trim().toLowerCase(); const pages=getAllPages(data,space); if(!q) return pages; return pages.filter(page=>page.title.toLowerCase().includes(q)||page.content.toLowerCase().includes(q)||page.categories.some(c=>c.toLowerCase().includes(q))); }
export function getCategoryMap(data, space=null){ const map=new Map(); for(const page of Object.values(data.pages)){ if(space&&page.space!==space) continue; for(const category of page.categories||[]){ if(!map.has(category)) map.set(category,[]); map.get(category).push(page.title); } } return [...map.entries()].sort(([a],[b])=>KO_COLLATOR.compare(a,b)).map(([category,titles])=>({category,titles:sortKoreanTitles(titles)})); }
export function getPagesByCategory(data, category, space=null){ return getAllPages(data,space).filter(page=>(page.categories||[]).includes(category)); }
export function getBacklinks(data, targetSpace, targetTitle){ const result=[]; for(const page of Object.values(data.pages)){ const links=extractLinks(page.content,page.space); if(links.some(link=>link.space===targetSpace && link.title===targetTitle) && !(page.space===targetSpace && page.title===targetTitle)) result.push(page); } return sortPages(result); }
export function getChildren(data, space, title, immediate=false){ const prefix=`${title}/`; const children=getAllPages(data,space).filter(page=>page.title.startsWith(prefix)); if(!immediate) return children; return children.filter(page=>!page.title.slice(prefix.length).includes("/")); }
export function getParentTitle(title){ if(!title.includes("/")) return null; return title.split("/").slice(0,-1).join("/"); }
export function getWantedPages(data, filterSpace=null){ const wanted=new Map(); for(const page of Object.values(data.pages)){ if(filterSpace && page.space!==filterSpace) continue; for(const link of extractLinks(page.content,page.space)){ if(!data.pages[getPageKey(link.space,link.title)]){ const key=getPageKey(link.space,link.title); if(!wanted.has(key)) wanted.set(key,{space:link.space,title:link.title,from:[]}); wanted.get(key).from.push(page); } } } return [...wanted.values()].sort((a,b)=>KO_COLLATOR.compare(`${a.space}:${a.title}`,`${b.space}:${b.title}`)); }
export function getOrphanPages(data, space="study"){ if(space!=="study") return []; const referenced=new Set(); for(const page of Object.values(data.pages)){ for(const link of extractLinks(page.content,page.space)){ if(link.space===space && data.pages[getPageKey(link.space,link.title)]) referenced.add(getPageKey(link.space,link.title)); } } return getAllPages(data,space).filter(page=>page.title!==getHomePage(space)&&!referenced.has(getPageKey(space,page.title))); }
