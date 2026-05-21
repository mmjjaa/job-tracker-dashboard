import { useState } from 'react'
import { generateCoverLetter } from '../../api/claude'
import type { CoverLetter } from '../../api/claude'
import { useJobStore } from '../../store/jobStore'
import type { Job } from '../../types'

interface CoverLetterModalProps {
  job: Job
  onClose: () => void
}

const SECTIONS: { key: keyof CoverLetter; label: string }[] = [
  { key: 'motivation', label: '지원동기' },
  { key: 'competency', label: '직무역량' },
  { key: 'aspiration', label: '입사 후 포부' },
]

export default function CoverLetterModal({ job, onClose }: CoverLetterModalProps) {
  const { updateJob } = useJobStore()
  const [userExperience, setUserExperience] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CoverLetter | null>(
    job.coverLetter ?? null
  )
  const [copied, setCopied] = useState<keyof CoverLetter | null>(null)
  const [saved, setSaved] = useState(!!job.coverLetter)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError('')
    setSaved(false)
    try {
      const letter = await generateCoverLetter(
        job.company,
        job.position,
        job.techStack,
        job.memo,
        userExperience,
      )
      setResult(letter)
    } catch (e) {
      setError(e instanceof Error ? e.message : '생성 실패')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    if (!result) return
    updateJob(job.id, { coverLetter: result })
    setSaved(true)
  }

  const handleCopy = (key: keyof CoverLetter) => {
    if (!result) return
    navigator.clipboard.writeText(result[key])
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const handleCopyAll = () => {
    if (!result) return
    const text = SECTIONS.map(({ key, label }) => `[${label}]\n${result[key]}`).join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied('motivation')
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl md:rounded-xl w-full md:w-[600px] max-h-[92dvh] md:max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-semibold text-gray-800">자소서 초안 생성</h3>
            <p className="text-xs text-gray-500 mt-0.5">{job.company} · {job.position}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              강조할 경험 / 추가 정보 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <textarea
              value={userExperience}
              onChange={(e) => setUserExperience(e.target.value)}
              placeholder="예: React 프로젝트 2년, 팀 리더 경험, 관련 수상 이력 등"
              rows={3}
              disabled={isGenerating}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 resize-none disabled:bg-gray-50"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? '초안 생성 중...' : result ? '다시 생성' : '✍️ 자소서 초안 생성'}
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {result && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">생성된 초안</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyAll}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {copied === 'motivation' ? '✅ 복사됨' : '전체 복사'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saved}
                    className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-lg hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors font-medium"
                  >
                    {saved ? '✅ 저장됨' : '저장'}
                  </button>
                </div>
              </div>
              {SECTIONS.map(({ key, label }) => (
                <div key={key} className="border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-700">[{label}]</span>
                    <button
                      onClick={() => handleCopy(key)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copied === key ? '✅ 복사됨' : '복사'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result[key]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
