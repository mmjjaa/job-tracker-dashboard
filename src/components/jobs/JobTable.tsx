import { useState } from 'react'
import { useJobStore } from '../../store/jobStore'
import type { Job, JobStatus } from '../../types'

const JOB_STATUSES: JobStatus[] = ['관심', '지원예정', '지원완료', '결과대기']

function getDday(deadline: string | null): string {
  if (!deadline) return '-'
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diff < 0) return '마감'
  if (diff === 0) return 'D-Day'
  return `D-${diff}`
}

function getDdayColor(deadline: string | null): string {
  if (!deadline) return 'text-gray-400'
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diff < 0) return 'text-gray-400'
  if (diff <= 3) return 'text-red-600 font-semibold'
  if (diff <= 7) return 'text-orange-500 font-semibold'
  return 'text-gray-600'
}

interface JobTableProps {
  onEdit: (job: Job) => void
}

export default function JobTable({ onEdit }: JobTableProps) {
  const { jobs, deleteJob, updateStatus } = useJobStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase()
    const matchSearch = j.company.toLowerCase().includes(q) || j.position.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || j.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="회사명 또는 포지션 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">전체 상태</option>
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500">
            <th className="text-left px-4 py-3 font-medium">회사명</th>
            <th className="text-left px-4 py-3 font-medium">포지션</th>
            <th className="text-left px-4 py-3 font-medium">상태</th>
            <th className="text-left px-4 py-3 font-medium">D-Day</th>
            <th className="text-left px-4 py-3 font-medium">메모</th>
            <th className="text-left px-4 py-3 font-medium">액션</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-gray-400">
                {jobs.length === 0 ? '공고를 추가해 보세요' : '검색 결과가 없습니다'}
              </td>
            </tr>
          ) : (
            filtered.map((job) => (
              <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 underline-offset-2 hover:underline"
                    >
                      {job.company}
                    </a>
                  ) : (
                    job.company
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">{job.position}</td>
                <td className="px-4 py-3">
                  <select
                    value={job.status}
                    onChange={(e) => updateStatus(job.id, e.target.value as JobStatus)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                  >
                    {JOB_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className={`px-4 py-3 ${getDdayColor(job.deadline)}`}>
                  {getDday(job.deadline)}
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">
                  {job.memo || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(job)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors text-base"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteId(job.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-base"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
            <p className="text-gray-800 font-medium">정말 삭제하시겠습니까?</p>
            <p className="text-gray-500 text-sm mt-1">삭제 후 복구할 수 없습니다.</p>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  deleteJob(deleteId)
                  setDeleteId(null)
                }}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
