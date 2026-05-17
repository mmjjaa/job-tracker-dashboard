import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Job, JobStatus } from '../types'

interface JobStore {
  jobs: Job[]
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => void
  updateJob: (id: string, updates: Partial<Omit<Job, 'id' | 'createdAt'>>) => void
  deleteJob: (id: string) => void
  updateStatus: (id: string, status: JobStatus) => void
}

export const useJobStore = create<JobStore>()(
  persist(
    (set) => ({
      jobs: [],
      addJob: (job) =>
        set((state) => ({
          jobs: [
            ...state.jobs,
            { ...job, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        })),
      deleteJob: (id) =>
        set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) })),
      updateStatus: (id, status) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, status } : j)),
        })),
    }),
    { name: 'job-tracker-storage' }
  )
)
