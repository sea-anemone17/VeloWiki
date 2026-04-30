export const DEFAULT_DATA = {
  pages: {
    "홈": {
      title: "홈",
      content: `# VeloWiki

내가 배우고, 이해하고, 살아남은 기록을 쌓는 개인 위키입니다.

## 시작 문서

- [[VeloWiki/사용법]]
- [[Python/기초/조건문]]
- [[수학/지수함수]]
- [[성찰/공부를 선택한다는 것]]

[[분류:메인]]`,
      categories: ["메인"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisionCount: 1
    },

    "VeloWiki/사용법": {
      title: "VeloWiki/사용법",
      content: `# VeloWiki 사용법

## 1. 링크

문서끼리 연결하고 싶으면 다음처럼 씁니다.

\`\`\`
[[문서명]]
[[문서명|보이는 이름]]
\`\`\`

예: [[수학/지수함수|지수함수]]

## 2. 분류

문서 하단에 분류를 달고 싶으면 다음처럼 씁니다.

\`\`\`
[[분류:수학]]
[[분류:코딩]]
\`\`\`

## 3. 주석

나무위키처럼 주석도 달 수 있습니다.[^1]

[^1]: 주석을 누르면 작은 팝업으로 표시됩니다.

## 4. 미디어

이미지, 영상, 링크 카드를 넣을 수 있습니다.

\`\`\`
{{image:https://picsum.photos/800/420|테스트 이미지}}
{{youtube:dQw4w9WgXcQ}}
{{link:https://ko.wikipedia.org/wiki/지수_함수|위키백과 - 지수 함수}}
\`\`\`

## 5. 정보상자

\`\`\`
{{정보상자
|이름=지수함수
|분류=수학
|관련=[[로그함수]], [[초월함수]]
|이미지=https://picsum.photos/400/300
}}
\`\`\`

[[분류:도움말]]`,
      categories: ["도움말"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisionCount: 1
    },

    "Python/기초/조건문": {
      title: "Python/기초/조건문",
      content: `# 조건문

조건문은 상황에 따라 다른 행동을 하게 하는 코드이다.

\`\`\`python
age = 18

if age >= 20:
    print("성인")
else:
    print("미성년자")
\`\`\`

## 내 이해

컴퓨터에게 "만약 이런 상황이면 A, 아니면 B"라고 알려 주는 구조다.

관련 문서: [[Python/기초/변수]], [[Python/실수/들여쓰기 오류]]

[[분류:Python]]
[[분류:코딩]]`,
      categories: ["Python", "코딩"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisionCount: 1
    },

    "수학/지수함수": {
      title: "수학/지수함수",
      content: `# 지수함수

{{정보상자
|이름=지수함수
|분류=수학
|관련=[[수학/로그함수]], [[수학/초월함수]]
|이미지=https://picsum.photos/400/260
}}

## 1. 개요

지수함수는 지수에 미지수 x가 있는 함수이다.[^1]

보통 다음 꼴로 나타낸다.

\`\`\`
f(x) = a^x  (a > 0, a ≠ 1)
\`\`\`

{{image:https://picsum.photos/800/420|이미지 문법 테스트}}

{{link:https://ko.wikipedia.org/wiki/지수_함수|위키백과 - 지수 함수}}

## 2. 관련 개념

- [[수학/로그함수]]
- [[수학/함수]]
- [[수학/초월함수]]

[^1]: 거듭제곱 자리에 정의역이 들어가기 때문에 일반적인 다항식과 다르다.

[[분류:수학]]
[[분류:함수]]`,
      categories: ["수학", "함수"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisionCount: 1
    },

    "성찰/공부를 선택한다는 것": {
      title: "성찰/공부를 선택한다는 것",
      content: `# 공부를 선택한다는 것

나는 남이 시켜서 하는 공부보다, 내가 선택해서 통과하는 공부를 원한다.

## 핵심 문장

> 고통받을 거라면, 그 고통은 내가 선택한다.

관련 문서: [[자율성]], [[생존 서사]], [[VeloWiki]]

[[분류:성찰]]
[[분류:공부]]`,
      categories: ["성찰", "공부"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisionCount: 1
    }
  },

  settings: {
    homePage: "홈",
    theme: "warm"
  }
};
