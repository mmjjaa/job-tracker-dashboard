import { useState } from 'react'
import { useJobStore } from '../../store/jobStore'
import { suggestTechStack } from '../../api/claude'
import type { Job, JobStatus } from '../../types'

const JOB_STATUSES: JobStatus[] = ['관심', '지원예정', '지원완료', '결과대기']

interface JobFormModalProps {
  job: Job | null
  onClose: () => void
}

export default function JobFormModal({ job, onClose }: JobFormModalProps) {
  const { addJob, updateJob } = useJobStore()
  const [form, setForm] = useState({
    company: job?.company ?? '',
    position: job?.position ?? '',
    url: job?.url ?? '',
    techStack: job?.techStack.join(', ') ?? '',
    deadline: job?.deadline ?? '',
    memo: job?.memo ?? '',
    status: (job?.status ?? '관심') as JobStatus,
  })
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [suggestError, setSuggestError] = useState('')

  const handleSuggest = async () => {
    if (!form.company.trim() || !form.position.trim()) {
      setSuggestError('회사명과 포지션을 먼저 입력해주세요')
      return
    }
    setIsSuggesting(true)
    setSuggestError('')
    try {
      const stack = await suggestTechStack(form.company, form.position)
      setForm((prev) => ({ ...prev, techStack: stack.join(', ') }))
    } catch (e) {
      setSuggestError(e instanceof Error ? e.message : '추천 실패')
    } finally {
      setIsSuggesting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      company: form.company.trim(),
      position: form.position.trim(),
      url: form.url.trim(),
      techStack: form.techStack.split(',').map((s) => s.trim()).filter(Boolean),
      deadline: form.deadline || null,
      memo: form.memo.trim(),
      status: form.status,
    }
    if (job) {
      updateJob(job.id, data)
    } else {
      addJob(data)
    }
    onClose()
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[480px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-800">{job ? '공고 수정' : '공고 추가'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-600">회사명 *</span>
              <input
                required
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600">포지션 *</span>
              <input
                required
                value={form.position}
                onChange={(e) => update('position', e.target.value)}
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-gray-600">공고 URL</span>
            <input
              value={form.url}
              onChange={(e) => update('url', e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">기술스택 (쉼표 구분)</span>
                <button
                  type="button"
                  onClick={handleSuggest}
                  disabled={isSuggesting}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                >
                  {isSuggesting ? '추천 중...' : '✨ AI 추천'}
                </button>
              </div>
              <input
                value={form.techStack}
                onChange={(e) => update('techStack', e.target.value)}
                placeholder="React, TypeScript..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {suggestError && <p className="text-xs text-red-500 mt-1">{suggestError}</p>}
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600">마감일</span>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => update('deadline', e.target.value)}
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-gray-600">지원 상태</span>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-gray-600">메모</span>
            <textarea
              value={form.memo}
              onChange={(e) => update('memo', e.target.value)}
              rows={3}
              className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </label>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              {job ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
