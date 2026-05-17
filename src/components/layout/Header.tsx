import { useJobStore } from '../../store/jobStore'

interface HeaderProps {
  onAddJob: () => void
}

export default function Header({ onAddJob }: HeaderProps) {
  const jobs = useJobStore((s) => s.jobs)

  const handleExport = () => {
    const json = JSON.stringify(jobs, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jobs.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
      <h2 className="text-gray-800 font-semibold text-lg">공고 관리</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="text-gray-500 hover:text-gray-700 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          title="브리핑 스킬용 데이터 내보내기"
        >
          내보내기
        </button>
        <button
          onClick={onAddJob}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + 공고 추가
        </button>
      </div>
    </header>
  )
}
