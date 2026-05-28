import { useJobStore } from '../../store/jobStore'
import { getWeeklyData, getStatusData, getTechData } from '../../utils/chartData'
import WeeklyBarChart from './WeeklyBarChart'
import StatusDonutChart from './StatusDonutChart'
import TechStackChart from './TechStackChart'

export default function ChartSection() {
  const jobs = useJobStore((s) => s.jobs)

  const weeklyData = getWeeklyData(jobs)
  const statusData = getStatusData(jobs)
  const techData = getTechData(jobs)

  return (
    <div className="space-y-4">
      {/* 1행: 핵심 차트 — 주차별(2칸) + 상태별(1칸) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <WeeklyBarChart data={weeklyData} />
        </div>
        <StatusDonutChart data={statusData} total={jobs.length} />
      </div>
      {/* 2행: 부가 차트 — 기술스택 */}
      <TechStackChart data={techData} />
    </div>
  )
}
