import { useState } from 'react'
import { useAgentLoop } from '../../hooks/useAgentLoop'
import { useJobStore } from '../../store/jobStore'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import { createCalendarEvent } from '../../lib/googleCalendar'
import CoverLetterModal from '../jobs/CoverLetterModal'
import type { AgentSuggestion } from '../../api/claude'
import type { Job } from '../../types'

const ACTION_META: Record<AgentSuggestion['action'], { icon: string; label: string; color: string }> = {
  cover_letter:  { icon: '✍️', label: '자소서 작성 필요',    color: 'bg-violet-50 border-violet-200 text-violet-700' },
  calendar:      { icon: '📅', label: '캘린더 등록 필요',    color: 'bg-blue-50 border-blue-200 text-blue-700' },
  status_change: { icon: '🔄', label: '상태 업데이트 필요',  color: 'bg-amber-50 border-amber-200 text-amber-700' },
  apply_now:     { icon: '🚀', label: '지금 바로 지원하세요', color: 'bg-red-50 border-red-200 text-red-700' },
}

const PRIORITY_DOT: Record<AgentSuggestion['priority'], string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-gray-300',
}

const PHASE_LABEL: Record<string, string> = {
  idle:      '대기 중',
  detecting: '감지 중...',
  analyzing: 'AI 분석 중...',
  done:      '분석 완료',
  error:     '오류 발생',
}

export default function AgentLoopCard() {
  const { phase, urgentCount, canRun, nextRunTime, suggestions, error, run, reset } = useAgentLoop()
  const jobs = useJobStore((s) => s.jobs)
  const agentLastRun = useJobStore((s) => s.agentLastRun)
  const dismissSuggestion = useJobStore((s) => s.dismissSuggestion)
  const logAgentAction = useJobStore((s) => s.logAgentAction)
  const updateStatus = useJobStore((s) => s.updateStatus)
  const updateJob = useJobStore((s) => s.updateJob)
  const { isConnected, getToken } = useGoogleCalendar()

  const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const isRunning = phase === 'detecting' || phase === 'analyzing'

  const getJob = (jobId: string) => jobs.find((j) => j.id === jobId)

  const handleAccept = async (sg: AgentSuggestion) => {
    const job = getJob(sg.jobId)
    if (!job) return

    setActionLoading(sg.jobId)
    try {
      if (sg.action === 'cover_letter') {
        setCoverLetterJob(job)
        logAgentAction({ jobId: sg.jobId, action: sg.action, result: 'accepted' })
        dismissSuggestion(sg.jobId)

      } else if (sg.action === 'calendar') {
        if (!isConnected) {
          alert('먼저 Google 캘린더를 연동해주세요 (사이드바 > Google 캘린더)')
          return
        }
        const token = await getToken()
        if (!token) return
        const eventId = await createCalendarEvent(token, job)
        await updateJob(job.id, { calendarEventId: eventId })
        logAgentAction({ jobId: sg.jobId, action: sg.action, result: 'accepted' })
        dismissSuggestion(sg.jobId)

      } else if (sg.action === 'status_change') {
        await updateStatus(job.id, '지원예정')
        logAgentAction({ jobId: sg.jobId, action: sg.action, result: 'accepted' })
        dismissSuggestion(sg.jobId)

      } else if (sg.action === 'apply_now') {
        if (job.url) {
          window.open(job.url, '_blank', 'noopener,noreferrer')
        }
        await updateStatus(job.id, '지원완료')
        logAgentAction({ jobId: sg.jobId, action: sg.action, result: 'accepted' })
        dismissSuggestion(sg.jobId)
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleDismiss = (sg: AgentSuggestion) => {
    logAgentAction({ jobId: sg.jobId, action: sg.action, result: 'dismissed' })
    dismissSuggestion(sg.jobId)
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base
              ${isRunning ? 'bg-blue-100 animate-pulse' : 'bg-blue-50'}`}>
              🤖
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">AI 에이전트 루프</p>
              <p className="text-xs text-gray-400">
                {agentLastRun
                  ? `마지막 실행: ${new Date(agentLastRun).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
                  : '아직 실행 안 됨'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5
              ${isRunning ? 'bg-blue-100 text-blue-700' :
                phase === 'done' ? 'bg-emerald-100 text-emerald-700' :
                phase === 'error' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-500'}`}>
              {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />}
              {PHASE_LABEL[phase]}
            </span>

            {(phase === 'idle' || phase === 'done' || phase === 'error') && (
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={phase === 'error' ? reset : run}
                  disabled={!canRun && phase !== 'error'}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {phase === 'error' ? '재시도' : '루프 실행'}
                </button>
                {nextRunTime && (
                  <p className="text-[10px] text-gray-400">
                    {nextRunTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}부터 가능
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 본문 */}
        <div className="px-6 py-4">

          {isRunning && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex items-center gap-2">
                {['감지', '분석', '제안'].map((step, i) => {
                  const active = (phase === 'detecting' && i === 0) || (phase === 'analyzing' && i === 1)
                  const done   = phase === 'analyzing' && i === 0
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                        ${done   ? 'bg-emerald-500 text-white' :
                          active ? 'bg-blue-600 text-white animate-pulse' :
                                   'bg-gray-100 text-gray-400'}`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span className={`text-xs font-medium ${active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {step}
                      </span>
                      {i < 2 && <span className="text-gray-200 text-xs">→</span>}
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-gray-400">
                {phase === 'detecting' ? '마감 임박 공고를 탐색하고 있어요...' : 'Claude가 공고를 분석하고 있어요...'}
              </p>
            </div>
          )}

          {phase === 'error' && (
            <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-red-50 text-red-600">
              <span className="text-xl">⚠️</span>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {phase === 'idle' && (
            <div className="flex items-center gap-4 py-4">
              <div className="text-3xl">🔍</div>
              <div>
                <p className="text-sm font-semibold text-gray-700">루프를 실행해보세요</p>
                <p className="text-xs text-gray-400 mt-0.5">마감 임박 공고를 자동 감지하고 AI가 액션을 제안해요</p>
              </div>
            </div>
          )}

          {phase === 'done' && suggestions.length === 0 && (
            <div className="flex items-center gap-4 py-4">
              <div className="text-3xl">✅</div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {urgentCount === 0 ? '마감 임박 공고가 없어요' : '모든 제안을 처리했어요'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {urgentCount === 0 ? '7일 이내 마감 공고가 없습니다' : '수고했어요 👏'}
                </p>
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                {suggestions.length}개 액션 제안
              </p>
              {suggestions.map((sg) => {
                const meta = ACTION_META[sg.action]
                const isLoading = actionLoading === sg.jobId
                return (
                  <div key={sg.jobId} className={`rounded-xl border p-4 ${meta.color}`}>
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-lg shrink-0 mt-0.5">{meta.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold truncate">{sg.company}</p>
                          <span className="flex items-center gap-1 text-xs font-medium opacity-70">
                            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[sg.priority]}`} />
                            D-{sg.dday}
                          </span>
                        </div>
                        <p className="text-xs opacity-80 mt-0.5">{sg.position}</p>
                        <p className="text-xs mt-1.5 font-medium">{sg.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(sg)}
                        disabled={isLoading}
                        className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-white/70 hover:bg-white transition-colors border border-current/20 disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {isLoading
                          ? <><span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> 처리 중...</>
                          : sg.action === 'cover_letter' ? '✍️ 자소서 작성하기'
                          : sg.action === 'calendar'     ? '📅 캘린더 등록하기'
                          : sg.action === 'status_change'? '🔄 지원예정으로 변경'
                          : '🚀 공고 열고 지원완료 처리'
                        }
                      </button>
                      <button
                        onClick={() => handleDismiss(sg)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 rounded-lg opacity-50 hover:opacity-80 transition-opacity"
                      >
                        무시
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {coverLetterJob && (
        <CoverLetterModal
          job={coverLetterJob}
          onClose={() => setCoverLetterJob(null)}
        />
      )}
    </>
  )
}
