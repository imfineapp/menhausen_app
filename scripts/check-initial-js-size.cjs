const fs = require('fs')
const path = require('path')

const MAX_INITIAL_JS_GZIP_BYTES = Number(process.env.MAX_INITIAL_JS_GZIP_BYTES || 1200 * 1024)
const statsPath = path.resolve(__dirname, '..', 'dist', 'stats.html')

if (!fs.existsSync(statsPath)) {
  console.error('stats.html not found. Run `npm run build:analyze` before size:check.')
  process.exit(1)
}

const content = fs.readFileSync(statsPath, 'utf8')
const match = content.match(/"gzipLength":\s*(\d+)/g) || []
if (match.length === 0) {
  console.error('Could not parse gzip lengths from stats.html')
  process.exit(1)
}

const gzipSizes = match.map((entry) => Number(entry.replace(/[^0-9]/g, '')))
const total = gzipSizes.reduce((sum, value) => sum + value, 0)

if (total > MAX_INITIAL_JS_GZIP_BYTES) {
  console.error(`Initial JS gzip size too large: ${total} bytes > ${MAX_INITIAL_JS_GZIP_BYTES} bytes`)
  process.exit(1)
}

console.log(`Initial JS gzip size is within budget: ${total} bytes`)
