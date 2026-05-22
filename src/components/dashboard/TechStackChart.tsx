import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { TechData } from '../../utils/chartData'

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6']

interface Props {
  data: TechData[]
}

export default function TechStackChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">기술스택 Top 8</p>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-36 text-gray-400 text-sm">
          데이터가 없습니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={144}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="tech" width={72} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
              formatter={(v) => [`${v}개`, '공고 수']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
