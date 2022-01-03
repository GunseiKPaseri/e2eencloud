import { opine, serveStatic, json } from "https://deno.land/x/opine@2.0.2/mod.ts";

const PORT = 3000;

const app = opine();

app.use(json());
app.use(serveStatic("../webcli/dist/"));

app.post("/api/signup", (req, res) => {
  res.send({res: "Hello World", req: req.body});
});

app.listen(
  PORT,
  () => console.log(`server has started on http://localhost:${PORT} 🚀`),
);
