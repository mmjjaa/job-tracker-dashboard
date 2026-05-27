import { useState } from 'react'
import { useJobStore } from '../../store/jobStore'
import type { Job, JobStatus } from '../../types'
import CoverLetterModal from './CoverLetterModal'
import JobDetailModal from './JobDetailModal'

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
  const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null)
  const [detailJob, setDetailJob] = useState<Job | null>(null)

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase()
    const matchSearch = j.company.toLowerCase().includes(q) || j.position.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || j.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* 검색/필터 */}
      <div className="flex items-center gap-2 p-3 md:p-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="회사명 또는 포지션 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 min-w-0"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
          className="text-sm border border-gray-200 rounded-lg px-2 md:px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 shrink-0"
        >
          <option value="all">전체</option>
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-gray-500 text-sm font-medium">
          {jobs.length === 0 ? '공고를 추가해 보세요' : '검색 결과가 없습니다'}
        </p>
      ) : (
        <>
          {/* 모바일 카드 뷰 */}
          <ul className="md:hidden divide-y divide-gray-100">
            {filtered.map((job) => (
              <li key={job.id} className="p-4 space-y-3">
                {/* 상단: 회사명 + D-Day */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {job.url ? (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-900 hover:text-indigo-600 hover:underline underline-offset-2"
                      >
                        {job.company}
                      </a>
                    ) : (
                      <span className="font-semibold text-gray-900">{job.company}</span>
                    )}
                    <p className="text-sm text-gray-500 mt-0.5">{job.position}</p>
                  </div>
                  <span className={`text-sm shrink-0 ${getDdayColor(job.deadline)}`}>
                    {getDday(job.deadline)}
                  </span>
                </div>

                {/* 기술스택 */}
                {job.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                    {job.techStack.length > 4 && (
                      <span className="text-xs text-gray-400">+{job.techStack.length - 4}</span>
                    )}
                  </div>
                )}

                {/* 메모 */}
                {job.memo && (
                  <p className="text-xs text-gray-500 line-clamp-2">{job.memo}</p>
                )}

                {/* 하단: 상태 + 액션 */}
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={job.status}
                    onChange={(e) => updateStatus(job.id, e.target.value as JobStatus)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {JOB_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCoverLetterJob(job)}
                      className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${
                        job.coverLetter
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      {job.coverLetter ? '자소서 수정' : '자소서 초안 작성'}
                    </button>
                    <button
                      onClick={() => onEdit(job)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteId(job.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* 데스크탑 테이블 뷰 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-600">
                  <th className="text-left px-4 py-3 font-medium w-28">회사명</th>
                  <th className="text-left px-4 py-3 font-medium w-32">포지션</th>
                  <th className="text-left px-4 py-3 font-medium">기술스택</th>
                  <th className="text-left px-4 py-3 font-medium w-24">상태</th>
                  <th className="text-left px-4 py-3 font-medium w-16">D-Day</th>
                  <th className="text-left px-4 py-3 font-medium">메모</th>
                  <th className="text-left px-4 py-3 font-medium w-16">액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <tr key={job.id} onClick={() => setDetailJob(job)} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
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
                    <td className="px-4 py-3 text-gray-700 w-32">
                      <span className="line-clamp-1">{job.position}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {job.techStack.length > 0
                          ? job.techStack.slice(0, 3).map((t) => (
                              <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                {t}
                              </span>
                            ))
                          : <span className="text-gray-400 text-xs">-</span>
                        }
                        {job.techStack.length > 3 && (
                          <span className="text-xs text-gray-400">+{job.techStack.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                      {job.memo || '-'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCoverLetterJob(job)}
                          className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                            job.coverLetter
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        >
                          {job.coverLetter ? '자소서 수정' : '자소서 초안 작성'}
                        </button>
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
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {detailJob && (
        <JobDetailModal
          job={detailJob}
          onClose={() => setDetailJob(null)}
          onEdit={(job) => { setDetailJob(null); onEdit(job) }}
        />
      )}

      {coverLetterJob && (
        <CoverLetterModal
          job={coverLetterJob}
          onClose={() => setCoverLetterJob(null)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
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
                onClick={() => { deleteJob(deleteId); setDeleteId(null) }}
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
