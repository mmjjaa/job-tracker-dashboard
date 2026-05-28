import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'

type PageType = 'dashboard' | 'calendar' | 'jobs'

interface SidebarProps {
  onSignOut: () => void
  userEmail: string
  isGuest: boolean
  page: PageType
  onPageChange: (p: PageType) => void
  onProfileOpen: () => void
}

const NAV_ITEMS: { id: PageType; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '🏠', label: '대시보드' },
  { id: 'calendar',  icon: '📅', label: '달력' },
  { id: 'jobs',      icon: '📋', label: '공고 관리' },
]

export default function Sidebar({ onSignOut, userEmail, isGuest, page, onPageChange, onProfileOpen }: SidebarProps) {
  const { isConnected, connecting, connect, disconnect } = useGoogleCalendar()

  return (
    <aside className="hidden md:flex w-60 flex-col shrink-0 bg-[#0F172A]">

      {/* 로고 */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold tracking-tight">JT</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Job Tracker</h1>
            <p className="text-slate-500 text-xs mt-0.5">취업 준비 대시보드</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="px-3 pt-4 flex-1 space-y-0.5">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-3 mb-2">메뉴</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
              page === item.id
                ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* 부가 메뉴 */}
        <div className="pt-4 mt-2 border-t border-white/5 space-y-0.5">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-3 mb-2">설정</p>

          <button
            onClick={onProfileOpen}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-150"
          >
            <span className="text-base">👤</span>
            내 프로필
          </button>

          {isConnected ? (
            <div className="px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-300 text-xs">Google 캘린더 연동됨</span>
              </div>
              <button
                onClick={disconnect}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors ml-3.5"
              >
                연동 해제
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-150 disabled:opacity-40"
            >
              {connecting
                ? <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                : <span className="text-base">📅</span>
              }
              {connecting ? '연동 중...' : 'Google 캘린더 연동'}
            </button>
          )}
        </div>
      </nav>

      {/* 하단 유저 정보 */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 text-xs font-bold shrink-0">
            {isGuest ? 'G' : (userEmail[0] ?? '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-slate-300 text-xs font-medium truncate">
              {isGuest ? '게스트 모드' : userEmail}
            </p>
            <p className="text-slate-600 text-xs">
              {isGuest ? '로컬 저장' : '로그인 중'}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full text-left text-slate-600 hover:text-slate-300 text-xs py-1 transition-colors"
        >
          {isGuest ? '로그인 화면으로' : '로그아웃'}
        </button>
      </div>
    </aside>
  )
}
