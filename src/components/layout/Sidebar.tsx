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
  return (
    <aside className="hidden md:flex w-56 bg-gray-900 flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-white font-bold text-lg">Job Tracker</h1>
        <p className="text-gray-400 text-xs mt-1">취업 준비 대시보드</p>
      </div>
      <nav className="px-3 flex-1 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              page === item.id
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="pt-3 border-t border-gray-800 mt-3">
          <button
            onClick={onProfileOpen}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
          >
            <span>👤</span>
            내 프로필
          </button>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <p className="text-gray-400 text-xs truncate mb-2">{userEmail}</p>
        <button
          onClick={onSignOut}
          className="w-full text-left text-gray-400 hover:text-white text-xs py-1 transition-colors"
        >
          {isGuest ? '로그인 화면으로' : '로그아웃'}
        </button>
      </div>
    </aside>
  )
}
