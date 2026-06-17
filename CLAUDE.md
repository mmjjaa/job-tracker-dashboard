# job-tracker-dashboard — 프로젝트 CLAUDE.md

전역 규칙은 `~/.claude/CLAUDE.md` 참조. 이 파일에는 이 프로젝트 전용 내용만 기술한다.

---

## 프로젝트 개요

채용 지원 현황을 관리하는 웹 대시보드.
공고를 직접 입력하거나 서울 공공데이터 API로 검색하고, 지원 상태를 추적하며, 진행 현황을 한눈에 파악한다.

---

## 기술 스택

| 영역 | 선택 |
|------|------|
| 번들러 | Vite |
| UI | React 18 + TypeScript |
| 스타일 | Tailwind CSS v3 |
| 상태관리 | Zustand (localStorage persist) |
| DB | Supabase |
| AI | Claude API (claude-haiku-4-5) |
| 캘린더 | Google Calendar API (OAuth2) |
| 공고 검색 | 서울 공공데이터 API |
| 패키지 매니저 | npm |

---

## 폴더 구조

```
src/
├── api/
│   ├── claude.ts              # Claude API 호출 (파싱·추천·자소서)
│   └── seoulJobs.ts           # 서울 공공데이터 채용공고 검색
├── components/
│   ├── onboarding/
│   │   └── OnboardingModal.tsx        # 최초 방문 5단계 온보딩
│   ├── auth/
│   │   └── AuthPage.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   └── MobileMoreSheet.tsx
│   ├── dashboard/
│   │   ├── StatsSection.tsx
│   │   ├── StatsCard.tsx
│   │   ├── ChartSection.tsx
│   │   ├── StatusDonutChart.tsx
│   │   ├── TechStackChart.tsx
│   │   ├── WeeklyBarChart.tsx
│   │   ├── CalendarSection.tsx
│   │   └── DailyBriefingCard.tsx
│   ├── jobs/
│   │   ├── JobTable.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanCard.tsx
│   │   ├── JobFormModal.tsx
│   │   ├── JobDetailModal.tsx
│   │   ├── JobSearchModal.tsx
│   │   └── CoverLetterModal.tsx
│   ├── profile/
│   │   └── ProfileModal.tsx
│   └── ui/
│       └── Tooltip.tsx
├── contexts/
│   └── GoogleCalendarContext.tsx  # Google OAuth2 토큰 관리
├── hooks/
│   ├── useDailyBriefing.ts
│   └── useInstallPrompt.ts
├── lib/
│   ├── supabase.ts            # Supabase 클라이언트
│   └── googleCalendar.ts      # Google Calendar API 호출
├── store/
│   └── jobStore.ts            # Zustand + localStorage
├── utils/
│   └── chartData.ts
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
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_SEOUL_API_KEY=...
VITE_GOOGLE_CLIENT_ID=....apps.googleusercontent.com
```

루트에 `.env` 파일로 관리. 커밋 금지. 템플릿은 `.env.example` 참조.

---

## 주의사항

- Zustand persist 미들웨어로 새로고침 후에도 데이터 유지
- Claude API는 브라우저에서 직접 호출 (anthropic-dangerous-direct-browser-access 헤더 사용)
- Google Calendar 연동은 OAuth2 토큰 방식 (GoogleCalendarContext에서 관리)
- 서울 공공데이터 API는 Vite 프록시를 통해 호출 (`/api/seoul/` 경로)
