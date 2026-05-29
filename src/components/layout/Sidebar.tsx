import { useState } from 'react'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import { useJobStore } from '../../store/jobStore'
import type { Job } from '../../types'

type PageType = 'dashboard' | 'calendar' | 'jobs'

interface SidebarProps {
  onSignOut: () => void
  userEmail: string
  isGuest: boolean
  page: PageType
  onPageChange: (p: PageType) => void
  onProfileOpen: () => void
  onJobDetail: (job: Job) => void
}

const NAV_ITEMS: { id: PageType; icon: string; label: string; sublabel: string }[] = [
  { id: 'dashboard', icon: '🏠', label: '대시보드',  sublabel: '현황 한눈에 보기' },
  { id: 'calendar',  icon: '📅', label: '달력',      sublabel: '일정 & 디데이' },
  { id: 'jobs',      icon: '📋', label: '공고 관리',  sublabel: '지원 현황 추적' },
]

function getDdayLabel(deadline: string | null): { text: string; urgent: boolean } {
  if (!deadline) return { text: '', urgent: false }
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diff < 0) return { text: '마감', urgent: false }
  if (diff === 0) return { text: 'D-Day', urgent: true }
  if (diff <= 7) return { text: `D-${diff}`, urgent: true }
  return { text: `D-${diff}`, urgent: false }
}

export default function Sidebar({ onSignOut, userEmail, isGuest, page, onPageChange, onProfileOpen, onJobDetail }: SidebarProps) {
  const { isConnected, connecting, connect, disconnect } = useGoogleCalendar()
  const jobs = useJobStore((s) => s.jobs)
  const starredJobs = jobs.filter((j) => j.starred)
  const [starsOpen, setStarsOpen] = useState(true)

  return (
    <aside className="hidden md:flex w-56 flex-col shrink-0 bg-white border-r border-gray-100">

      {/* 로고 */}
      <div className="px-5 py-5 border-b border-gray-100">
        <button
          onClick={() => onPageChange('dashboard')}
          className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold tracking-tight">JT</span>
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-sm leading-tight">Job Tracker</h1>
            <p className="text-gray-400 text-xs mt-0.5">취업 준비 대시보드</p>
          </div>
        </button>
      </div>

      {/* 메인 네비게이션 */}
      <nav className="px-3 pt-3 flex-1 space-y-0.5">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2">메뉴</p>
        {NAV_ITEMS.map((item) => {
          const isActive = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group
                ${isActive
                  ? 'bg-blue-50 border-l-4 border-blue-600 pl-2.5'
                  : 'border-l-4 border-transparent hover:bg-gray-50'
                }`}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'}`}>
                  {item.label}
                </p>
                <p className={`text-xs mt-0.5 leading-tight ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                  {item.sublabel}
                </p>
              </div>
            </button>
          )
        })}

        {/* 즐겨찾기 섹션 */}
        <div className="pt-3 mt-2 border-t border-gray-100">
          <button
            onClick={() => setStarsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-1 mb-1 group"
          >
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider group-hover:text-gray-600 transition-colors">
              ★ 즐겨찾기
            </p>
            <span className="text-gray-300 text-xs">{starsOpen ? '▲' : '▼'}</span>
          </button>

          {starsOpen && (
            <div className="space-y-0.5">
              {starredJobs.length === 0 ? (
                <p className="text-xs text-gray-300 px-3 py-1.5">즐겨찾기한 공고가 없어요</p>
              ) : (
                starredJobs.slice(0, 5).map((job) => {
                  const dday = getDdayLabel(job.deadline)
                  return (
                    <button
                      key={job.id}
                      onClick={() => onJobDetail(job)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-yellow-50 transition-colors group"
                    >
                      <span className="text-yellow-400 text-sm shrink-0">★</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-gray-900">
                          {job.company}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{job.position}</p>
                      </div>
                      {dday.text && (
                        <span className={`text-xs shrink-0 ${dday.urgent ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                          {dday.text}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* 설정 섹션 */}
        <div className="pt-4 mt-2 border-t border-gray-100 space-y-0.5">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2">설정</p>

          <button
            onClick={onProfileOpen}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left border-l-4 border-transparent hover:bg-gray-50 transition-all duration-150 group"
          >
            <span className="text-xl shrink-0">👤</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 leading-tight">내 프로필</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">AI 적합도 분석</p>
            </div>
          </button>

          {isConnected ? (
            <div className="px-3 py-3 rounded-xl bg-emerald-50 border-l-4 border-emerald-500 pl-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">📆</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <p className="text-sm font-semibold text-emerald-700 leading-tight">캘린더 연동됨</p>
                  </div>
                  <button
                    onClick={disconnect}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                  >
                    연동 해제
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left border-l-4 border-transparent hover:bg-gray-50 transition-all duration-150 disabled:opacity-40 group"
            >
              {connecting
                ? <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin shrink-0" />
                : <span className="text-xl shrink-0">📆</span>
              }
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 leading-tight">
                  {connecting ? '연동 중...' : 'Google 캘린더'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">일정 자동 동기화</p>
              </div>
            </button>
          )}
        </div>
      </nav>

      {/* 하단 유저 정보 */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
            {isGuest ? 'G' : (userEmail[0] ?? '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-gray-700 text-xs font-semibold truncate">
              {isGuest ? '게스트 모드' : userEmail}
            </p>
            <p className="text-gray-400 text-xs">
              {isGuest ? '로컬 저장' : '로그인 중'}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full text-left text-gray-400 hover:text-red-500 text-xs py-1 transition-colors"
        >
          {isGuest ? '로그인 화면으로' : '로그아웃'}
        </button>
      </div>
    </aside>
  )
}
