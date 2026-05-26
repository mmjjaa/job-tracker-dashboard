import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { useJobStore } from '../../store/jobStore'
import type { Job } from '../../types'

type CalendarValue = Date | null

const STATUS_COLOR: Record<string, string> = {
  '관심': 'bg-blue-400',
  '지원예정': 'bg-purple-400',
  '지원완료': 'bg-green-400',
  '결과대기': 'bg-yellow-400',
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('sv-SE') // YYYY-MM-DD
}

export default function CalendarSection() {
  const jobs = useJobStore((s) => s.jobs)
  const [selected, setSelected] = useState<CalendarValue>(null)

  const deadlineMap = jobs.reduce<Record<string, Job[]>>((acc, job) => {
    if (job.deadline) {
      acc[job.deadline] = [...(acc[job.deadline] ?? []), job]
    }
    return acc
  }, {})

  const selectedJobs = selected ? (deadlineMap[formatDate(selected)] ?? []) : []

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">📅 마감일 달력</p>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0 job-calendar">
          <Calendar
            onChange={(v) => setSelected(v as CalendarValue)}
            value={selected}
            locale="ko-KR"
            tileContent={({ date, view }) => {
              if (view !== 'month') return null
              const count = deadlineMap[formatDate(date)]?.length
              if (!count) return null
              return (
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 block" />
                  ))}
                </div>
              )
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          {selected ? (
            selectedJobs.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-3">
                  {selected.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 마감 공고
                </p>
                <ul className="space-y-2">
                  {selectedJobs.map((job) => (
                    <li key={job.id} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLOR[job.status] ?? 'bg-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-800 shrink-0">{job.company}</span>
                      <span className="text-sm text-gray-500 truncate">{job.position}</span>
                      <span className="text-xs text-gray-400 shrink-0 ml-auto">{job.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500">이 날짜에 마감되는 공고가 없습니다</p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">날짜를 클릭하세요</p>
                <p className="text-xs text-gray-400 mt-1">● 표시된 날짜에 마감 공고가 있습니다</p>
                {Object.keys(deadlineMap).length > 0 && (
                  <p className="text-xs text-indigo-500 mt-2 font-medium">
                    마감 예정 공고 {Object.values(deadlineMap).flat().length}건
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
