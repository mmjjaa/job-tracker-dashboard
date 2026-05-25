import { useState, useEffect } from 'react'
import { fetchSeoulJobs, parseDeadline, type SeoulJob } from '../../api/seoulJobs'
import type { Job } from '../../types'

interface Props {
  onClose: () => void
  onSelect: (job: Omit<Job, 'id' | 'createdAt'>) => void
}

const PAGE_SIZE = 100

export default function JobSearchModal({ onClose, onSelect }: Props) {
  const [jobs, setJobs] = useState<SeoulJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setLoading(true)
    fetchSeoulJobs(1, PAGE_SIZE)
      .then(({ jobs }) => setJobs(jobs))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = keyword.trim()
    ? jobs.filter((j) => {
        const q = keyword.toLowerCase()
        return (
          j.CMPNY_NM.toLowerCase().includes(q) ||
          j.JO_SJ.toLowerCase().includes(q) ||
          j.JOBCODE_NM.toLowerCase().includes(q)
        )
      })
    : jobs

  const handleAdd = (job: SeoulJob) => {
    const mapped: Omit<Job, 'id' | 'createdAt'> = {
      company: job.CMPNY_NM,
      position: job.JO_SJ || job.JOBCODE_NM,
      url: '',
      techStack: [],
      deadline: parseDeadline(job.RCEPT_CLOS_NM),
      memo: job.GUI_LN || '',
      status: '관심',
    }
    onSelect(mapped)
    setAddedIds((prev) => new Set(prev).add(job.JO_REQST_NO))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">서울시 채용공고 검색</h2>
            <p className="text-xs text-gray-500 mt-0.5">서울 열린데이터광장 제공</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* 검색창 */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="회사명, 공고제목, 직종으로 검색..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-300"
            autoFocus
          />
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-sm text-gray-500">공고 불러오는 중...</span>
            </div>
          )}
          {error && (
            <p className="text-center py-16 text-sm text-red-500">{error}</p>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-center py-16 text-sm text-gray-500 font-medium">검색 결과가 없습니다</p>
          )}
          {!loading && !error && filtered.map((job) => {
            const added = addedIds.has(job.JO_REQST_NO)
            return (
              <div
                key={job.JO_REQST_NO}
                className="flex items-start gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{job.CMPNY_NM}</p>
                  <p className="text-sm text-gray-700 mt-0.5 truncate">{job.JO_SJ || job.JOBCODE_NM}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                    {job.WORK_PARAR_BASS_ADRES_CN && (
                      <span className="text-xs text-gray-500">📍 {job.WORK_PARAR_BASS_ADRES_CN}</span>
                    )}
                    {job.HOPE_WAGE && (
                      <span className="text-xs text-gray-500">💰 {job.HOPE_WAGE.trim()}</span>
                    )}
                    {job.CAREER_CND_NM && (
                      <span className="text-xs text-gray-500">🧑‍💼 {job.CAREER_CND_NM}</span>
                    )}
                    {job.RCEPT_CLOS_NM && (
                      <span className="text-xs text-gray-500">📅 {job.RCEPT_CLOS_NM.replace('마감일 ', '')}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAdd(job)}
                  disabled={added}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    added
                      ? 'bg-emerald-50 text-emerald-600 cursor-default'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {added ? '추가됨 ✓' : '+ 추가'}
                </button>
              </div>
            )
          })}
        </div>

        {/* 하단 */}
        {!loading && !error && (
          <div className="px-5 py-3 border-t border-gray-100 shrink-0">
            <p className="text-xs text-gray-400">
              {filtered.length}건 표시 중
              {keyword && ` (전체 ${jobs.length}건 중 필터됨)`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
