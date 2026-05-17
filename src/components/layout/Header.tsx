interface HeaderProps {
  onAddJob: () => void
}

export default function Header({ onAddJob }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
      <h2 className="text-gray-800 font-semibold text-lg">공고 관리</h2>
      <button
        onClick={onAddJob}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        + 공고 추가
      </button>
    </header>
  )
}
