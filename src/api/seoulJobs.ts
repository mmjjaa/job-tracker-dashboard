export interface SeoulJob {
  JO_REQST_NO: string
  CMPNY_NM: string
  JO_SJ: string
  JOBCODE_NM: string
  WORK_PARAR_BASS_ADRES_CN: string
  EMPLYM_STLE_CMMN_MM: string
  CAREER_CND_NM: string
  HOPE_WAGE: string
  RCEPT_CLOS_NM: string
  DTY_CN: string
  GUI_LN: string
  JO_REG_DT: string
}

interface SeoulApiResponse {
  GetJobInfo: {
    list_total_count: number
    RESULT: { CODE: string; MESSAGE: string }
    row: SeoulJob[]
  }
}

export async function fetchSeoulJobs(start: number, end: number): Promise<{ total: number; jobs: SeoulJob[] }> {
  const key = import.meta.env.VITE_SEOUL_API_KEY?.trim()
  const res = await fetch(`/api/seoul/${key}/json/GetJobInfo/${start}/${end}/`)
  if (!res.ok) throw new Error('API 호출 실패')
  const data: SeoulApiResponse = await res.json()
  const info = data.GetJobInfo
  if (info.RESULT.CODE !== 'INFO-000') throw new Error(info.RESULT.MESSAGE)
  return {
    total: info.list_total_count,
    jobs: Array.isArray(info.row) ? info.row : [],
  }
}

export function parseDeadline(rcept_clos_nm: string): string | null {
  const match = rcept_clos_nm.match(/(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : null
}
