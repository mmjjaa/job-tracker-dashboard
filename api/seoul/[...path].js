const http = require('http')

module.exports = function handler(req, res) {
  const { path } = req.query
  const pathStr = Array.isArray(path) ? path.join('/') : (path || '')
  const targetUrl = `http://openapi.seoul.go.kr:8088/${pathStr}`

  http.get(targetUrl, (proxyRes) => {
    let data = ''
    proxyRes.on('data', (chunk) => { data += chunk })
    proxyRes.on('end', () => {
      try {
        res.status(200).json(JSON.parse(data))
      } catch {
        res.status(502).json({ error: '응답 파싱 실패' })
      }
    })
  }).on('error', () => {
    res.status(502).json({ error: '서울 공공데이터 API 호출 실패' })
  })
}
