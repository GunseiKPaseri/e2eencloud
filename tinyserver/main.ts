import { Application, Status } from './deps.ts'
import { oakSession } from './deps.ts'
import sessionsStore from './model/Sessions.ts'
import { oakCors } from './deps.ts'
import apiRouter from './router/api.ts'

import { bold, PORT, yellow } from './deps.ts'
import { distDir } from './util.ts'

const app = new Application()

// Enable CORS
app.use(
  oakCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  }),
)

// use Session
app.use(oakSession.initMiddleware(sessionsStore))

// api router
app.use(apiRouter.routes())
app.use(apiRouter.allowedMethods())

// static assets router
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: distDir,
      index: 'index.html',
    })
  } catch (_) {
    next()
  }
})

// 404
app.use((ctx) => {
  ctx.response.status = Status.NotFound
  ctx.response.body = `"${ctx.request.url}" not found`
})

// service onetimemailaddr
const d = new Date(Date.now())
const str = `
${d.getFullYear()}
${('00' + (d.getMonth() + 1)).slice(-2)}
${('00' + d.getDate()).slice(-2)}
${('00' + d.getHours()).slice(-2)}
${('00' + d.getMinutes()).slice(-2)}
${('00' + d.getSeconds()).slice(-2)}
${('000' + d.getMilliseconds()).slice(-3)}`.replace(/\n|\r|\s/g, '')
console.log(`let's use ${bold(`hoge+${str}@example.com`)}`)

app.addEventListener('listen', ({ hostname, port, serverType }) => {
  console.log(
    `${bold('server has started')} on ${yellow(`http://${hostname}:${port}`)}`,
  )
  console.log('  using HTTP server: ' + yellow(serverType))
})

await app.listen({ hostname: 'localhost', port: PORT })

console.log('finished...')
