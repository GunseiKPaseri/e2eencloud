import { Application, Status } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions@v3.2.3/mod.ts";
import SessionsStore from "./model/Sessions.ts";
import client from "./dbclient.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import apiRouter from "./router/api.ts";

import { bold, yellow } from "https://deno.land/std@0.118.0/fmt/colors.ts";

const PORT = 3001;

const app = new Application();

// Enable CORS
app.use(
  oakCors({
    origin: [`http://localhost:${PORT}`, "http://localhost:3000"],
    credentials: true,
  }),
);

// use Session
const session = new Session(new SessionsStore(client));
app.use(session.initMiddleware());

// api router
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// static assets router
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/../webcli/dist`,
      index: "index.html",
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
${("00" + (d.getMonth() + 1)).slice(-2)}
${("00" + d.getDate()).slice(-2)}
${("00" + d.getHours()).slice(-2)}
${("00" + d.getMinutes()).slice(-2)}
${("00" + d.getSeconds()).slice(-2)}
${("000" + d.getMilliseconds()).slice(-3)}`.replace(/\n|\r|\s/g, "");
console.log(`let's use ${bold(`hoge+${str}@example.com`)}`);

app.addEventListener("listen", ({ hostname, port, serverType }) => {
  console.log(
    `${bold("server has started")} on ${yellow(`http://${hostname}:${port}`)}`,
  );
  console.log("  using HTTP server: " + yellow(serverType));
});

await app.listen({ hostname: "127.0.0.1", port: PORT });

console.log("finished...");
