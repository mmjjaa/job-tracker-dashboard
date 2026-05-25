interface SidebarProps {
  onSignOut: () => void
  userEmail: string
}

export default function Sidebar({ onSignOut, userEmail }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-56 bg-gray-900 flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-white font-bold text-lg">Job Tracker</h1>
        <p className="text-gray-400 text-xs mt-1">취업 준비 대시보드</p>
      </div>
      <nav className="px-3 flex-1">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 bg-gray-800 text-sm"
        >
          <span>📋</span>
          공고 관리
        </a>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <p className="text-gray-500 text-xs truncate mb-2">{userEmail}</p>
        <button
          onClick={onSignOut}
          className="w-full text-left text-gray-400 hover:text-white text-xs py-1 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </aside>
  )
}
