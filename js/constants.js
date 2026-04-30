export const SPACES = {
  study: { label: "개념", home: "홈" },
  profile: { label: "프로필", home: "프로필 홈" }
};

export const SPECIAL_LABELS = {
  wanted: "필요문서",
  orphan: "고립문서",
  recent: "최근변경",
  categories: "분류목록"
};

export function getSpaceLabel(space) {
  return SPACES[space]?.label || space;
}

export function getHomePage(space) {
  return SPACES[space]?.home || "홈";
}

export function isContentSpace(space) {
  return Boolean(SPACES[space]);
}
