# job-tracker-dashboard — 프로젝트 CLAUDE.md

전역 규칙은 `~/.claude/CLAUDE.md` 참조. 이 파일에는 이 프로젝트 전용 내용만 기술한다.

---

## 프로젝트 개요

채용 지원 현황을 관리하는 웹 대시보드.
공고를 직접 입력하고, 지원 상태를 추적하며, 진행 현황을 한눈에 파악한다.

---

## 기술 스택

| 영역 | 선택 |
|------|------|
| 번들러 | Vite |
| UI | React 18 + TypeScript |
| 스타일 | Tailwind CSS v3 |
| 상태관리 | Zustand (localStorage persist) |
| AI | Claude API (claude-haiku-4-5) |
| 패키지 매니저 | npm |

---

## 폴더 구조

```
src/
├── api/
│   └── claude.ts          # Claude API 호출 (파싱·추천·자소서)
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── dashboard/
│   │   ├── StatsSection.tsx
│   │   └── StatsCard.tsx
│   └── jobs/
│       ├── JobTable.tsx
│       ├── JobFormModal.tsx
│       └── CoverLetterModal.tsx
├── store/
│   └── jobStore.ts        # Zustand + localStorage
├── types.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## 개발 명령어

```bash
npm install
npm run dev
npm run build
```

---

## 환경변수

```
VITE_CLAUDE_API_KEY=sk-ant-...
```

루트에 `.env` 파일로 관리. 커밋 금지.

---

## 주의사항

- 데이터는 localStorage에만 저장 (서버/DB 없음)
- Zustand persist 미들웨어로 새로고침 후에도 데이터 유지
- Claude API는 브라우저에서 직접 호출 (anthropic-dangerous-direct-browser-access 헤더 사용)
