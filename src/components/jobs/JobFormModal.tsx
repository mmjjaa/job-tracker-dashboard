import { useState } from 'react'
import { useJobStore } from '../../store/jobStore'
import { parseJobPosting } from '../../api/claude'
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
  const [rawUrl, setRawUrl] = useState('')
  const [rawText, setRawText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [parseSuccess, setParseSuccess] = useState(false)
  const [parseResult, setParseResult] = useState<{ company: string; position: string; techStack: string[]; deadline: string | null } | null>(null)

  const handleParse = async () => {
    if (!rawText.trim()) {
      setParseError('공고 텍스트를 붙여넣어 주세요')
      return
    }
    setIsParsing(true)
    setParseError('')
    setParseSuccess(false)
    setParseResult(null)
    try {
      const result = await parseJobPosting(rawUrl, rawText)
      setParseResult(result)
      setForm((prev) => ({
        ...prev,
        company: result.company || prev.company,
        position: result.position || prev.position,
        url: rawUrl || prev.url,
        techStack: result.techStack.length > 0 ? result.techStack.join(', ') : prev.techStack,
        deadline: result.deadline ?? prev.deadline,
      }))
      setParseSuccess(true)
    } catch (e) {
      setParseError(e instanceof Error ? e.message : '분석 실패')
    } finally {
      setIsParsing(false)
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
      <div className="bg-white rounded-xl w-[520px] max-h-[90vh] overflow-y-auto shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-800">{job ? '공고 수정' : '공고 추가'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* AI 파싱 섹션 (추가 모드에서만 표시) */}
        {!job && (
          <div className="px-6 pt-5 pb-4 bg-indigo-50 border-b border-indigo-100">
            <p className="text-xs font-semibold text-indigo-700 mb-3">✨ AI 자동 입력</p>
            <label className="block mb-2">
              <span className="text-xs font-medium text-gray-600">공고 URL (선택)</span>
              <input
                type="text"
                value={rawUrl}
                onChange={(e) => setRawUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              />
            </label>
            <label className="block mb-3">
              <span className="text-xs font-medium text-gray-600">공고 텍스트 붙여넣기 *</span>
              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value)
                  setParseSuccess(false)
                  setParseError('')
                }}
                placeholder="채용 공고 페이지에서 텍스트를 전체 선택(Ctrl+A) 후 복사해서 붙여넣으세요..."
                rows={4}
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
              />
            </label>
            {parseError && <p className="text-xs text-red-500 mb-2">{parseError}</p>}
            {parseSuccess && parseResult && (
              <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 text-xs space-y-1">
                <p className="font-semibold text-green-700 mb-2">✅ 분석 완료 — 아래 내용이 자동 입력됐습니다</p>
                <p><span className="text-gray-500">회사명</span> <span className="font-medium text-gray-800">{parseResult.company || '추출 실패'}</span></p>
                <p><span className="text-gray-500">포지션</span> <span className="font-medium text-gray-800">{parseResult.position || '추출 실패'}</span></p>
                <p><span className="text-gray-500">기술스택</span> <span className="font-medium text-gray-800">{parseResult.techStack.length > 0 ? parseResult.techStack.join(', ') : '없음'}</span></p>
                <p><span className="text-gray-500">마감일</span> <span className="font-medium text-gray-800">{parseResult.deadline || '없음'}</span></p>
              </div>
            )}
            <button
              type="button"
              onClick={handleParse}
              disabled={isParsing}
              className="w-full py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isParsing ? '분석 중...' : 'AI 분석하기'}
            </button>
          </div>
        )}

        {/* 수동 입력 폼 */}
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
              <span className="text-xs font-medium text-gray-600">기술스택 (쉼표 구분)</span>
              <input
                value={form.techStack}
                onChange={(e) => update('techStack', e.target.value)}
                placeholder="React, TypeScript..."
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
              />
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
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
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
