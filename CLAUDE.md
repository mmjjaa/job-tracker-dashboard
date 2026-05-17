# job-notion-clipper — 프로젝트 CLAUDE.md

전역 규칙은 `~/.claude/CLAUDE.md` 참조. 이 파일에는 이 프로젝트 전용 내용만 기술한다.

---

## 프로젝트 개요

채용공고 페이지(원티드·링크드인·잡코리아·사람인)에서 공고를 클릭 한 번으로 Notion DB에 저장하는 Chrome Extension.

---

## 기술 스택

| 영역 | 선택 |
|------|------|
| 번들러 | Vite + `@crxjs/vite-plugin` |
| UI | React 18 + TypeScript |
| 스타일 | Tailwind CSS v3 |
| AI 파싱 | Claude API (`claude-haiku-4-5-20251001`) |
| DB 저장 | Notion API v2022-06-28 |
| 크롬 스토리지 | `chrome.storage.local` |
| 패키지 매니저 | npm |

---

## 폴더 구조

```
job-notion-clipper/
├── src/
│   ├── popup/
│   │   ├── Popup.tsx           ← 탭 전환 (저장하기 / 최근 목록)
│   │   ├── components/
│   │   │   ├── SaveTab.tsx     ← 파싱 결과 미리보기 + 메모 입력 + 중복 감지
│   │   │   └── RecentTab.tsx   ← 최근 저장 5개 목록
│   │   └── main.tsx
│   ├── content/
│   │   └── content.ts          ← 공고 페이지 텍스트 추출
│   ├── background/
│   │   └── background.ts       ← AI 파싱 + Notion 저장 오케스트레이션
│   ├── api/
│   │   ├── claude.ts           ← Claude API 호출
│   │   └── notion.ts           ← Notion API 호출
│   └── types.ts                ← 공유 타입 정의
├── public/
│   └── icons/                  ← 16·32·48·128px 아이콘
├── manifest.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## 환경 변수

`.env` 파일에 보관, 절대 커밋 금지.

```
VITE_CLAUDE_API_KEY=sk-ant-...
VITE_NOTION_API_KEY=secret_...
VITE_NOTION_DATABASE_ID=...
```

---

## 지원 사이트별 선택자 전략

| 사이트 | 추출 전략 |
|--------|-----------|
| 원티드 | `document.querySelector('.JobDescription')` 우선, 없으면 `main` |
| 링크드인 | `.jobs-description__content` |
| 잡코리아 | `#jobDetailContainer` |
| 사람인 | `#job-description-wrap` |
| 기타 | `document.body.innerText` (폴백) |

---

## Notion DB 스키마

| 속성명 | 타입 | 비고 |
|--------|------|------|
| 회사명 | title | |
| 포지션 | rich_text | |
| URL | url | |
| 기술스택 | multi_select | AI 추출 |
| 연봉 | rich_text | 없으면 "정보 없음" |
| 지원현황 | select | 관심 / 지원예정 / 지원완료 / 결과대기 |
| 마감일 | date | AI 추출, ISO 8601 |
| 한줄메모 | rich_text | 사용자 입력 |

---

## 메시지 흐름 (Extension 내부)

```
content.ts  →(EXTRACT_JOB)→  background.ts
background.ts →(Claude API)→  구조화 JSON
background.ts →(Notion API)→  DB 저장
background.ts →(응답)→        Popup.tsx
```

---

## 커밋 컨벤션

전역 규칙과 동일: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`

예:
- `feat: content script 공고 텍스트 추출 구현`
- `feat: Claude API 파싱 통합`
- `feat: Notion DB 저장 구현`
- `feat: 중복 감지 기능 추가`
- `feat: 최근 목록 탭 구현`

---

## 개발 명령어

```bash
npm install
npm run dev      # Vite 빌드 (watch 모드)
# chrome://extensions → 개발자 모드 → dist/ 폴더 로드
```

---

## 주의사항

- Claude API는 background service worker에서만 호출 (content script X)
- Notion API는 CORS 제한으로 background에서만 호출 가능
- `chrome.storage.local`에 최근 5개 저장 목록 캐싱
- 마감일 파싱 실패 시 `null` 저장 (에러 throw 금지)
