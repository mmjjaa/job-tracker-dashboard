import { useJobStore } from '../../store/jobStore'
import StatsCard from './StatsCard'
import type { JobStatus } from '../../types'

const CARDS: { status: JobStatus | 'all'; label: string; icon: string; accentClass: string }[] = [
  { status: 'all',    label: '전체 공고',  icon: '📋', accentClass: 'bg-blue-500' },
  { status: '관심',   label: '관심',      icon: '🔖', accentClass: 'bg-sky-400' },
  { status: '지원완료', label: '지원완료', icon: '✅', accentClass: 'bg-emerald-500' },
  { status: '결과대기', label: '결과대기', icon: '⏳', accentClass: 'bg-amber-400' },
]

export default function StatsSection() {
  const jobs = useJobStore((s) => s.jobs)

  return (
    <section className="relative">
      {/* 배경 블롭 */}
      <div className="blob absolute -top-16 right-4 w-72 h-72 bg-blue-100 opacity-50" />
      <div className="blob absolute top-4 -left-20 w-60 h-60 bg-sky-50 opacity-70" />

      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
        {CARDS.map(({ status, label, icon, accentClass }) => (
          <StatsCard
            key={status}
            label={label}
            count={status === 'all' ? jobs.length : jobs.filter((j) => j.status === status).length}
            icon={icon}
            accentClass={accentClass}
          />
        ))}
      </div>
    </section>
  )
}
