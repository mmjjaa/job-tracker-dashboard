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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <WeeklyBarChart data={weeklyData} />
      <StatusDonutChart data={statusData} total={jobs.length} />
      <TechStackChart data={techData} />
    </div>
  )
}
