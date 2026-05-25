import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { StatusData } from '../../utils/chartData'

interface Props {
  data: StatusData[]
  total: number
}

export default function StatusDonutChart({ data, total }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">상태별 분포</p>
      {total === 0 ? (
        <div className="flex items-center justify-center h-36 text-gray-500 text-sm font-medium">
          데이터가 없습니다
        </div>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={144}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
                formatter={(v) => [`${v}개`, '']}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ fontSize: 11, color: '#6B7280' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center -mt-5">
              <p className="text-xl font-bold text-gray-800">{total}</p>
              <p className="text-xs text-gray-500 font-medium">전체</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
