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
