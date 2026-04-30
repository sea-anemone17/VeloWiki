import { loadData, saveData } from "./storage.js";
import { ensurePage, getAllPages, normalizeTitle, upsertPage } from "./pageManager.js";
import { getRoute, onRouteChange, routeToPage } from "./router.js";
import { closeMobileSidebar, renderCategoryPage, renderPage, renderSidebar, showNotice } from "./ui.js";

let data = loadData();
let autosaveTimer;
let currentRoute = getRoute();
let editing = false;
let searchQuery = "";

const els = {
  searchInput: document.querySelector("#searchInput"),
  newPageBtn: document.querySelector("#newPageBtn"),
  randomPageBtn: document.querySelector("#randomPageBtn"),
  editBtn: document.querySelector("#editBtn"),
  saveBtn: document.querySelector("#saveBtn"),
  cancelBtn: document.querySelector("#cancelBtn"),
  titleInput: document.querySelector("#titleInput"),
  contentInput: document.querySelector("#contentInput"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  sidebar: document.querySelector("#sidebar"),
  deleteBtn: document.querySelector("#deleteBtn")
};

function render() {
  currentRoute = getRoute();
  const activeTitle = currentRoute.type === "page" ? currentRoute.value : "";
  renderSidebar(data, activeTitle, searchQuery);

  if (currentRoute.type === "category") {
    renderCategoryPage(data, currentRoute.value);
  } else {
    renderPage(data, currentRoute.value, editing);
  }

  closeMobileSidebar();
}

function startEdit() {
  if (currentRoute.type !== "page") return;
  editing = true;
  render();
}

function cancelEdit() {
  editing = false;
  render();
}

function deleteCurrentPage() {
  if (currentRoute.type !== "page") return;

  const title = currentRoute.value;

  if (title === "홈") {
    showNotice("홈 문서는 삭제할 수 없습니다.");
    return;
  }

  if (!confirm(`정말 "${title}" 문서를 삭제할까요?`)) return;

  delete data.pages[title];
  saveData(data);

  editing = false;
  showNotice("문서를 삭제했습니다.");
  routeToPage("홈");
}

function saveCurrentPage() {
  if (currentRoute.type !== "page") return;

  const oldTitle = currentRoute.value;
  const nextTitle = normalizeTitle(els.titleInput.value);
  const content = els.contentInput.value;

  try {
    const page = upsertPage(data, oldTitle, nextTitle, content);
    saveData(data);
    editing = false;
    showNotice("저장했습니다.");
    if (page.title !== oldTitle) {
      routeToPage(page.title);
    } else {
      render();
    }
  } catch (error) {
    showNotice(error.message || "저장에 실패했습니다.");
  }
}

function createNewPage() {
  const title = prompt("새 문서 제목을 입력하세요.");
  const normalized = normalizeTitle(title || "");
  if (!normalized) return;

  ensurePage(data, normalized);
  saveData(data);
  editing = true;
  routeToPage(normalized);
}

function openRandomPage() {
  const pages = getAllPages(data);
  if (!pages.length) return;
  const page = pages[Math.floor(Math.random() * pages.length)];
  routeToPage(page.title);
}

function bindEvents() {
  onRouteChange(() => {
    editing = false;
    render();
  });

  els.searchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value;
    renderSidebar(data, currentRoute.type === "page" ? currentRoute.value : "", searchQuery);
  });

  els.newPageBtn.addEventListener("click", createNewPage);
  els.randomPageBtn.addEventListener("click", openRandomPage);
  els.editBtn.addEventListener("click", startEdit);
  els.saveBtn.addEventListener("click", saveCurrentPage);
  els.cancelBtn.addEventListener("click", cancelEdit);
  els.deleteBtn.addEventListener("click", deleteCurrentPage);

  els.sidebarToggle.addEventListener("click", () => {
    els.sidebar.classList.toggle("open");
  });

  window.addEventListener("velowiki:create-missing", (event) => {
    const title = normalizeTitle(event.detail?.title || "");
    if (!title) return;
    ensurePage(data, title);
    saveData(data);
    editing = true;
    routeToPage(title);
  });

  document.addEventListener("click", (event) => {
    const tocLink = event.target.closest(".toc-link");
    if (!tocLink) return;

    const sectionId = tocLink.dataset.section;
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  document.addEventListener("click", (event) => {
    const ref = event.target.closest(".footnote-ref");
    if (!ref) return;

    const id = ref.dataset.footnoteId;
    const item = document.querySelector(`[data-footnote-item="${CSS.escape(id)}"]`);

    if (!item) return;

    showFootnotePopup(ref, item.textContent.trim());
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      if (editing) {
        event.preventDefault();
        saveCurrentPage();
      }
    }
  });
}

function setupAutosave() {
  const contentInput = document.querySelector("#contentInput");
  const titleInput = document.querySelector("#titleInput");

  function triggerAutosave() {
    if (!editing) return;

    clearTimeout(autosaveTimer);

    autosaveTimer = setTimeout(() => {
      autosaveCurrentPage();
    }, 5000);
  }

  contentInput.addEventListener("input", triggerAutosave);
  titleInput.addEventListener("input", triggerAutosave);
}

function autosaveCurrentPage() {
  if (currentRoute.type !== "page" || !editing) return;

  const oldTitle = currentRoute.value;
  const nextTitle = normalizeTitle(els.titleInput.value);
  const content = els.contentInput.value;

  try {
    const page = upsertPage(data, oldTitle, nextTitle, content);
    saveData(data);
    showNotice("자동 저장됨");

    if (page.title !== oldTitle) {
      history.replaceState(null, "", `#/page/${encodeURIComponent(page.title)}`);
      currentRoute = getRoute();
    }

    renderSidebar(data, page.title, searchQuery);
  } catch (error) {
    showNotice(error.message || "자동 저장 실패");
  }
}

function showFootnotePopup(anchor, text) {
  document.querySelector(".footnote-popup")?.remove();

  const popup = document.createElement("div");
  popup.className = "footnote-popup";
  popup.textContent = text;

  document.body.appendChild(popup);

  const rect = anchor.getBoundingClientRect();

  popup.style.left = `${Math.min(rect.left, window.innerWidth - 320)}px`;
  popup.style.top = `${rect.bottom + window.scrollY + 8}px`;

  setTimeout(() => {
    document.addEventListener("click", closeFootnotePopup, { once: true });
  }, 0);
}

function closeFootnotePopup(event) {
  if (event.target.closest(".footnote-popup") || event.target.closest(".footnote-ref")) return;
  document.querySelector(".footnote-popup")?.remove();
}

function boot() {
  if (!window.location.hash) {
    routeToPage(data.settings?.homePage || "홈");
  }
  bindEvents();
  setupAutosave();
  render();
}

boot();
