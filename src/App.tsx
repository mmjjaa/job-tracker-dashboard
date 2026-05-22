import { useState } from 'react'
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [view, setView] = useState<ViewMode>(getInitialView)

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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
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
