import { useEffect } from 'react'
import { useJobStore } from '../../store/jobStore'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import type { Job } from '../../types'

interface MobileMoreSheetProps {
  onClose: () => void
  onProfileOpen: () => void
  onJobDetail: (job: Job) => void
  onSignOut: () => void
  isGuest: boolean
  userEmail: string
}

function getDdayLabel(deadline: string | null): { text: string; urgent: boolean } {
  if (!deadline) return { text: '', urgent: false }
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diff < 0) return { text: '마감', urgent: false }
  if (diff === 0) return { text: 'D-Day', urgent: true }
  if (diff <= 7) return { text: `D-${diff}`, urgent: true }
  return { text: `D-${diff}`, urgent: false }
}

export default function MobileMoreSheet({
  onClose, onProfileOpen, onJobDetail, onSignOut, isGuest, userEmail
}: MobileMoreSheetProps) {
  const jobs = useJobStore((s) => s.jobs)
  const starredJobs = jobs.filter((j) => j.starred)
  const { isConnected, connecting, connect, disconnect } = useGoogleCalendar()

  // 뒤쪽 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* 시트 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="overflow-y-auto px-4 pb-4">

          {/* 유저 정보 */}
          <div className="flex items-center gap-3 py-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold shrink-0">
              {isGuest ? 'G' : (userEmail[0] ?? '?').toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {isGuest ? '게스트 모드' : userEmail}
              </p>
              <p className="text-xs text-gray-400">{isGuest ? '로컬 저장' : '로그인 중'}</p>
            </div>
          </div>

          {/* 내 프로필 */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">설정</p>
            <button
              onClick={() => { onProfileOpen(); onClose() }}
              className="w-full flex items-center gap-3 py-3 px-1 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl">👤</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">내 프로필</p>
                <p className="text-xs text-gray-400">AI 적합도 분석</p>
              </div>
              <span className="ml-auto text-gray-300 text-sm">›</span>
            </button>

            {/* 구글 캘린더 */}
            {isConnected ? (
              <div className="flex items-center gap-3 py-3 px-1 rounded-xl bg-emerald-50 mt-1">
                <span className="text-2xl shrink-0">📆</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-sm font-semibold text-emerald-700">캘린더 연동됨</p>
                  </div>
                  <button
                    onClick={disconnect}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                  >
                    연동 해제
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="w-full flex items-center gap-3 py-3 px-1 rounded-xl hover:bg-gray-50 transition-colors mt-1 disabled:opacity-40"
              >
                {connecting
                  ? <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin shrink-0" />
                  : <span className="text-2xl shrink-0">📆</span>
                }
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {connecting ? '연동 중...' : 'Google 캘린더'}
                  </p>
                  <p className="text-xs text-gray-400">일정 자동 동기화</p>
                </div>
                <span className="ml-auto text-gray-300 text-sm">›</span>
              </button>
            )}
          </div>

          {/* 즐겨찾기 */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">★ 즐겨찾기</p>
            {starredJobs.length === 0 ? (
              <p className="text-sm text-gray-400 px-1 py-2">즐겨찾기한 공고가 없어요</p>
            ) : (
              <div className="space-y-1">
                {starredJobs.map((job) => {
                  const dday = getDdayLabel(job.deadline)
                  return (
                    <button
                      key={job.id}
                      onClick={() => { onJobDetail(job); onClose() }}
                      className="w-full flex items-center gap-3 py-2.5 px-1 rounded-xl hover:bg-yellow-50 transition-colors"
                    >
                      <span className="text-yellow-400 text-lg shrink-0">★</span>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-800 truncate">{job.company}</p>
                        <p className="text-xs text-gray-400 truncate">{job.position}</p>
                      </div>
                      {dday.text && (
                        <span className={`text-xs shrink-0 ${dday.urgent ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                          {dday.text}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 로그아웃 */}
          <div className="py-3">
            <button
              onClick={() => { onSignOut(); onClose() }}
              className="w-full flex items-center gap-3 py-3 px-1 rounded-xl hover:bg-red-50 transition-colors"
            >
              <span className="text-2xl">🚪</span>
              <p className="text-sm font-semibold text-red-500">
                {isGuest ? '로그인 화면으로' : '로그아웃'}
              </p>
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
