import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import StatsSection from './components/dashboard/StatsSection'
import JobTable from './components/jobs/JobTable'
import JobFormModal from './components/jobs/JobFormModal'
import type { Job } from './types'

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onAddJob={handleAdd} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <StatsSection />
          <JobTable onEdit={handleEdit} />
        </main>
      </div>
      {isModalOpen && <JobFormModal job={editingJob} onClose={handleClose} />}
    </div>
  )
}
