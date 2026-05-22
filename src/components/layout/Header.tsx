import { useJobStore } from '../../store/jobStore'

type ViewMode = 'table' | 'kanban'

interface HeaderProps {
  onAddJob: () => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
}

export default function Header({ onAddJob, view, onViewChange }: HeaderProps) {
  const jobs = useJobStore((s) => s.jobs)

  const handleExport = () => {
    const json = JSON.stringify(jobs, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jobs.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0">
      {/* 모바일에서만 로고 표시 */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <p className="text-gray-900 font-bold text-base leading-tight">Job Tracker</p>
          <p className="text-gray-400 text-xs">취업 준비 대시보드</p>
        </div>
        <h2 className="hidden md:block text-gray-800 font-semibold text-lg">공고 관리</h2>
      </div>
      <div className="flex items-center gap-2">
        {/* 뷰 토글 */}
        <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewChange('table')}
            className={`px-3 py-2 text-sm transition-colors ${
              view === 'table'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            📋 테이블
          </button>
          <button
            onClick={() => onViewChange('kanban')}
            className={`px-3 py-2 text-sm transition-colors ${
              view === 'kanban'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            🗂 칸반
          </button>
        </div>

        {/* 내보내기 — 데스크탑 */}
        <button
          onClick={handleExport}
          className="hidden md:block text-gray-500 hover:text-gray-700 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          내보내기
        </button>
        {/* 내보내기 — 모바일 */}
        <button
          onClick={handleExport}
          className="md:hidden text-gray-500 hover:text-gray-700 border border-gray-200 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        <button
          onClick={onAddJob}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 md:px-4 py-2 rounded-lg transition-colors"
        >
          + 공고 추가
        </button>
      </div>
    </header>
  )
}
