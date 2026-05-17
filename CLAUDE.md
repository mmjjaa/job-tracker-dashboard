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
| 패키지 매니저 | npm |

---

## 폴더 구조

```
src/
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
│       └── StatusBadge.tsx
├── store/
│   └── jobStore.ts
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

## 주의사항

- 데이터는 localStorage에만 저장 (서버/DB 없음)
- Zustand persist 미들웨어로 새로고침 후에도 데이터 유지
- 외부 API 호출 없음, 순수 프론트엔드 앱
