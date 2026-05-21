export interface ParsedJob {
  company: string
  position: string
  techStack: string[]
  deadline: string
  memo: string
}

export async function parseJobPosting(text: string): Promise<ParsedJob> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  const prompt = `아래는 채용 공고 텍스트야. 다음 정보를 추출해줘.

공고 텍스트:
${text}

JSON 형식으로만 반환 (다른 텍스트 없이):
{
  "company": "회사명",
  "position": "포지션명",
  "techStack": ["기술1", "기술2"],
  "deadline": "YYYY-MM-DD 형식, 없으면 빈 문자열",
  "memo": "주요 자격요건 요약 (2~3줄)"
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
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
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('분석 결과를 파싱할 수 없습니다')
  return JSON.parse(match[0]) as ParsedJob
}

export interface CoverLetter {
  motivation: string
  competency: string
  aspiration: string
}

export async function generateCoverLetter(
  company: string,
  position: string,
  techStack: string[],
  memo: string,
  userExperience: string,
): Promise<CoverLetter> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  const prompt = `회사: ${company}
포지션: ${position}
기술스택: ${techStack.join(', ')}
공고 요약: ${memo || '없음'}
지원자 경험/강조사항: ${userExperience || '없음'}

위 정보를 바탕으로 자소서 초안을 작성해줘.
각 항목당 200~300자 분량으로, 구체적이고 자연스러운 한국어로 작성.

JSON 형식으로만 반환 (다른 텍스트 없이):
{
  "motivation": "지원동기 내용",
  "competency": "직무역량 내용",
  "aspiration": "입사 후 포부 내용"
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API 오류 ${res.status}: ${err}`)
  }

  const data = await res.json()
  const content = data.content[0].text as string
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('자소서 생성 결과를 파싱할 수 없습니다')
  return JSON.parse(match[0]) as CoverLetter
}

export async function suggestTechStack(company: string, position: string): Promise<string[]> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  const prompt = `회사: ${company}
포지션: ${position}

이 회사의 이 포지션에서 실제로 사용하는 기술스택을 추천해줘.
해당 회사의 채용 공고, 기술 블로그, 실제 서비스 기반으로 추천.

JSON 배열로만 반환 (다른 텍스트 없이):
["기술1", "기술2", "기술3"]

최대 8개.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API 오류 ${res.status}: ${err}`)
  }

  const data = await res.json()
  const content = data.content[0].text as string
  const match = content.match(/\[[\s\S]*\]/)
  if (!match) return []
  return JSON.parse(match[0]) as string[]
}
