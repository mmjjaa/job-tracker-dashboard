export interface JobData {
  company: string
  position: string
  url: string
  techStack: string[]
  salary: string
  deadline: string | null
  memo: string
}

export interface StoredJob extends JobData {
  notionPageId: string
  savedAt: string
  status: JobStatus
}

export type JobStatus = '관심' | '지원예정' | '지원완료' | '결과대기'

export type MessageType = 'EXTRACT_JOB' | 'PARSE_AND_SAVE' | 'GET_RECENT'

export interface ExtractJobMessage {
  type: 'EXTRACT_JOB'
  text: string
  url: string
}

export interface ParseAndSaveMessage {
  type: 'PARSE_AND_SAVE'
  text: string
  url: string
  memo: string
}

export interface GetRecentMessage {
  type: 'GET_RECENT'
}

export type BackgroundMessage =
  | ExtractJobMessage
  | ParseAndSaveMessage
  | GetRecentMessage

export interface BackgroundResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
