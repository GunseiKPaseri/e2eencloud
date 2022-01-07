import { Router, Status } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { addEmailConfirmation } from "../model/EmailConfirmations.ts";
import { addUser, userEmailConfirm } from '../model/Users.ts';

const router = new Router({ prefix: "/api" });

const byteArray2base64 = (x: Uint8Array) => btoa(String.fromCharCode(...x));

interface SignUpJSON{
  email: string,
  client_random_value: string,
  encrypted_master_key: string,
  hashed_authentication_key: string
}

router.post("/signup", async (ctx) => {
  if(!ctx.request.hasBody) return ctx.throw(Status.BadRequest, "Bad Request");
  const body = ctx.request.body();
  if(body.type !== "json") return ctx.throw(Status.BadRequest, "Bad Request");
  const data: Partial<SignUpJSON> = await body.value;
  if(!data
      || typeof data.email !== 'string'
      || typeof data.client_random_value !== 'string'
      || typeof data.encrypted_master_key !== 'string'
      || typeof data.hashed_authentication_key !== 'string')
        return ctx.throw(Status.BadRequest, "Bad Request");
  try{
    const user = await addUser(
      data.email, data.client_random_value, data.encrypted_master_key, data.hashed_authentication_key);
    console.log(user);
    // 128 bit email confirmation token
    const email_confirmation_token = crypto.getRandomValues(new Uint8Array(16));
    const token = byteArray2base64(email_confirmation_token);
    await addEmailConfirmation(data.email, token);
    console.log("SEND<", data.email, "> ", token);

    ctx.response.status = Status.OK;
    ctx.response.body = {success: true};
    ctx.response.type = "json";
    return;
  }catch (e){
    // userがそのメールアドレスが登録済か知る必要はない
    console.log(e);
    ctx.response.status = Status.OK;
    ctx.response.body = {success: true};
    ctx.response.type = "json";
  }
  });

interface EmailConfirmJSON{
  email: string,
  email_confirmation_token: string
}

router.post("/email_confirm", async (ctx) => {
  if(!ctx.request.hasBody) return ctx.throw(Status.BadRequest, "Bad Request");
  const body = ctx.request.body();
  if(body.type !== "json") return ctx.throw(Status.BadRequest, "Bad Request");
  const data: Partial<EmailConfirmJSON> = await body.value;

  if (typeof data.email !== 'string' ||
      typeof data.email_confirmation_token !== 'string')
        return ctx.throw(Status.BadRequest, "Bad Request");
  const status = await userEmailConfirm(data.email, data.email_confirmation_token);
  ctx.response.status = Status.OK;
  ctx.response.body = {success: status};
  ctx.response.type = "json";
}); 

export default router;