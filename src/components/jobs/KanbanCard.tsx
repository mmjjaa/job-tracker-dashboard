import { Draggable } from '@hello-pangea/dnd'
import type { Job } from '../../types'
import { useJobStore } from '../../store/jobStore'

interface Props {
  job: Job
  index: number
  onEdit: (job: Job) => void
  onDetail: (job: Job) => void
}

const STATUS_BORDER: Record<string, string> = {
  '관심':    'border-l-sky-400',
  '지원예정': 'border-l-violet-400',
  '지원완료': 'border-l-emerald-400',
  '결과대기': 'border-l-amber-400',
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

export default function KanbanCard({ job, index, onEdit: _onEdit, onDetail }: Props) {
  const toggleStar = useJobStore((s) => s.toggleStar)
  const borderColor = STATUS_BORDER[job.status] ?? 'border-l-gray-300'

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onDetail(job)}
          className={`bg-white rounded-xl border-l-4 border border-gray-100 ${borderColor} p-3 cursor-pointer select-none space-y-2 transition-all duration-150 ${
            snapshot.isDragging
              ? 'shadow-xl rotate-1 border-blue-200'
              : 'hover:shadow-md hover:border-l-4'
          }`}
        >
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{job.company}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{job.position}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {job.deadline && (
                <span className={`text-xs ${getDdayColor(job.deadline)}`}>
                  {getDday(job.deadline)}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); toggleStar(job.id) }}
                className="text-base leading-none hover:scale-110 transition-transform"
                title={job.starred ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              >
                {job.starred ? <span className="text-yellow-400">★</span> : <span className="text-gray-300 hover:text-yellow-300">☆</span>}
              </button>
            </div>
          </div>

          {job.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.techStack.slice(0, 3).map((t) => (
                <span key={t} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
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
