import http from 'http'

export default function handler(req, res) {
  const { key, start, end } = req.query
  if (!key || !start || !end) {
    res.status(400).json({ error: '파라미터 누락' })
    return
  }

  const targetUrl = `http://openapi.seoul.go.kr:8088/${key}/json/GetJobInfo/${start}/${end}/`

  return new Promise((resolve) => {
    http.get(targetUrl, (proxyRes) => {
      let data = ''
      proxyRes.on('data', (chunk) => { data += chunk })
      proxyRes.on('end', () => {
        try {
          res.status(200).json(JSON.parse(data))
        } catch {
          res.status(502).json({ error: '응답 파싱 실패' })
        }
        resolve()
      })
    }).on('error', () => {
      res.status(502).json({ error: '서울 공공데이터 API 호출 실패' })
      resolve()
    })
  })
}
