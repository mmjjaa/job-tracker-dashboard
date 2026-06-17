import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { useJobStore } from './store/jobStore'
import AuthPage from './components/auth/AuthPage'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import StatsSection from './components/dashboard/StatsSection'
import AgentLoopCard from './components/dashboard/AgentLoopCard'
import ChartSection from './components/dashboard/ChartSection'
import CalendarSection from './components/dashboard/CalendarSection'
import JobTable from './components/jobs/JobTable'
import KanbanBoard from './components/jobs/KanbanBoard'
import JobFormModal from './components/jobs/JobFormModal'
import JobSearchModal from './components/jobs/JobSearchModal'
import ProfileModal from './components/profile/ProfileModal'
import JobDetailModal from './components/jobs/JobDetailModal'
import BottomNav from './components/layout/BottomNav'
import MobileMoreSheet from './components/layout/MobileMoreSheet'
import { GoogleCalendarProvider } from './contexts/GoogleCalendarContext'
import type { Job } from './types'

type ViewMode = 'table' | 'kanban'
type PageType = 'dashboard' | 'calendar' | 'jobs'

function getInitialView(): ViewMode {
  return (localStorage.getItem('job-tracker-view') as ViewMode) ?? 'table'
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [view, setView] = useState<ViewMode>(getInitialView)
  const [page, setPage] = useState<PageType>('dashboard')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [starDetailJob, setStarDetailJob] = useState<Job | null>(null)
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false)
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

  const addJob = useJobStore((s) => s.addJob)

  const handleAdd = () => {
    setEditingJob(null)
    setIsModalOpen(true)
  }

  const handleSearchSelect = async (job: Omit<Job, 'id' | 'createdAt'>) => {
    await addJob(job)
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session && !isGuest) return <AuthPage onGuestStart={() => setIsGuest(true)} />

  return (
    <GoogleCalendarProvider>
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar
          onSignOut={isGuest ? () => setIsGuest(false) : handleSignOut}
          userEmail={isGuest ? '게스트 모드' : (session?.user.email ?? '')}
          isGuest={isGuest}
          page={page}
          onPageChange={setPage}
          onProfileOpen={() => setIsProfileOpen(true)}
          onJobDetail={(job) => setStarDetailJob(job)}
        />
        <div
          className="flex flex-col flex-1 min-w-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 100% 0%, rgba(99,102,241,0.13) 0%, rgba(59,130,246,0.07) 40%, transparent 70%)',
          }}
        >
          <Header
            onAddJob={handleAdd}
            onSearchJob={() => setIsSearchOpen(true)}
            view={view}
            onViewChange={handleViewChange}
            userEmail={isGuest ? '게스트' : (session?.user.email ?? '')}
            isGuest={isGuest}
            onSignOut={isGuest ? () => setIsGuest(false) : handleSignOut}
            page={page}
            onPageChange={setPage}
          />
          <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6 space-y-6">
            {page === 'dashboard' && (
              <>
                <StatsSection />
                <AgentLoopCard />
                <ChartSection />
              </>
            )}
            {page === 'calendar' && (
              <CalendarSection />
            )}
            {page === 'jobs' && (
              <>
                {view === 'table' ? (
                  <JobTable onEdit={handleEdit} />
                ) : (
                  <KanbanBoard onEdit={handleEdit} />
                )}
              </>
            )}
          </main>
        </div>

        {isModalOpen && <JobFormModal job={editingJob} onClose={handleClose} />}
        {isSearchOpen && (
          <JobSearchModal
            onClose={() => setIsSearchOpen(false)}
            onSelect={handleSearchSelect}
          />
        )}
        <BottomNav page={page} onPageChange={setPage} onMoreOpen={() => setIsMobileMoreOpen(true)} />
        {isMobileMoreOpen && (
          <MobileMoreSheet
            onClose={() => setIsMobileMoreOpen(false)}
            onProfileOpen={() => setIsProfileOpen(true)}
            onJobDetail={(job) => setStarDetailJob(job)}
            onSignOut={isGuest ? () => setIsGuest(false) : handleSignOut}
            isGuest={isGuest}
            userEmail={isGuest ? '게스트 모드' : (session?.user.email ?? '')}
          />
        )}
        {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}
        {starDetailJob && (
          <JobDetailModal
            job={starDetailJob}
            onClose={() => setStarDetailJob(null)}
            onEdit={(job) => { setStarDetailJob(null); handleEdit(job) }}
          />
        )}
      </div>
    </GoogleCalendarProvider>
  )
}
