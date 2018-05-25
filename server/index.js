const Koa = require('koa')
const cors = require('kcors')
const log = require('./logger')
const api = require('./api')

// Setup Koa app
const app = new Koa()
const port = process.env.PORT || 5000

// Apply CORS config
const origin = process.env.CORS_ORIGIN | '*'
app.use(cors({ origin }))

// Log all requests
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const responseTime = Date.now() - start
  log.info(`${ctx.method} ${ctx.status} ${ctx.url} - ${responseTime} ms`)
})

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
    log.error(`Request Error ${ctx.url} - ${err.message}`)
  }
})

app.use(api.routes(), api.allowedMethods())
app.listen(port, () => { log.info(`Server listening on port ${port}`) })
