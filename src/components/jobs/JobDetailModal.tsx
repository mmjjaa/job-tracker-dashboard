import { useState } from 'react'
import type { Job } from '../../types'
import { useJobStore } from '../../store/jobStore'
import { analyzeJobMatch } from '../../api/claude'
import type { MatchResult } from '../../api/claude'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import { createCalendarEvent, patchCalendarEvent, deleteCalendarEvent } from '../../lib/googleCalendar'

const STATUS_BADGE: Record<string, string> = {
  '관심':    'bg-primary-50 text-primary-600',
  '지원예정': 'bg-purple-50 text-purple-600',
  '지원완료': 'bg-emerald-50 text-emerald-600',
  '결과대기': 'bg-amber-50 text-amber-600',
}

const STATUS_ICON: Record<string, string> = {
  good: '✅',
  warning: '⚠️',
  bad: '❌',
  unknown: '❓',
}

const STATUS_COLOR: Record<string, string> = {
  good: 'text-emerald-600',
  warning: 'text-amber-600',
  bad: 'text-red-500',
  unknown: 'text-gray-400',
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-primary-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-400'
}

function getDday(deadline: string | null): { text: string; color: string } {
  if (!deadline) return { text: '', color: '' }
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diff < 0) return { text: '마감', color: 'text-gray-400' }
  if (diff === 0) return { text: 'D-Day', color: 'text-red-600 font-bold' }
  if (diff <= 3) return { text: `D-${diff}`, color: 'text-red-500 font-semibold' }
  if (diff <= 7) return { text: `D-${diff}`, color: 'text-orange-500 font-semibold' }
  return { text: `D-${diff}`, color: 'text-gray-500' }
}

interface Props {
  job: Job
  onClose: () => void
  onEdit: (job: Job) => void
}

export default function JobDetailModal({ job, onClose, onEdit }: Props) {
  const dday = getDday(job.deadline)
  const profile = useJobStore((s) => s.profile)
  const updateJob = useJobStore((s) => s.updateJob)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState('')

  const { isConnected, connect, getToken } = useGoogleCalendar()
  const [calEventId, setCalEventId] = useState<string | undefined>(job.calendarEventId)
  const [calLoading, setCalLoading] = useState(false)
  const [calError, setCalError] = useState('')

  const jobInput = {
    company: job.company,
    position: job.position,
    deadline: job.deadline,
    status: job.status,
    address: job.address,
  }

  const handleAddToCalendar = async () => {
    setCalLoading(true)
    setCalError('')
    try {
      const token = await getToken()
      const eventId = await createCalendarEvent(token, jobInput)
      await updateJob(job.id, { calendarEventId: eventId })
      setCalEventId(eventId)
    } catch (e) {
      setCalError('캘린더 등록에 실패했습니다.')
      console.error(e)
    } finally {
      setCalLoading(false)
    }
  }

  const handleSyncCalendar = async () => {
    if (!calEventId) return
    setCalLoading(true)
    setCalError('')
    try {
      const token = await getToken()
      await patchCalendarEvent(token, calEventId, jobInput)
    } catch (e) {
      setCalError('캘린더 동기화에 실패했습니다.')
      console.error(e)
    } finally {
      setCalLoading(false)
    }
  }

  const handleRemoveFromCalendar = async () => {
    if (!calEventId) return
    setCalLoading(true)
    setCalError('')
    try {
      const token = await getToken()
      await deleteCalendarEvent(token, calEventId)
      await updateJob(job.id, { calendarEventId: undefined })
      setCalEventId(undefined)
    } catch (e) {
      setCalError('캘린더 삭제에 실패했습니다.')
      console.error(e)
    } finally {
      setCalLoading(false)
    }
  }

  const hasProfile = profile.techStack.length > 0 || !!profile.career || !!profile.introduction

  const handleAnalyze = async () => {
    setMatchLoading(true)
    setMatchError('')
    try {
      const result = await analyzeJobMatch(profile, {
        company: job.company,
        position: job.position,
        techStack: job.techStack,
        duties: job.duties ?? '',
        memo: job.memo,
        address: job.address ?? '',
        employmentType: job.employmentType ?? '',
        career: job.career ?? '',
        wage: job.wage ?? '',
        deadline: job.deadline ?? null,
      })
      setMatchResult(result)
    } catch (e) {
      setMatchError('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setMatchLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col max-h-[88vh]">

        {/* 헤더 */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[job.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {job.status}
              </span>
              {job.employmentType && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">
                  {job.employmentType}
                </span>
              )}
              {job.career && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">
                  {job.career}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{job.company}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.position}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none shrink-0">✕</button>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">

          {/* 기본 정보 */}
          <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-gray-100">
            {job.deadline && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">📅</span>
                <div>
                  <p className="text-xs text-gray-400">마감일</p>
                  <p className="text-sm font-medium text-gray-800">
                    {job.deadline}
                    {dday.text && <span className={`ml-2 text-xs ${dday.color}`}>{dday.text}</span>}
                  </p>
                </div>
              </div>
            )}
            {job.wage && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">💰</span>
                <div>
                  <p className="text-xs text-gray-400">급여</p>
                  <p className="text-sm font-medium text-gray-800">{job.wage}</p>
                </div>
              </div>
            )}
            {job.address && (
              <div className="flex items-center gap-2 col-span-2">
                <span className="text-gray-400 text-sm">📍</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">근무지</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{job.address}</p>
                </div>
              </div>
            )}
            {job.url && (
              <div className="flex items-center gap-2 col-span-2">
                <span className="text-gray-400 text-sm">🔗</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">채용 링크</p>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline truncate block"
                  >
                    {job.url}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 기술스택 */}
          {job.techStack.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 mb-2">🛠 기술스택</p>
              <div className="flex flex-wrap gap-1.5">
                {job.techStack.map((t) => (
                  <span key={t} className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 직무 내용 */}
          {job.duties && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 mb-2">📋 직무 내용</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.duties}</p>
            </div>
          )}

          {/* 기업 안내 / 메모 */}
          {job.memo && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 mb-2">💼 기업 안내 / 메모</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.memo}</p>
            </div>
          )}

          {/* AI 매칭 결과 */}
          {(matchResult || matchLoading || matchError) && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 mb-3">🤖 AI 매칭 분석</p>

              {matchLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Claude AI가 분석 중입니다...
                </div>
              )}

              {matchError && (
                <p className="text-sm text-red-500">{matchError}</p>
              )}

              {matchResult && !matchLoading && (
                <div className="space-y-4">
                  {/* 점수 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">적합도</span>
                      <span className="text-xl font-bold text-gray-900">{matchResult.score}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getScoreColor(matchResult.score)}`}
                        style={{ width: `${matchResult.score}%` }}
                      />
                    </div>
                  </div>

                  {/* 항목별 분석 */}
                  <div className="space-y-2">
                    {matchResult.items.map((item) => (
                      <div key={item.label} className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">{STATUS_ICON[item.status]}</span>
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold ${STATUS_COLOR[item.status]}`}>{item.label}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{item.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 종합 요약 */}
                  <div className="bg-primary-50 rounded-lg px-3 py-2.5">
                    <p className="text-xs font-semibold text-primary-700 mb-1">종합</p>
                    <p className="text-sm text-primary-800 leading-relaxed">{matchResult.summary}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 자소서 뱃지 */}
          {job.coverLetter && (
            <div className="px-6 py-4">
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-medium">
                ✍️ 자소서 초안 작성됨
              </span>
            </div>
          )}

          {/* 내용 없을 때 */}
          {!job.duties && !job.memo && job.techStack.length === 0 && !job.deadline && !job.wage && !job.address && !job.url && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400">등록된 상세 정보가 없습니다</p>
              <p className="text-xs text-gray-300 mt-1">수정하기로 정보를 추가해보세요</p>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              등록일 {job.createdAt ? new Date(job.createdAt).toLocaleDateString('ko-KR') : '-'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => { onClose(); onEdit(job) }}
                className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                ✏ 수정하기
              </button>
            </div>
          </div>

          {/* AI 매칭 버튼 */}
          {!matchResult && (
            <button
              onClick={hasProfile ? handleAnalyze : undefined}
              disabled={matchLoading}
              title={!hasProfile ? '먼저 내 프로필을 등록해주세요' : ''}
              className={`mt-3 w-full py-2.5 text-sm rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                hasProfile
                  ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {matchLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  🤖 AI 매칭 분석
                  {!hasProfile && <span className="text-xs opacity-70">(프로필 미등록)</span>}
                </>
              )}
            </button>
          )}
          {matchResult && !matchLoading && (
            <button
              onClick={handleAnalyze}
              className="mt-3 w-full py-2 text-xs text-primary-600 hover:text-primary-800 transition-colors"
            >
              🔄 다시 분석
            </button>
          )}

          {/* Google 캘린더 */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            {calError && <p className="text-xs text-red-500 mb-2">{calError}</p>}
            {!isConnected ? (
              <button
                onClick={connect}
                className="w-full py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                📅 Google 캘린더 연동하기
              </button>
            ) : calEventId ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 text-xs bg-green-50 text-green-700 px-3 py-2 rounded-lg font-medium">
                  <span>📅</span> 캘린더 등록됨
                </div>
                <button
                  onClick={handleSyncCalendar}
                  disabled={calLoading}
                  className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  🔄 동기화
                </button>
                <button
                  onClick={handleRemoveFromCalendar}
                  disabled={calLoading}
                  className="text-xs px-3 py-2 border border-red-100 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCalendar}
                disabled={calLoading}
                className="w-full py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {calLoading
                  ? <><div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> 등록 중...</>
                  : <>📅 Google 캘린더에 추가</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
