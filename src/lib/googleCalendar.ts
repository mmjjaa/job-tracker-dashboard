const API = 'https://www.googleapis.com/calendar/v3'

export interface GCalJobInput {
  company: string
  position: string
  deadline: string | null
  status: string
  address?: string
}

function colorId(status: string, deadline: string | null): string {
  if (deadline) {
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
    if (diff <= 3 && diff >= 0) return '11' // Tomato - 마감 임박
  }
  if (status === '지원완료') return '10' // Basil - 초록
  if (status === '결과대기') return '5'  // Banana - 노랑
  return '9' // Blueberry - 파랑
}

function buildSummary(status: string, company: string, position: string): string {
  if (status === '지원완료') return `✅ [제출완료] ${company} - ${position}`
  return `[취업준비] ${company} - ${position}`
}

export async function createCalendarEvent(token: string, job: GCalJobInput): Promise<string> {
  const dateStr = job.deadline ?? new Date().toISOString().split('T')[0]

  const event = {
    summary: buildSummary(job.status, job.company, job.position),
    description: `회사: ${job.company}\n포지션: ${job.position}${job.address ? '\n근무지: ' + job.address : ''}`,
    start: { date: dateStr },
    end: { date: dateStr },
    colorId: colorId(job.status, job.deadline),
    reminders: {
      useDefault: false,
      overrides: job.deadline
        ? [{ method: 'popup', minutes: 60 * 24 * 3 }, { method: 'popup', minutes: 60 * 24 }]
        : [],
    },
  }

  const res = await fetch(`${API}/calendars/primary/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`캘린더 등록 실패 (${res.status}): ${err}`)
  }
  const data = await res.json()
  return data.id as string
}

export async function patchCalendarEvent(token: string, eventId: string, job: GCalJobInput): Promise<void> {
  const res = await fetch(`${API}/calendars/primary/events/${eventId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: buildSummary(job.status, job.company, job.position),
      colorId: colorId(job.status, job.deadline),
    }),
  })
  if (!res.ok && res.status !== 404) throw new Error(`캘린더 업데이트 실패 (${res.status})`)
}

export async function deleteCalendarEvent(token: string, eventId: string): Promise<void> {
  const res = await fetch(`${API}/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`캘린더 삭제 실패 (${res.status})`)
  }
}
