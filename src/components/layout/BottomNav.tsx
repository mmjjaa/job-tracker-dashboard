type PageType = 'dashboard' | 'calendar' | 'jobs'

interface BottomNavProps {
  page: PageType
  onPageChange: (p: PageType) => void
  onMoreOpen: () => void
}

const NAV_ITEMS: { id: PageType; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '🏠', label: '대시보드' },
  { id: 'calendar',  icon: '📅', label: '달력' },
  { id: 'jobs',      icon: '📋', label: '공고' },
]

export default function BottomNav({ page, onPageChange, onMoreOpen }: BottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = page === item.id
        return (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors
              ${isActive ? 'text-primary-600' : 'text-gray-400 active:text-gray-600'}`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-full" />
            )}
            <span className={`text-xl leading-none transition-transform ${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-primary-600' : ''}`}>
              {item.label}
            </span>
          </button>
        )
      })}

      {/* 더보기 탭 */}
      <button
        onClick={onMoreOpen}
        className="relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-gray-400 active:text-gray-600 transition-colors"
      >
        <span className="text-xl leading-none">⋯</span>
        <span className="text-[10px] font-medium leading-none">더보기</span>
      </button>
    </nav>
  )
}
