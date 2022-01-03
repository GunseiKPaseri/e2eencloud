import { opine, serveStatic, json } from "https://deno.land/x/opine@2.0.2/mod.ts";
import { opineCors } from "https://deno.land/x/cors/mod.ts";

const PORT = 3001;

const app = opine();

app.use(json());
app.use(opineCors()); // Enable CORS for All Routes
app.use(serveStatic("../webcli/dist/"));

app.post("/api/signup", (req, res) => {
  res.send({res: "Hello World", req: req.body});
});

app.listen(
  PORT,
  () => console.log(`server has started on http://localhost:${PORT} 🚀`),
);
