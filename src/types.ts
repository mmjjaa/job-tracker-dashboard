export type JobStatus = '관심' | '지원예정' | '지원완료' | '결과대기'

export interface Job {
  id: string
  company: string
  position: string
  url: string
  techStack: string[]
  deadline: string | null
  memo: string
  status: JobStatus
  createdAt: string
}
