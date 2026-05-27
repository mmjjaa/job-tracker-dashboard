import { useState } from 'react'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { useJobStore } from '../../store/jobStore'
import type { Job, JobStatus } from '../../types'
import KanbanCard from './KanbanCard'
import JobDetailModal from './JobDetailModal'

const COLUMNS: { status: JobStatus; label: string; color: string; bg: string }[] = [
  { status: '관심',    label: '관심',    color: 'text-blue-700',   bg: 'bg-blue-50' },
  { status: '지원예정', label: '지원예정', color: 'text-purple-700', bg: 'bg-purple-50' },
  { status: '지원완료', label: '지원완료', color: 'text-green-700',  bg: 'bg-green-50' },
  { status: '결과대기', label: '결과대기', color: 'text-yellow-700', bg: 'bg-yellow-50' },
]

interface Props {
  onEdit: (job: Job) => void
}

export default function KanbanBoard({ onEdit }: Props) {
  const { jobs, updateStatus } = useJobStore()
  const [detailJob, setDetailJob] = useState<Job | null>(null)

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const destStatus = result.destination.droppableId as JobStatus
    const srcStatus = result.source.droppableId as JobStatus
    if (destStatus === srcStatus && result.destination.index === result.source.index) return
    updateStatus(result.draggableId, destStatus)
  }

  return (
    <>
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(({ status, label, color, bg }) => {
          const columnJobs = jobs.filter((j) => j.status === status)
          return (
            <div key={status} className="flex flex-col min-h-[400px]">
              <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl ${bg}`}>
                <span className={`text-sm font-semibold ${color}`}>{label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${color} border border-current border-opacity-20`}>
                  {columnJobs.length}
                </span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-b-xl p-2 space-y-2 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-indigo-50' : 'bg-gray-100'
                    }`}
                  >
                    {columnJobs.map((job, index) => (
                      <KanbanCard key={job.id} job={job} index={index} onEdit={onEdit} onDetail={setDetailJob} />
                    ))}
                    {provided.placeholder}
                    {columnJobs.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-center text-xs text-gray-400 pt-6">공고 없음</p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>

    {detailJob && (
      <JobDetailModal
        job={detailJob}
        onClose={() => setDetailJob(null)}
        onEdit={(job) => { setDetailJob(null); onEdit(job) }}
      />
    )}
    </>
  )
}
