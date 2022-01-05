import { opine, serveStatic, json } from "https://deno.land/x/opine@2.0.2/mod.ts";
import { opineCors } from "https://deno.land/x/cors/mod.ts";
import { addUser } from './model/Users.ts';

const PORT = 3001;

const app = opine();

app.use(json());
app.use(opineCors()); // Enable CORS for All Routes
app.use(serveStatic("../webcli/dist/"));

app.post("/api/signup", async (req, res) => {
  const email: unknown = req.body.email;
  const client_random_value: unknown = req.body.client_random_value;
  const encrypted_master_key: unknown = req.body.encrypted_master_key;
  const hashed_authentication_key: unknown = req.body.hashed_authentication_key;
  if (typeof email !== 'string' ||
      typeof client_random_value !== 'string' ||
      typeof encrypted_master_key !== 'string' ||
      typeof hashed_authentication_key !== 'string'){
        res.send({success: false});
        return;
      }
  try{
    const newuser = await addUser(email, client_random_value, encrypted_master_key, hashed_authentication_key)
    console.log(newuser);
    res.send({success: true});
  }catch(e){
    console.log("failed", e);
    return res.send({success: false});
  }
});

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
