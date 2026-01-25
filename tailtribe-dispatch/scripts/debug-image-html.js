const http = require('http')

const URLS = [
  'http://127.0.0.1:3000/over-ons',
  'http://127.0.0.1:3000/',
  'http://127.0.0.1:3000/diensten/hondenuitlaat',
]

function get(url) {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        let body = ''
        res.on('data', (c) => (body += c))
        res.on('end', () => resolve({ url, status: res.statusCode, body }))
      })
      .on('error', (err) => resolve({ url, status: 'ERR', body: String(err) }))
  })
}

function sample(body, needle) {
  const out = []
  let i = 0
  while (out.length < 3) {
    const p = body.indexOf(needle, i)
    if (p === -1) break
    out.push(body.slice(Math.max(0, p - 50), Math.min(body.length, p + 140)).replace(/\n/g, ''))
    i = p + needle.length
  }
  return out
}

;(async () => {
  for (const url of URLS) {
    const r = await get(url)
    const b = r.body || ''
    const hasNextImage = b.includes('/_next/image?')
    const hasAssets = b.includes('/assets/')

    console.log('\n', url, '->', r.status)
    if (r.status === 'ERR') {
      console.log('error:', b)
      continue
    }
    console.log('contains /_next/image?', hasNextImage)
    console.log('contains /assets/?', hasAssets)
    console.log('samples _next/image:', sample(b, '/_next/image?'))
    console.log('samples /assets/:', sample(b, '/assets/'))
  }
})()

