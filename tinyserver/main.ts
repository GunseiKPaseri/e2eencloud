import { opine, serveStatic, json } from "https://deno.land/x/opine@2.0.2/mod.ts";
import { opineCors } from "https://deno.land/x/cors/mod.ts";
import apiRouter from "./router/api.ts";

const PORT = 3001;

const app = opine();

app.use(json());
app.use(opineCors()); // Enable CORS for All Routes
app.use(serveStatic("../webcli/dist/"));

app.use('/api', apiRouter);

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

app.listen(
  PORT,
  () => console.log(`server has started on http://localhost:${PORT} 🚀`),
);
