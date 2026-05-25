interface StatsCardProps {
  label: string
  count: number
  colorClass: string
}

export default function StatsCard({ label, count, colorClass }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-700 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{count}</p>
      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
        {label}
      </span>
    </div>
  )
}
