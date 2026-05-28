interface TooltipProps {
  text: string
  children: React.ReactNode
  position?: 'top' | 'bottom'
}

export default function Tooltip({ text, children, position = 'bottom' }: TooltipProps) {
  const isTop = position === 'top'

  return (
    <div className="relative group/tip inline-flex">
      {children}
      <div
        className={`absolute z-50 pointer-events-none
          left-1/2 -translate-x-1/2
          ${isTop ? 'bottom-full mb-2' : 'top-full mt-2'}
          px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap shadow-lg
          opacity-0 group-hover/tip:opacity-100
          translate-y-1 group-hover/tip:translate-y-0
          transition-all duration-150`}
      >
        {text}
        {/* 말풍선 화살표 */}
        <span
          className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent
            ${isTop
              ? 'top-full border-t-gray-800'
              : 'bottom-full border-b-gray-800'
            }`}
        />
      </div>
    </div>
  )
}
