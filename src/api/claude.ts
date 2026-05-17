export interface ParsedJob {
  company: string
  position: string
  techStack: string[]
  deadline: string | null
}

export async function parseJobPosting(url: string, text: string): Promise<ParsedJob> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  const prompt = `채용 공고에서 아래 정보를 추출해 JSON으로만 반환해줘. 다른 텍스트는 절대 출력하지 마.

URL: ${url || '없음'}

공고 내용:
${text.slice(0, 3000)}

반환 형식:
{
  "company": "회사명",
  "position": "포지션명",
  "techStack": ["기술1", "기술2"],
  "deadline": "YYYY-MM-DD 또는 null"
}

규칙:
- 회사명/포지션이 없으면 빈 문자열
- 기술스택이 없으면 빈 배열
- 마감일이 없거나 불명확하면 null
- JSON만 출력`

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API 오류 ${res.status}: ${err}`)
  }

  const data = await res.json()
  const content = data.content[0].text as string

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('응답 파싱 실패')

  return JSON.parse(jsonMatch[0]) as ParsedJob
}
