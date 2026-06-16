import { useState, useRef } from 'react'
import { useJobStore, type UserProfile } from '../../store/jobStore'

interface Props {
  onClose: () => void
}

const EMPLOYMENT_OPTIONS = ['정규직', '계약직', '인턴', '프리랜서', '아르바이트']
const CAREER_OPTIONS = ['신입', '1년', '2년', '3년', '4년', '5년 이상']
const EDUCATION_OPTIONS = ['고졸', '전문대졸', '대졸', '대학원졸']

export default function ProfileModal({ onClose }: Props) {
  const { profile, updateProfile } = useJobStore()
  const [form, setForm] = useState<UserProfile>({ ...profile })
  const [techInput, setTechInput] = useState('')
  const techRef = useRef<HTMLInputElement>(null)

  const addTech = () => {
    const t = techInput.trim()
    if (t && !form.techStack.includes(t)) {
      setForm((f) => ({ ...f, techStack: [...f.techStack, t] }))
    }
    setTechInput('')
    techRef.current?.focus()
  }

  const removeTech = (t: string) => {
    setForm((f) => ({ ...f, techStack: f.techStack.filter((s) => s !== t) }))
  }

  const toggleEmployment = (v: string) => {
    setForm((f) => ({
      ...f,
      employmentType: f.employmentType.includes(v)
        ? f.employmentType.filter((e) => e !== v)
        : [...f.employmentType, v],
    }))
  }

  const handleSave = () => {
    updateProfile(form)
    onClose()
  }

  const isEmpty = !form.techStack.length && !form.career && !form.education &&
    !form.employmentType.length && !form.salary && !form.location && !form.introduction

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">내 프로필</h2>
            <p className="text-xs text-gray-400 mt-0.5">등록하면 AI가 공고와 매칭 분석을 해드려요</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* 폼 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* 기술스택 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">🛠 기술스택</label>
            <div className="flex gap-2 mb-2">
              <input
                ref={techRef}
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }}
                placeholder="React, Python... 입력 후 Enter"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button
                onClick={addTech}
                className="text-sm bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.techStack.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {t}
                  <button onClick={() => removeTech(t)} className="text-primary-400 hover:text-primary-700">✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* 경력 + 학력 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">📈 경력</label>
              <select
                value={form.career}
                onChange={(e) => setForm((f) => ({ ...f, career: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="">선택</option>
                {CAREER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">🎓 학력</label>
              <select
                value={form.education}
                onChange={(e) => setForm((f) => ({ ...f, education: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="">선택</option>
                {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* 희망 고용형태 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">💼 희망 고용형태 (복수 선택)</label>
            <div className="flex flex-wrap gap-2">
              {EMPLOYMENT_OPTIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => toggleEmployment(o)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    form.employmentType.includes(o)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* 희망 연봉 + 근무지역 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">💰 희망 연봉</label>
              <input
                type="text"
                value={form.salary}
                onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
                placeholder="예: 3000만원"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">📍 희망 근무지역</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="예: 서울 강남, 판교"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>

          {/* 자기소개 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">📝 자기소개 (자유)</label>
            <textarea
              value={form.introduction}
              onChange={(e) => setForm((f) => ({ ...f, introduction: e.target.value }))}
              placeholder="예: 프론트엔드 2년차, UI/UX에 관심 많음. 백엔드보다 프론트 선호..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            />
          </div>
        </div>

        {/* 하단 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
          {!isEmpty && (
            <button
              onClick={() => setForm({ techStack: [], career: '', education: '', employmentType: [], salary: '', location: '', introduction: '' })}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              초기화
            </button>
          )}
          {isEmpty && <div />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
