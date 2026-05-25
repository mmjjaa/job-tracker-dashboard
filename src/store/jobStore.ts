import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Job, JobStatus } from '../types'

interface JobStore {
  jobs: Job[]
  loading: boolean
  fetchJobs: () => Promise<void>
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => Promise<void>
  updateJob: (id: string, updates: Partial<Omit<Job, 'id' | 'createdAt'>>) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  updateStatus: (id: string, status: JobStatus) => Promise<void>
}

function toRow(job: Omit<Job, 'id' | 'createdAt'>, userId: string) {
  return {
    user_id: userId,
    company: job.company,
    position: job.position,
    url: job.url,
    tech_stack: job.techStack,
    deadline: job.deadline ?? null,
    memo: job.memo,
    status: job.status,
    cover_letter: job.coverLetter ?? null,
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
    memo: (row.memo as string) ?? '',
    status: row.status as JobStatus,
    coverLetter: row.cover_letter as Job['coverLetter'],
    createdAt: row.created_at as string,
  }
}

export const useJobStore = create<JobStore>()((set) => ({
  jobs: [],
  loading: false,

  fetchJobs: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      set({ jobs: data.map(fromRow) })
    }
    set({ loading: false })
  },

  addJob: async (job) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('jobs')
      .insert(toRow(job, user.id))
      .select()
      .single()
    if (!error && data) {
      set((s) => ({ jobs: [fromRow(data), ...s.jobs] }))
    }
  },

  updateJob: async (id, updates) => {
    const patch: Record<string, unknown> = {}
    if (updates.company !== undefined) patch.company = updates.company
    if (updates.position !== undefined) patch.position = updates.position
    if (updates.url !== undefined) patch.url = updates.url
    if (updates.techStack !== undefined) patch.tech_stack = updates.techStack
    if (updates.deadline !== undefined) patch.deadline = updates.deadline
    if (updates.memo !== undefined) patch.memo = updates.memo
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.coverLetter !== undefined) patch.cover_letter = updates.coverLetter

    const { data, error } = await supabase
      .from('jobs')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? fromRow(data) : j)) }))
    }
  },

  deleteJob: async (id) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (!error) {
      set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }))
    }
  },

  updateStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('jobs')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? fromRow(data) : j)) }))
    }
  },
}))
