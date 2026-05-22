import { Draggable } from '@hello-pangea/dnd'
import type { Job } from '../../types'

interface Props {
  job: Job
  index: number
  onEdit: (job: Job) => void
}

function getDday(deadline: string | null): string {
  if (!deadline) return ''
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diff < 0) return '마감'
  if (diff === 0) return 'D-Day'
  return `D-${diff}`
}

function getDdayColor(deadline: string | null): string {
  if (!deadline) return ''
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diff < 0) return 'text-gray-400'
  if (diff <= 3) return 'text-red-500 font-semibold'
  if (diff <= 7) return 'text-orange-500 font-semibold'
  return 'text-gray-500'
}

export default function KanbanCard({ job, index, onEdit }: Props) {
  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(job)}
          className={`bg-white rounded-lg border p-3 cursor-pointer select-none space-y-2 transition-shadow ${
            snapshot.isDragging
              ? 'shadow-lg border-indigo-300 rotate-1'
              : 'border-gray-200 hover:border-indigo-200 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{job.company}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{job.position}</p>
            </div>
            {job.deadline && (
              <span className={`text-xs shrink-0 ${getDdayColor(job.deadline)}`}>
                {getDday(job.deadline)}
              </span>
            )}
          </div>

          {job.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.techStack.slice(0, 3).map((t) => (
                <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
              {job.techStack.length > 3 && (
                <span className="text-xs text-gray-400">+{job.techStack.length - 3}</span>
              )}
            </div>
          )}

          {job.coverLetter && (
            <span className="inline-block text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
              ✍️ 자소서
            </span>
          )}
        </div>
      )}
    </Draggable>
  )
}
