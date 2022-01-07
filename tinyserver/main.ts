import { Application, send } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import apiRouter from "./router/api.ts";

import {
  bold,
  yellow,
} from "https://deno.land/std@0.118.0/fmt/colors.ts";

const PORT = 3001;

const app = new Application();

app.use(oakCors()); // Enable CORS for All Routes

// api router
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// static
app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/../webcli/dist`,
    index: "index.html",
  });
})

// service onetimemailaddr
const d = new Date(Date.now());
const str = `
${d.getFullYear()}
${("00"+(d.getMonth()+1)).slice(-2)}
${("00"+d.getDate()).slice(-2)}
${("00"+d.getHours()).slice(-2)}
${("00"+d.getMinutes()).slice(-2)}
${("00"+d.getSeconds()).slice(-2)}
${("000"+d.getMilliseconds()).slice(-3)}`.replace(/\n|\r|\s/g, '');
console.log(`let's use hoge+${str}@example.com`);

app.addEventListener("listen", ({ hostname, port, serverType }) => {
  console.log(`${bold("server has started")} on ${yellow(`http://${hostname}:${port}`)}`);
  console.log("  using HTTP server: " + yellow(serverType));
});

await app.listen({hostname:"127.0.0.1", port: PORT});

console.log("finished...");

