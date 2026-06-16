import { useState } from 'react'
import { useJobStore } from '../../store/jobStore'
import type { Job } from '../../types'

const STATUS_STYLE: Record<string, { dot: string; badge: string; label: string }> = {
  '관심':    { dot: 'bg-primary-400',    badge: 'bg-primary-50 text-primary-600',      label: '관심' },
  '지원예정': { dot: 'bg-purple-400',  badge: 'bg-purple-50 text-purple-600',  label: '지원예정' },
  '지원완료': { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-600', label: '지원완료' },
  '결과대기': { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-600',    label: '결과대기' },
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

type Cell = { y: number; m: number; d: number; current: boolean }

export default function CalendarSection() {
  const jobs = useJobStore((s) => s.jobs)
  const today = new Date()
  const [curY, setCurY] = useState(today.getFullYear())
  const [curM, setCurM] = useState(today.getMonth())
  const [selected, setSelected] = useState<Cell | null>(null)

  const deadlineMap = jobs.reduce<Record<string, Job[]>>((acc, job) => {
    if (job.deadline) {
      acc[job.deadline] = [...(acc[job.deadline] ?? []), job]
    }
    return acc
  }, {})

  // 달력 그리드 생성
  const firstDay = new Date(curY, curM, 1).getDay()
  const daysInMonth = new Date(curY, curM + 1, 0).getDate()
  const daysInPrevMonth = new Date(curY, curM, 0).getDate()

  const cells: Cell[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const m = curM === 0 ? 11 : curM - 1
    const y = curM === 0 ? curY - 1 : curY
    cells.push({ y, m, d, current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ y: curY, m: curM, d, current: true })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const m = curM === 11 ? 0 : curM + 1
    const y = curM === 11 ? curY + 1 : curY
    cells.push({ y, m, d, current: false })
  }

  const prevMonth = () => {
    if (curM === 0) { setCurY(y => y - 1); setCurM(11) }
    else setCurM(m => m - 1)
    setSelected(null)
  }
  const nextMonth = () => {
    if (curM === 11) { setCurY(y => y + 1); setCurM(0) }
    else setCurM(m => m + 1)
    setSelected(null)
  }
  const goToday = () => {
    setCurY(today.getFullYear())
    setCurM(today.getMonth())
    setSelected({ y: today.getFullYear(), m: today.getMonth(), d: today.getDate(), current: true })
  }

  const selectedJobs = selected
    ? (deadlineMap[toDateStr(selected.y, selected.m, selected.d)] ?? [])
    : []

  const thisMonthDeadlines = Object.entries(deadlineMap)
    .filter(([d]) => d.startsWith(`${curY}-${String(curM + 1).padStart(2, '0')}`))
    .reduce((sum, [, j]) => sum + j.length, 0)

  const todayY = today.getFullYear()
  const todayM = today.getMonth()
  const todayD = today.getDate()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* 달력 영역 */}
        <div className="flex-1 min-w-0">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {MONTHS[curM]}{' '}
                <span className="text-gray-400 font-normal text-lg">{curY}</span>
              </h2>
              {thisMonthDeadlines > 0 && (
                <span className="text-xs bg-primary-50 text-primary-600 font-semibold px-2.5 py-0.5 rounded-full">
                  마감 {thisMonthDeadlines}건
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={goToday}
                className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors mr-1 font-medium"
              >
                오늘
              </button>
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors text-lg"
              >
                ‹
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors text-lg"
              >
                ›
              </button>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`text-center text-xs font-semibold py-2 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-primary-400' : 'text-gray-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((cell, idx) => {
              const dateStr = toDateStr(cell.y, cell.m, cell.d)
              const cellJobs = deadlineMap[dateStr] ?? []
              const isToday = cell.y === todayY && cell.m === todayM && cell.d === todayD
              const isSelected = selected
                ? cell.y === selected.y && cell.m === selected.m && cell.d === selected.d
                : false
              const colIdx = idx % 7

              return (
                <button
                  key={idx}
                  onClick={() => setSelected(isSelected ? null : cell)}
                  className={`relative flex flex-col items-center pt-1.5 pb-2 rounded-xl transition-all
                    ${isSelected ? 'bg-primary-50 ring-1 ring-primary-200' : 'hover:bg-gray-50'}
                    ${!cell.current ? 'opacity-25' : ''}
                  `}
                >
                  <span
                    className={`w-7 h-7 flex items-center justify-center text-sm rounded-full font-medium transition-colors
                      ${isToday
                        ? 'bg-primary-600 text-white font-bold shadow-sm'
                        : isSelected
                        ? 'text-primary-700 font-bold'
                        : colIdx === 0
                        ? 'text-red-500'
                        : colIdx === 6
                        ? 'text-primary-500'
                        : 'text-gray-800'
                      }
                    `}
                  >
                    {cell.d}
                  </span>

                  {cellJobs.length > 0 && (
                    <div className="flex gap-0.5 mt-1 justify-center items-center">
                      {cellJobs.slice(0, 3).map((job, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[job.status]?.dot ?? 'bg-gray-400'}`}
                        />
                      ))}
                      {cellJobs.length > 3 && (
                        <span className="text-[9px] text-gray-400 leading-none">+{cellJobs.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* 상태 범례 */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-4 border-t border-gray-100">
            {Object.entries(STATUS_STYLE).map(([status, style]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className="text-xs text-gray-500">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div className="hidden lg:block w-px bg-gray-100 self-stretch" />
        <div className="block lg:hidden h-px bg-gray-100" />

        {/* 오른쪽 패널 */}
        <div className="lg:w-60 flex flex-col">
          {selected ? (
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3">
                {selected.m + 1}월 {selected.d}일
                <span className="text-gray-400 font-normal ml-1 text-xs">마감 공고</span>
              </p>
              {selectedJobs.length > 0 ? (
                <ul className="space-y-2">
                  {selectedJobs.map((job) => {
                    const style = STATUS_STYLE[job.status] ?? {
                      dot: 'bg-gray-400',
                      badge: 'bg-gray-50 text-gray-500',
                      label: job.status,
                    }
                    return (
                      <li key={job.id} className="bg-gray-50 rounded-xl p-3 hover:bg-primary-50 transition-colors cursor-default">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{job.company}</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{job.position}</p>
                          </div>
                          <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                            {style.label}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-28 text-center">
                  <p className="text-sm text-gray-400">마감 공고 없음</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 py-8">
              <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-lg">
                📅
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">날짜를 클릭하세요</p>
                <p className="text-xs text-gray-400 mt-1">마감 공고를 확인할 수 있어요</p>
              </div>
              {thisMonthDeadlines > 0 && (
                <span className="text-xs text-primary-500 font-semibold bg-primary-50 px-3 py-1 rounded-full">
                  이번 달 {thisMonthDeadlines}건 마감 예정
                </span>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
