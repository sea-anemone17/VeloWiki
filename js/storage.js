import { DEFAULT_DATA } from "./seed.js";

const STORAGE_KEY = "velowiki_data_v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const seeded = clone(DEFAULT_DATA);
      saveData(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw);

    if (!parsed.pages || typeof parsed.pages !== "object") {
      throw new Error("Invalid VeloWiki data");
    }

    return parsed;
  } catch (error) {
    console.warn("VeloWiki 데이터 로드 실패. 기본 데이터로 복구합니다.", error);
    const seeded = clone(DEFAULT_DATA);
    saveData(seeded);
    return seeded;
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  const seeded = clone(DEFAULT_DATA);
  saveData(seeded);
  return seeded;
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  return URL.createObjectURL(blob);
}
