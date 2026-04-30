import { DEFAULT_DATA } from "./seed.js";
import { getPageKey } from "./parser.js";
import { getHomePage } from "./constants.js";
const STORAGE_KEY="velowiki_data_v1";
function clone(value){ return JSON.parse(JSON.stringify(value)); }
function inferSpace(title){ return (title.startsWith("성찰/")||title.startsWith("프로필/")||title.includes("공부를 선택")) ? "profile" : "study"; }
function migrateData(data){
  data.settings ||= {}; data.settings.homePage ||= { study:"홈", profile:"프로필 홈" };
  if(typeof data.settings.homePage==="string") data.settings.homePage={study:data.settings.homePage,profile:"프로필 홈"};
  const nextPages={};
  for(const [key,page] of Object.entries(data.pages||{})){
    const title=page.title || (key.includes("::")?key.split("::").slice(1).join("::"):key);
    const space=page.space || (key.includes("::")?key.split("::")[0]:inferSpace(title));
    const migrated={...page,title,space,categories:page.categories||[],revisionCount:page.revisionCount||1};
    nextPages[getPageKey(space,title)]=migrated;
  }
  data.pages=nextPages;
  const now=new Date().toISOString();
  const ensureHome=(space,title,content)=>{ const pageKey=getPageKey(space,title); if(!data.pages[pageKey]) data.pages[pageKey]={title,space,content,categories:[space==="study"?"메인":"프로필"],createdAt:now,updatedAt:now,revisionCount:1}; };
  ensureHome("study",getHomePage("study"),"# 홈\n\n개념 위키의 시작점입니다.\n\n- [[수학/지수함수]]\n- [[Python/기초/조건문]]\n\n[[분류:메인]]");
  ensureHome("profile",getHomePage("profile"),"# 프로필 홈\n\n개인 성찰과 학습 동기를 기록하는 공간입니다.\n\n- [[공부를 선택한다는 것]]\n\n[[분류:프로필]]");
  return data;
}
export function loadData(){ try{ const raw=localStorage.getItem(STORAGE_KEY); if(!raw){ const seeded=migrateData(clone(DEFAULT_DATA)); saveData(seeded); return seeded; } const parsed=migrateData(JSON.parse(raw)); saveData(parsed); return parsed; } catch(error){ console.warn("VeloWiki 데이터 로드 실패. 기본 데이터로 복구합니다.",error); const seeded=migrateData(clone(DEFAULT_DATA)); saveData(seeded); return seeded; } }
export function saveData(data){ localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); }
export function resetData(){ const seeded=migrateData(clone(DEFAULT_DATA)); saveData(seeded); return seeded; }
export function exportData(data){ const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); return URL.createObjectURL(blob); }
