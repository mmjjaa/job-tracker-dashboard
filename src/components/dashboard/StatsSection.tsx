import { useJobStore } from '../../store/jobStore'
import StatsCard from './StatsCard'
import type { JobStatus } from '../../types'

const CARDS: { status: JobStatus | 'all'; label: string; colorClass: string }[] = [
  { status: 'all', label: '전체', colorClass: 'bg-gray-100 text-gray-700' },
  { status: '관심', label: '관심', colorClass: 'bg-blue-100 text-blue-700' },
  { status: '지원완료', label: '지원완료', colorClass: 'bg-green-100 text-green-700' },
  { status: '결과대기', label: '결과대기', colorClass: 'bg-yellow-100 text-yellow-700' },
]

export default function StatsSection() {
  const jobs = useJobStore((s) => s.jobs)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {CARDS.map(({ status, label, colorClass }) => (
        <StatsCard
          key={status}
          label={label}
          count={status === 'all' ? jobs.length : jobs.filter((j) => j.status === status).length}
          colorClass={colorClass}
        />
      ))}
    </div>
  )
}
