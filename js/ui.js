import { renderWiki, escapeHTML } from "./parser.js";
import {
  getAllPages,
  getBacklinks,
  getCategoryMap,
  getChildren,
  getPage,
  getPagesByCategory,
  getParentTitle,
  getRecentPages,
  searchPages
} from "./pageManager.js";
import { routeToPage } from "./router.js";

const emptyTemplate = () => document.querySelector("#emptyListTemplate").content.cloneNode(true);

export function formatDate(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}

function linkHTML(title, activeTitle = "") {
  const active = title === activeTitle ? "active" : "";
  return `<a class="${active}" href="#/page/${encodeURIComponent(title)}">${escapeHTML(title)}</a>`;
}

function renderNavList(container, titles, activeTitle = "") {
  container.innerHTML = "";
  if (!titles.length) {
    container.append(emptyTemplate());
    return;
  }
  container.innerHTML = titles.map((title) => linkHTML(title, activeTitle)).join("");
}

export function renderSidebar(data, activeTitle, query = "") {
  const pages = query ? searchPages(data, query) : getAllPages(data);
  const pageList = document.querySelector("#pageList");
  const recentList = document.querySelector("#recentList");
  const categoryList = document.querySelector("#categoryList");

  renderNavList(pageList, pages.map((page) => page.title), activeTitle);
  renderNavList(recentList, getRecentPages(data).map((page) => page.title), activeTitle);

  const categories = getCategoryMap(data);
  categoryList.innerHTML = categories.length
    ? categories
        .map(({ category, titles }) => `<a href="#/category/${encodeURIComponent(category)}">${escapeHTML(category)} <span class="pill">${titles.length}</span></a>`)
        .join("")
    : `<p class="empty">아직 없습니다.</p>`;

  document.querySelector("#pageCount").textContent = String(Object.keys(data.pages).length);
}

export function renderPage(data, title, editing = false) {
  const page = getPage(data, title);

  const pageTitle = document.querySelector("#pageTitle");
  const pageMeta = document.querySelector("#pageMeta");
  const breadcrumb = document.querySelector("#breadcrumb");
  const viewer = document.querySelector("#viewer");
  const editorWrap = document.querySelector("#editorWrap");
  const titleInput = document.querySelector("#titleInput");
  const contentInput = document.querySelector("#contentInput");
  const editBtn = document.querySelector("#editBtn");
  const saveBtn = document.querySelector("#saveBtn");
  const cancelBtn = document.querySelector("#cancelBtn");

  if (!page) {
    pageTitle.textContent = title;
    pageMeta.textContent = "아직 없는 문서입니다.";
    breadcrumb.innerHTML = "";
    viewer.innerHTML = `<p>이 문서는 아직 없습니다. <button id="createMissingBtn" class="primary-btn" type="button">문서 만들기</button></p>`;
    document.querySelector("#createMissingBtn")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("velowiki:create-missing", { detail: { title } }));
    });
    editorWrap.classList.add("hidden");
    editBtn.classList.add("hidden");
    saveBtn.classList.add("hidden");
    cancelBtn.classList.add("hidden");
    renderSideInfo(data, title);
    return;
  }

  const parent = getParentTitle(page.title);
  breadcrumb.innerHTML = parent ? `상위 문서: <a href="#/page/${encodeURIComponent(parent)}">${escapeHTML(parent)}</a>` : "";
  pageTitle.textContent = page.title;
  pageMeta.textContent = `최근 수정 시각: ${formatDate(page.updatedAt)} · 수정 ${page.revisionCount ?? 1}회`;

  if (editing) {
    titleInput.value = page.title;
    contentInput.value = page.content;
    viewer.classList.add("hidden");
    editorWrap.classList.remove("hidden");
    editBtn.classList.add("hidden");
    saveBtn.classList.remove("hidden");
    cancelBtn.classList.remove("hidden");
  } else {
    viewer.innerHTML = renderWiki(page.content, data.pages);
    viewer.classList.remove("hidden");
    editorWrap.classList.add("hidden");
    editBtn.classList.remove("hidden");
    saveBtn.classList.add("hidden");
    cancelBtn.classList.add("hidden");
  }

  renderSideInfo(data, page.title);
}

export function renderCategoryPage(data, category) {
  const pages = getPagesByCategory(data, category);

  document.querySelector("#breadcrumb").innerHTML = "";
  document.querySelector("#pageTitle").textContent = `분류:${category}`;
  document.querySelector("#pageMeta").textContent = `${pages.length}개 문서`;
  document.querySelector("#viewer").innerHTML = pages.length
    ? `<ul>${pages.map((page) => `<li>${linkHTML(page.title)}</li>`).join("")}</ul>`
    : `<p class="empty">이 분류에는 아직 문서가 없습니다.</p>`;

  document.querySelector("#viewer").classList.remove("hidden");
  document.querySelector("#editorWrap").classList.add("hidden");
  document.querySelector("#editBtn").classList.add("hidden");
  document.querySelector("#saveBtn").classList.add("hidden");
  document.querySelector("#cancelBtn").classList.add("hidden");

  document.querySelector("#pageInfo").innerHTML = `<div class="info-row"><span class="info-label">분류</span><span class="info-value">${escapeHTML(category)}</span></div>`;
  renderNavList(document.querySelector("#childrenList"), []);
  renderNavList(document.querySelector("#backlinkList"), []);
}

export function renderSideInfo(data, title) {
  const page = getPage(data, title);
  const backlinks = getBacklinks(data, title);
  const children = getChildren(data, title);
  const parent = getParentTitle(title);

  const pageInfo = document.querySelector("#pageInfo");
  const childrenList = document.querySelector("#childrenList");
  const backlinkList = document.querySelector("#backlinkList");

  pageInfo.innerHTML = page
    ? `
      <div class="info-row"><span class="info-label">제목</span><span class="info-value">${escapeHTML(page.title)}</span></div>
      <div class="info-row"><span class="info-label">생성</span><span class="info-value">${formatDate(page.createdAt)}</span></div>
      <div class="info-row"><span class="info-label">수정</span><span class="info-value">${formatDate(page.updatedAt)}</span></div>
      <div class="info-row"><span class="info-label">분류</span><span class="info-value">${(page.categories || []).map(escapeHTML).join(", ") || "없음"}</span></div>
      ${parent ? `<div class="info-row"><span class="info-label">상위 문서</span><span class="info-value"><a href="#/page/${encodeURIComponent(parent)}">${escapeHTML(parent)}</a></span></div>` : ""}
    `
    : `<div class="info-row"><span class="info-label">상태</span><span class="info-value">없는 문서</span></div>`;

  renderNavList(childrenList, children, title);
  renderNavList(backlinkList, backlinks, title);
}

export function showNotice(message) {
  const notice = document.querySelector("#notice");
  notice.textContent = message;
  notice.classList.remove("hidden");
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => notice.classList.add("hidden"), 2400);
}

export function closeMobileSidebar() {
  document.querySelector("#sidebar")?.classList.remove("open");
}
