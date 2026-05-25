import { useState, useRef } from 'react'
import { useJobStore } from '../../store/jobStore'

type ViewMode = 'table' | 'kanban'

interface HeaderProps {
  onAddJob: () => void
  onSearchJob: () => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  userEmail: string
  isGuest: boolean
  onSignOut: () => void
}

export default function Header({ onAddJob, onSearchJob, view, onViewChange, userEmail, isGuest, onSignOut }: HeaderProps) {
  const jobs = useJobStore((s) => s.jobs)
  const keywords = useJobStore((s) => s.keywords)
  const addKeyword = useJobStore((s) => s.addKeyword)
  const removeKeyword = useJobStore((s) => s.removeKeyword)

  const [menuOpen, setMenuOpen] = useState(false)
  const [kwInput, setKwInput] = useState('')
  const [kwInputOpen, setKwInputOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleKwSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addKeyword(kwInput)
      setKwInput('')
      setKwInputOpen(false)
    }
    if (e.key === 'Escape') {
      setKwInput('')
      setKwInputOpen(false)
    }
  }

  const openKwInput = () => {
    setKwInputOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col gap-2 shrink-0">
      {/* 메인 행 */}
      <div className="flex items-center justify-between">
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
                view === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              📋 테이블
            </button>
            <button
              onClick={() => onViewChange('kanban')}
              className={`px-3 py-2 text-sm transition-colors ${
                view === 'kanban' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              🗂 칸반
            </button>
          </div>

          {/* 내보내기 */}
          <button
            onClick={handleExport}
            className="hidden md:block text-gray-500 hover:text-gray-700 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            내보내기
          </button>

          {/* 공고 검색 */}
          <button
            onClick={onSearchJob}
            className="hidden md:flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
          >
            🔍 공고 검색
            {keywords.length > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {keywords.length}
              </span>
            )}
          </button>

          <button
            onClick={onAddJob}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 md:px-4 py-2 rounded-lg transition-colors"
          >
            + 공고 추가
          </button>

          {/* 유저 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                {isGuest ? 'G' : (userEmail[0] ?? '?').toUpperCase()}
              </div>
              <span className="hidden md:block text-xs text-gray-600 max-w-[120px] truncate">
                {isGuest ? '게스트' : userEmail}
              </span>
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400">{isGuest ? '게스트 모드' : '로그인 중'}</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{isGuest ? '저장은 이 기기에만 됩니다' : userEmail}</p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    JSON 내보내기
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onSignOut() }}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    {isGuest ? '로그인 화면으로' : '로그아웃'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 키워드 구독 행 — 데스크탑 */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 font-medium shrink-0">구독 키워드</span>
        {keywords.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium"
          >
            {kw}
            <button
              onClick={() => removeKeyword(kw)}
              className="text-indigo-400 hover:text-indigo-700 leading-none"
            >
              ✕
            </button>
          </span>
        ))}
        {kwInputOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={kwInput}
            onChange={(e) => setKwInput(e.target.value)}
            onKeyDown={handleKwSubmit}
            onBlur={() => { setKwInput(''); setKwInputOpen(false) }}
            placeholder="입력 후 Enter"
            className="text-xs border border-indigo-300 rounded-full px-2.5 py-1 outline-none focus:ring-2 focus:ring-indigo-300 w-28"
          />
        ) : (
          <button
            onClick={openKwInput}
            className="text-xs text-gray-400 hover:text-indigo-600 border border-dashed border-gray-300 hover:border-indigo-400 px-2.5 py-1 rounded-full transition-colors"
          >
            + 키워드 추가
          </button>
        )}
      </div>
    </header>
  )
}
