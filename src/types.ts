export type JobStatus = '관심' | '지원예정' | '지원완료' | '결과대기'

export interface CoverLetterDraft {
  motivation: string
  competency: string
  aspiration: string
}

export interface Job {
  id: string
  company: string
  position: string
  url: string
  techStack: string[]
  deadline: string | null
  address: string
  memo: string
  status: JobStatus
  createdAt: string
  coverLetter?: CoverLetterDraft
  // 서울시 공공API 추가 필드
  duties?: string        // 직무 내용 (DTY_CN)
  employmentType?: string // 고용 형태 (EMPLYM_STLE_CMMN_MM)
  career?: string        // 경력 조건 (CAREER_CND_NM)
  wage?: string          // 급여 (HOPE_WAGE)
}
