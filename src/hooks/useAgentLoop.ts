import { useState, useCallback } from 'react'
import { useJobStore } from '../store/jobStore'
import { analyzeUrgentJobs } from '../api/claude'

const LOOP_COOLDOWN_MS = 1000 * 60 * 5 // 5분 쿨다운

export type LoopPhase = 'idle' | 'detecting' | 'analyzing' | 'done' | 'error'

export function useAgentLoop() {
  const jobs = useJobStore((s) => s.jobs)
  const agentLastRun = useJobStore((s) => s.agentLastRun)
  const agentSuggestions = useJobStore((s) => s.agentSuggestions)
  const setAgentSuggestions = useJobStore((s) => s.setAgentSuggestions)

  const [phase, setPhase] = useState<LoopPhase>('idle')
  const [urgentCount, setUrgentCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const elapsed = agentLastRun ? Date.now() - new Date(agentLastRun).getTime() : Infinity
  const canRun = elapsed > LOOP_COOLDOWN_MS
  const nextRunTime = agentLastRun && !canRun
    ? new Date(new Date(agentLastRun).getTime() + LOOP_COOLDOWN_MS)
    : null

  const run = useCallback(async () => {
    if (phase === 'analyzing') return
    setError(null)

    // 1. 감지
    setPhase('detecting')
    const urgent = jobs.filter((j) => {
      if (!j.deadline) return false
      const diff = Math.ceil((new Date(j.deadline).getTime() - Date.now()) / 86400000)
      return diff >= 0 && diff <= 7
    })
    setUrgentCount(urgent.length)

    if (urgent.length === 0) {
      setAgentSuggestions([])
      setPhase('done')
      return
    }

    // 2. 분석
    setPhase('analyzing')
    try {
      const suggestions = await analyzeUrgentJobs(
        urgent.map((j) => ({
          id: j.id,
          company: j.company,
          position: j.position,
          status: j.status,
          deadline: j.deadline,
          coverLetter: j.coverLetter,
          calendarEventId: j.calendarEventId,
        }))
      )
      setAgentSuggestions(suggestions)
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : '분석 중 오류가 발생했어요')
      setPhase('error')
    }
  }, [jobs, phase, setAgentSuggestions])

  const reset = useCallback(() => {
    setPhase('idle')
    setError(null)
  }, [])

  return { phase, urgentCount, canRun, nextRunTime, suggestions: agentSuggestions, error, run, reset }
}
