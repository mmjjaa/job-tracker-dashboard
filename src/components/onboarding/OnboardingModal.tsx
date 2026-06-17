import { useState } from 'react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

const STORAGE_KEY = 'job-tracker-onboarding-done'

export function isOnboardingDone() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

const STEPS = [
  {
    icon: '👋',
    title: '취업 준비, 한 곳에서 관리하세요',
    desc: '지원한 공고를 기록하고, 마감일을 추적하고, AI가 다음 액션을 제안해드려요.',
    detail: null,
  },
  {
    icon: '📋',
    title: '공고 관리',
    desc: '공고를 직접 입력하거나 서울 공공데이터에서 검색해 한 번에 추가할 수 있어요.',
    detail: [
      { icon: '✏️', text: '직접 입력 — 회사명, 직무, 마감일, 지원 URL 등록' },
      { icon: '🔍', text: '공고 검색 — 서울시 채용공고 실시간 검색' },
      { icon: '📊', text: '칸반/테이블 뷰로 지원 현황 한눈에 파악' },
    ],
  },
  {
    icon: '🤖',
    title: '데일리 브리핑',
    desc: '대시보드에서 브리핑을 시작하면 AI가 7일 이내 마감 공고를 분석해 할 일을 제안해요.',
    detail: [
      { icon: '✍️', text: '자소서 미작성 공고 → 자소서 작성 제안' },
      { icon: '📅', text: '캘린더 미등록 공고 → 캘린더 등록 제안' },
      { icon: '🔗', text: '마감 임박 공고 → 공고 링크 바로 열기' },
    ],
  },
  {
    icon: '📅',
    title: 'Google 캘린더 연동',
    desc: '사이드바에서 Google 캘린더를 연동하면 지원 마감일이 자동으로 등록돼요.',
    detail: [
      { icon: '🟢', text: '지원완료 — 초록색 이벤트' },
      { icon: '🟡', text: '결과대기 — 노란색 이벤트' },
      { icon: '🔴', text: '마감 3일 이내 — 빨간색 + 알림 설정' },
    ],
  },
]

interface Props {
  onClose: () => void
}

export default function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState(0)
  const { canInstall, isInstalled, install } = useInstallPrompt()
  const isLastStep = step === STEPS.length

  const handleDone = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    onClose()
  }

  const handleInstall = async () => {
    await install()
    handleDone()
  }

  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* 본문 */}
        <div className="px-8 pt-10 pb-6 min-h-[320px] flex flex-col">
          {step < STEPS.length ? (
            <>
              <div className="text-5xl mb-5">{current.icon}</div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{current.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{current.desc}</p>
              {current.detail && (
                <ul className="space-y-2.5">
                  {current.detail.map((item) => (
                    <li key={item.text} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="shrink-0 mt-0.5">{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            /* PWA 설치 단계 */
            <>
              <div className="text-5xl mb-5">📱</div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">홈화면에 추가하기</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                앱처럼 설치하면 브라우저 없이 바로 실행하고, 빠르게 공고를 확인할 수 있어요.
              </p>
              {isInstalled ? (
                <div className="flex items-center gap-2 text-sm text-primary-700 bg-primary-50 px-4 py-3 rounded-xl">
                  <span>✅</span>
                  <span>이미 설치되어 있어요</span>
                </div>
              ) : canInstall ? (
                <button
                  onClick={handleInstall}
                  className="w-full py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
                >
                  홈화면에 추가하기
                </button>
              ) : (
                <div className="text-sm text-gray-400 bg-gray-50 px-4 py-3 rounded-xl">
                  브라우저 주소창 오른쪽의 설치 아이콘을 눌러 추가할 수 있어요.
                </div>
              )}
            </>
          )}
        </div>

        {/* 하단 */}
        <div className="px-8 pb-8 flex items-center justify-between">
          {/* 진행 점 */}
          <div className="flex gap-1.5">
            {[...Array(STEPS.length + 1)].map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'bg-primary-600 w-4' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* 버튼 */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 transition-colors"
              >
                이전
              </button>
            )}
            {step === 0 && (
              <button
                onClick={handleDone}
                className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 transition-colors"
              >
                건너뛰기
              </button>
            )}
            {isLastStep ? (
              <button
                onClick={handleDone}
                className="text-sm font-semibold px-5 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                시작하기
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="text-sm font-semibold px-5 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                다음
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
