import { Router, Status } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { addEmailConfirmation } from "../model/EmailConfirmations.ts";
import { addUser, getUserByEmail, getUserById, userEmailConfirm } from '../model/Users.ts';
// @deno-types="https://deno.land/x/otpauth/dist/otpauth.d.ts"
import * as OTPAuth from 'https://deno.land/x/otpauth/dist/otpauth.esm.js'

const router = new Router({ prefix: "/api" });

const byteArray2base64 = (x: Uint8Array) => btoa(String.fromCharCode(...x));

interface POSTSignUpJSON{
  email: string,
  client_random_value: string,
  encrypted_master_key: string,
  hashed_authentication_key: string
}

router.post("/signup", async (ctx) => {
  if(!ctx.request.hasBody) return ctx.throw(Status.BadRequest, "Bad Request");
  const body = ctx.request.body();
  if(body.type !== "json") return ctx.throw(Status.BadRequest, "Bad Request");
  const data: Partial<POSTSignUpJSON> = await body.value;
  if(!data
      || typeof data.email !== 'string'
      || typeof data.client_random_value !== 'string'
      || typeof data.encrypted_master_key !== 'string'
      || typeof data.hashed_authentication_key !== 'string')
        return ctx.throw(Status.BadRequest, "Bad Request");
  try{
    const issuccess = await addUser(
      data.email, data.client_random_value, data.encrypted_master_key, data.hashed_authentication_key);
    console.log(issuccess);
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

interface POSTEmailConfirmJSON{
  email: string,
  email_confirmation_token: string
}

router.post("/email_confirm", async (ctx) => {
  if(!ctx.request.hasBody) return ctx.throw(Status.BadRequest, "Bad Request");
  const body = ctx.request.body();
  if(body.type !== "json") return ctx.throw(Status.BadRequest, "Bad Request");
  const data: Partial<POSTEmailConfirmJSON> = await body.value;

  if (typeof data.email !== 'string' ||
      typeof data.email_confirmation_token !== 'string')
        return ctx.throw(Status.BadRequest, "Bad Request");
  
  // OK
  const status = await userEmailConfirm(data.email, data.email_confirmation_token);
  
  // login
  const user = await getUserByEmail(data.email);
  if(!user) throw new Error("Why!!");
  await ctx.state.session.set("uid", user.id);

  ctx.response.status = Status.OK;
  ctx.response.body = {success: status};
  ctx.response.type = "json";
}); 

// user

interface POSTAddTwoFactorSecretKeyJSON{
  secret_key: string,
  token: string,
}

router.post("/user/two_factor", async (ctx) => {
  // auth
  const uid: number | null = ctx.state.session.get("uid");
  const user = await getUserById(uid);
  if(!user) return ctx.throw(Status.Unauthorized, "Unauthorized");

  // verify body
  if(!ctx.request.hasBody) return ctx.throw(Status.BadRequest, "Bad Request");
  const body = ctx.request.body();
  if(body.type !== "json") return ctx.throw(Status.BadRequest, "Bad Request");
  const data: Partial<POSTAddTwoFactorSecretKeyJSON> = await body.value;

  if (typeof data.secret_key !== 'string' || typeof data.token !== 'string')
      return ctx.throw(Status.BadRequest, "Bad Request");
  
  await user.addTwoFactorAuthSecretKey(data.secret_key);

  return ctx.response.status = Status.NoContent;
});

export default router;