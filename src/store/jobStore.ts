import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { Job, JobStatus } from '../types'
import type { AgentSuggestion } from '../api/claude'

export interface UserProfile {
  techStack: string[]
  career: string
  education: string
  employmentType: string[]
  salary: string
  location: string
  introduction: string
}

const DEFAULT_PROFILE: UserProfile = {
  techStack: [],
  career: '',
  education: '',
  employmentType: [],
  salary: '',
  location: '',
  introduction: '',
}

export interface AgentLogEntry {
  id: string
  jobId: string
  action: AgentSuggestion['action']
  result: 'accepted' | 'dismissed'
  timestamp: string
}

interface JobStore {
  jobs: Job[]
  loading: boolean
  keywords: string[]
  profile: UserProfile
  agentSuggestions: AgentSuggestion[]
  agentLastRun: string | null
  agentLog: AgentLogEntry[]
  fetchJobs: () => Promise<void>
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => Promise<void>
  updateJob: (id: string, updates: Partial<Omit<Job, 'id' | 'createdAt'>>) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  updateStatus: (id: string, status: JobStatus) => Promise<void>
  addKeyword: (kw: string) => void
  removeKeyword: (kw: string) => void
  updateProfile: (p: UserProfile) => void
  toggleStar: (id: string) => void
  setAgentSuggestions: (suggestions: AgentSuggestion[]) => void
  dismissSuggestion: (jobId: string) => void
  logAgentAction: (entry: Omit<AgentLogEntry, 'id' | 'timestamp'>) => void
}

function toRow(job: Omit<Job, 'id' | 'createdAt'>, userId: string) {
  return {
    user_id: userId,
    company: job.company,
    position: job.position,
    url: job.url,
    tech_stack: job.techStack,
    deadline: job.deadline ?? null,
    address: job.address ?? '',
    memo: job.memo,
    status: job.status,
    cover_letter: job.coverLetter ?? null,
    duties: job.duties ?? '',
    employment_type: job.employmentType ?? '',
    career: job.career ?? '',
    wage: job.wage ?? '',
  }
}

function fromRow(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    company: row.company as string,
    position: row.position as string,
    url: (row.url as string) ?? '',
    techStack: (row.tech_stack as string[]) ?? [],
    deadline: (row.deadline as string) ?? null,
    address: (row.address as string) ?? '',
    memo: (row.memo as string) ?? '',
    status: row.status as JobStatus,
    coverLetter: row.cover_letter as Job['coverLetter'],
    createdAt: row.created_at as string,
    duties: (row.duties as string) ?? '',
    employmentType: (row.employment_type as string) ?? '',
    career: (row.career as string) ?? '',
    wage: (row.wage as string) ?? '',
  }
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      jobs: [],
      loading: false,
      keywords: [],
      profile: DEFAULT_PROFILE,
      agentSuggestions: [],
      agentLastRun: null,
      agentLog: [],

      fetchJobs: async () => {
        const user = await getUser()
        if (!user) return
        set({ loading: true })
        const prevJobs = get().jobs
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && data) {
          const prevMap = new Map(prevJobs.map((j) => [j.id, j]))
          set({
            jobs: data.map((row) => ({
              ...fromRow(row),
              calendarEventId: prevMap.get(row.id as string)?.calendarEventId,
              starred: prevMap.get(row.id as string)?.starred,
            })),
          })
        }
        set({ loading: false })
      },

      addJob: async (job) => {
        const user = await getUser()
        if (!user) {
          // 게스트: localStorage에만 저장
          set((s) => ({
            jobs: [
              { ...job, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
              ...s.jobs,
            ],
          }))
          return
        }
        const { data, error } = await supabase
          .from('jobs')
          .insert(toRow(job, user.id))
          .select()
          .single()
        if (error) throw new Error(error.message)
        if (data) set((s) => ({ jobs: [fromRow(data), ...s.jobs] }))
      },

      updateJob: async (id, updates) => {
        const user = await getUser()
        if (!user) {
          set((s) => ({
            jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
          }))
          return
        }

        // calendarEventId는 로컬 전용 — Supabase 비저장, 즉시 적용
        if ('calendarEventId' in updates) {
          set((s) => ({
            jobs: s.jobs.map((j) =>
              j.id === id ? { ...j, calendarEventId: updates.calendarEventId } : j
            ),
          }))
        }

        const patch: Record<string, unknown> = {}
        if (updates.company !== undefined) patch.company = updates.company
        if (updates.position !== undefined) patch.position = updates.position
        if (updates.url !== undefined) patch.url = updates.url
        if (updates.techStack !== undefined) patch.tech_stack = updates.techStack
        if (updates.deadline !== undefined) patch.deadline = updates.deadline
        if (updates.address !== undefined) patch.address = updates.address
        if (updates.memo !== undefined) patch.memo = updates.memo
        if (updates.status !== undefined) patch.status = updates.status
        if (updates.coverLetter !== undefined) patch.cover_letter = updates.coverLetter
        if (updates.duties !== undefined) patch.duties = updates.duties
        if (updates.employmentType !== undefined) patch.employment_type = updates.employmentType
        if (updates.career !== undefined) patch.career = updates.career
        if (updates.wage !== undefined) patch.wage = updates.wage

        if (Object.keys(patch).length === 0) return

        const { data, error } = await supabase
          .from('jobs').update(patch).eq('id', id).select().single()
        if (error) throw new Error(error.message)
        if (data) {
          const prev = get().jobs.find((j) => j.id === id)
          set((s) => ({
            jobs: s.jobs.map((j) =>
              j.id === id
                ? { ...fromRow(data), calendarEventId: prev?.calendarEventId, starred: prev?.starred }
                : j
            ),
          }))
        }
      },

      deleteJob: async (id) => {
        const user = await getUser()
        if (!user) {
          set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }))
          return
        }
        const { error } = await supabase.from('jobs').delete().eq('id', id)
        if (!error) set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }))
      },

      updateStatus: async (id, status) => {
        const user = await getUser()
        if (!user) {
          set((s) => ({
            jobs: s.jobs.map((j) => (j.id === id ? { ...j, status } : j)),
          }))
          return
        }
        const { data, error } = await supabase
          .from('jobs').update({ status }).eq('id', id).select().single()
        if (!error && data)
          set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? fromRow(data) : j)) }))
      },

      addKeyword: (kw) => {
        const trimmed = kw.trim()
        if (!trimmed) return
        set((s) => ({
          keywords: s.keywords.includes(trimmed) ? s.keywords : [...s.keywords, trimmed],
        }))
      },

      removeKeyword: (kw) => {
        set((s) => ({ keywords: s.keywords.filter((k) => k !== kw) }))
      },

      updateProfile: (p) => set({ profile: p }),

      toggleStar: (id) =>
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === id ? { ...j, starred: !j.starred } : j)),
        })),

      setAgentSuggestions: (suggestions) =>
        set({ agentSuggestions: suggestions, agentLastRun: new Date().toISOString() }),

      dismissSuggestion: (jobId) =>
        set((s) => ({
          agentSuggestions: s.agentSuggestions.filter((sg) => sg.jobId !== jobId),
        })),

      logAgentAction: (entry) =>
        set((s) => ({
          agentLog: [
            { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
            ...s.agentLog.slice(0, 49),
          ],
        })),

      // persist 미들웨어가 사용하지만 직접 호출은 안 함
      _get: get,
    }),
    { name: 'job-tracker-guest-storage' }
  )
)
