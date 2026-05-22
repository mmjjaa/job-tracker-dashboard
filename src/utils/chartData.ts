import type { Job, JobStatus } from '../types'

export interface WeeklyData {
  week: string
  count: number
}

export interface StatusData {
  name: JobStatus
  value: number
  color: string
}

export interface TechData {
  tech: string
  count: number
}

const STATUS_COLORS: Record<JobStatus, string> = {
  관심: '#3B82F6',
  지원예정: '#8B5CF6',
  지원완료: '#10B981',
  결과대기: '#F59E0B',
}

export function getWeeklyData(jobs: Job[]): WeeklyData[] {
  const now = new Date()
  const weeks: WeeklyData[] = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (4 - i) * 7)
    return {
      week: `${d.getMonth() + 1}/${d.getDate()}`,
      count: 0,
    }
  })

  jobs.forEach((job) => {
    const created = new Date(job.createdAt)
    const diffDays = Math.floor((now.getTime() - created.getTime()) / 86400000)
    const weekIndex = 4 - Math.floor(diffDays / 7)
    if (weekIndex >= 0 && weekIndex <= 4) {
      weeks[weekIndex].count++
    }
  })

  return weeks
}

export function getStatusData(jobs: Job[]): StatusData[] {
  const counts: Record<JobStatus, number> = {
    관심: 0,
    지원예정: 0,
    지원완료: 0,
    결과대기: 0,
  }
  jobs.forEach((j) => counts[j.status]++)

  return (Object.keys(counts) as JobStatus[])
    .filter((s) => counts[s] > 0)
    .map((s) => ({ name: s, value: counts[s], color: STATUS_COLORS[s] }))
}

export function getTechData(jobs: Job[]): TechData[] {
  const counts: Record<string, number> = {}
  jobs.forEach((job) =>
    job.techStack.forEach((t) => {
      counts[t] = (counts[t] ?? 0) + 1
    })
  )
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tech, count]) => ({ tech, count }))
}
