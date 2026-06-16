import { useJobStore } from '../../store/jobStore'
import StatsCard from './StatsCard'
import type { JobStatus } from '../../types'

const CARDS: { status: JobStatus | 'all'; label: string; icon: string; accentClass: string; highlight?: boolean; countColorClass?: string }[] = [
  { status: 'all',      label: '전체 공고', icon: '📋', accentClass: 'bg-primary-500' },
  { status: '관심',     label: '관심',      icon: '🔖', accentClass: 'bg-sky-400' },
  { status: '지원완료', label: '지원완료',  icon: '✅', accentClass: 'bg-emerald-500', highlight: true, countColorClass: 'text-emerald-600' },
  { status: '결과대기', label: '결과대기',  icon: '⏳', accentClass: 'bg-amber-400',  highlight: true, countColorClass: 'text-amber-500' },
]

export default function StatsSection() {
  const jobs = useJobStore((s) => s.jobs)

  const applied = jobs.filter((j) => j.status === '지원완료').length
  const urgent = jobs.filter((j) => {
    if (!j.deadline) return false
    const diff = Math.ceil((new Date(j.deadline).getTime() - Date.now()) / 86400000)
    return diff >= 0 && diff <= 7
  }).length
  const thisWeek = jobs.filter((j) => {
    const diff = Math.ceil((Date.now() - new Date(j.createdAt).getTime()) / 86400000)
    return diff <= 7
  }).length
  const achieveRate = jobs.length > 0 ? Math.round((applied / jobs.length) * 100) : 0

  return (
    <div className="space-y-5">

      {/* 히어로 배너 */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm px-8 py-7">
        {/* 오브 — 플랜아이 스타일 */}
        <div
          className="absolute -top-16 -right-16 w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(59,130,246,0.12) 50%, transparent 75%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute top-8 right-32 w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />

        <div className="relative z-10">
          <p className="text-primary-600 text-xs font-bold uppercase tracking-widest mb-2">취업 준비 대시보드</p>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            안녕하세요 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1 mb-6">오늘도 목표를 향해 한 걸음씩 나아가고 있어요</p>

          <div className="flex items-end gap-10">
            <div>
              <p className="text-4xl font-bold text-primary-600 leading-none">{achieveRate}<span className="text-2xl font-semibold">%</span></p>
              <p className="text-xs text-gray-400 mt-1.5">지원 달성률</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-500 leading-none">{thisWeek}</p>
              <p className="text-xs text-gray-400 mt-1.5">이번 주 추가</p>
            </div>
            {urgent > 0 && (
              <div>
                <p className="text-4xl font-bold text-red-500 leading-none">{urgent}</p>
                <p className="text-xs text-gray-400 mt-1.5">마감 임박</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 스탯 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CARDS.map(({ status, label, icon, accentClass, highlight, countColorClass }) => (
          <StatsCard
            key={status}
            label={label}
            count={status === 'all' ? jobs.length : jobs.filter((j) => j.status === status).length}
            icon={icon}
            accentClass={accentClass}
            highlight={highlight}
            countColorClass={countColorClass}
          />
        ))}
      </div>

    </div>
  )
}
