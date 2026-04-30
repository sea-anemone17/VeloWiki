# VeloWiki v0.8

개인 지식 위키 / 공부 기록 아카이브입니다.

v0.8의 핵심은 **개념 공간 / 프로필 공간 / 특수 문서** 분리입니다.

---

## 파일 구조

```txt
VeloWiki/
 ┣ index.html
 ┣ css/
 ┃ ┗ style.css
 ┣ js/
 ┃ ┣ app.js
 ┃ ┣ constants.js
 ┃ ┣ pageManager.js
 ┃ ┣ parser.js
 ┃ ┣ router.js
 ┃ ┣ seed.js
 ┃ ┣ storage.js
 ┃ ┣ ui.js
 ┃ ┗ parser/
 ┃   ┣ blocks.js
 ┃   ┣ core.js
 ┃   ┣ embeds.js
 ┃   ┣ extract.js
 ┃   ┣ infobox.js
 ┃   ┣ inline.js
 ┃   ┗ toc.js
 ┗ assets/
   ┗ images/
```

---

## v0.8 기능

### 공간 분리

- `개념` 공간: 공부 개념, 과목 정리, 코드, 프로젝트
- `프로필` 공간: 자기 분석, 일기, 성찰, 감정 기록
- `특수` 공간: 필요문서, 고립문서, 최근변경, 분류목록

### 링크 문법

```md
[[문서명]]
[[문서명|보이는 이름]]
[[프로필:공부를 선택한다는 것]]
[[개념:수학/지수함수]]
```

### 위키 관리

- 역링크는 문서 탭으로 분리
- 필요문서: `특수:필요문서`
- 고립문서: `특수:고립문서`
- 프로필 문서는 고립 문서로 취급하지 않음
- 한글 정렬순 정렬

### 하위 문서 UX

- `수학/지수함수/그래프` 같은 경로형 문서 지원
- 상단 breadcrumb: `수학 › 지수함수 › 그래프`
- 부모 문서 하단에 하위 문서 목록 자동 표시

---

## 실행 방법

```bash
python -m http.server 5500
```

브라우저에서:

```txt
http://localhost:5500
```

---

## 미디어 문법

```md
{{image:https://picsum.photos/800/420|이미지 캡션}}
{{youtube:dQw4w9WgXcQ}}
{{link:https://ko.wikipedia.org/wiki/지수_함수|위키백과 - 지수 함수}}
```

정보상자:

```md
{{정보상자
|이름=지수함수
|분류=수학
|관련=[[로그함수]], [[초월함수]]
|이미지=https://picsum.photos/400/300
}}
```

---

## 적용 전 주의

기존 localStorage 데이터는 자동 migration됩니다.

- 기존 문서 대부분은 `study`로 이동
- `성찰/`, `프로필/`, `공부를 선택`이 포함된 문서는 `profile`로 이동

중요한 내용은 적용 전 복사해 두는 것을 추천합니다.
