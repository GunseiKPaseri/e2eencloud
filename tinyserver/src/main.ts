import { Application, bold, ENV, oakCors, oakSession, serve, Status, yellow } from 'tinyserver/deps.ts';
import { distDir } from 'tinyserver/src/util.ts';
import sessionsStore from './model/Sessions.ts';
import apiRouter from './router/api.ts';
import io from 'tinyserver/src/router/socket.ts';

const app = new Application();

// Enable CORS
app.use(
  oakCors({
    origin: /^.+(localhost|127.0.0.1)(:\d*)?$/,
    credentials: true,
  }),
);

// use Session
app.use(oakSession.initMiddleware(sessionsStore));

// api router
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// static assets router
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: distDir,
      index: 'index.html',
    });
  } catch (_) {
    next();
  }
});

// 404
app.use((ctx) => {
  ctx.response.status = Status.NotFound;
  ctx.response.body = `"${ctx.request.url}" not found`;
});

// service onetimemailaddr
const d = new Date(Date.now());
const str = `
${d.getFullYear()}
${('00' + (d.getMonth() + 1)).slice(-2)}
${('00' + d.getDate()).slice(-2)}
${('00' + d.getHours()).slice(-2)}
${('00' + d.getMinutes()).slice(-2)}
${('00' + d.getSeconds()).slice(-2)}
${('000' + d.getMilliseconds()).slice(-3)}`.replace(/\n|\r|\s/g, '');
console.log(`let's use ${bold(`hoge+${str}@example.com`)}`);

app.addEventListener('listen', ({ hostname, port, serverType }) => {
  console.log(
    `${bold('server has started')} on ${yellow(`http://${hostname}:${port}`)}`,
  );
  console.log('  using HTTP server: ' + yellow(serverType));
});

const handler = io.handler(async (req) => {
  return await app.handle(req) || new Response(null, { status: 404 });
});

await serve(handler, {
  hostname: '0.0.0.0',
  port: ENV.PORT,
});

console.log('finished...');
