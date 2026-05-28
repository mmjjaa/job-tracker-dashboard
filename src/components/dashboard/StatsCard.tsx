interface StatsCardProps {
  label: string
  count: number
  icon: string
  accentClass: string
}

export default function StatsCard({ label, count, icon, accentClass }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* 상단 컬러 바 */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentClass}`} />

      {/* 배경 아이콘 */}
      <div className="absolute -right-1 -bottom-2 text-7xl opacity-[0.04] select-none pointer-events-none">
        {icon}
      </div>

      <div className="mb-4">
        <span className="text-2xl">{icon}</span>
      </div>

      <p className="text-4xl font-bold text-gray-900 leading-none">{count}</p>
      <p className="text-sm text-gray-500 mt-2 font-medium">{label}</p>
    </div>
  )
}
