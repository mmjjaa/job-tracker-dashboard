interface StatsCardProps {
  label: string
  count: number
  icon: string
  accentClass: string
  highlight?: boolean
  countColorClass?: string
}

export default function StatsCard({ label, count, icon, accentClass, highlight, countColorClass }: StatsCardProps) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-6 relative overflow-hidden transition-shadow duration-200 group
      ${highlight
        ? 'border-gray-200 hover:shadow-lg'
        : 'border-gray-100 hover:shadow-md'
      }`}
    >
      {/* 상단 컬러 바 */}
      <div className={`absolute top-0 left-0 right-0 ${highlight ? 'h-1.5' : 'h-1'} ${accentClass}`} />

      {/* 배경 아이콘 */}
      <div className="absolute -right-1 -bottom-2 text-7xl opacity-[0.04] select-none pointer-events-none">
        {icon}
      </div>

      <div className="mb-4">
        <span className={highlight ? 'text-3xl' : 'text-2xl'}>{icon}</span>
      </div>

      <p className={`font-bold leading-none ${highlight ? 'text-5xl' : 'text-4xl text-gray-900'} ${countColorClass ?? ''}`}>
        {count}
      </p>
      <p className={`mt-2 font-medium ${highlight ? 'text-sm text-gray-600' : 'text-sm text-gray-500'}`}>{label}</p>
    </div>
  )
}
