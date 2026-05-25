import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { useJobStore } from './store/jobStore'
import AuthPage from './components/auth/AuthPage'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import StatsSection from './components/dashboard/StatsSection'
import ChartSection from './components/dashboard/ChartSection'
import JobTable from './components/jobs/JobTable'
import KanbanBoard from './components/jobs/KanbanBoard'
import JobFormModal from './components/jobs/JobFormModal'
import type { Job } from './types'

type ViewMode = 'table' | 'kanban'

function getInitialView(): ViewMode {
  return (localStorage.getItem('job-tracker-view') as ViewMode) ?? 'table'
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [view, setView] = useState<ViewMode>(getInitialView)
  const fetchJobs = useJobStore((s) => s.fetchJobs)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) fetchJobs()
  }, [session, fetchJobs])

  const handleAdd = () => {
    setEditingJob(null)
    setIsModalOpen(true)
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingJob(null)
  }

  const handleViewChange = (v: ViewMode) => {
    setView(v)
    localStorage.setItem('job-tracker-view', v)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session && !isGuest) return <AuthPage onGuestStart={() => setIsGuest(true)} />

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        onSignOut={isGuest ? () => setIsGuest(false) : handleSignOut}
        userEmail={isGuest ? '게스트 모드' : (session?.user.email ?? '')}
        isGuest={isGuest}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onAddJob={handleAdd} view={view} onViewChange={handleViewChange} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <StatsSection />
          <ChartSection />
          {view === 'table' ? (
            <JobTable onEdit={handleEdit} />
          ) : (
            <KanbanBoard onEdit={handleEdit} />
          )}
        </main>
      </div>
      {isModalOpen && <JobFormModal job={editingJob} onClose={handleClose} />}
    </div>
  )
}
