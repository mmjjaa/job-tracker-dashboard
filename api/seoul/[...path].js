export default async function handler(req, res) {
  const path = req.url.replace('/api/seoul', '')
  const targetUrl = `http://openapi.seoul.go.kr:8088${path}`

  try {
    const response = await fetch(targetUrl)
    const data = await response.json()
    res.status(200).json(data)
  } catch {
    res.status(502).json({ error: '서울 공공데이터 API 호출 실패' })
  }
}
