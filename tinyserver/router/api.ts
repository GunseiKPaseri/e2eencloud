import { encode as byteArray2base64, decode as base642ByteArray } from "https://deno.land/std/encoding/base64.ts"
import { Router, Status } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { addEmailConfirmation } from "../model/EmailConfirmations.ts";
import { addUser, getClientRandomSalt, getUserByEmail, getUserById, userEmailConfirm } from '../model/Users.ts';
// @deno-types="https://deno.land/x/otpauth/dist/otpauth.d.ts"
import * as OTPAuth from 'https://deno.land/x/otpauth/dist/otpauth.esm.js'
import { addFile } from "../model/Files.ts";

const router = new Router({ prefix: "/api" });

interface POSTSignUpJSON{
  email: string,
  client_random_value: string,
  encrypted_master_key: string,
  encrypted_master_key_iv: string,
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
      || typeof data.encrypted_master_key_iv !== 'string'
      || typeof data.hashed_authentication_key !== 'string')
        return ctx.throw(Status.BadRequest, "Bad Request");
  try{
    const issuccess = await addUser({
      email: data.email,
      client_random_value: data.client_random_value,
      encrypted_master_key: data.encrypted_master_key,
      encrypted_master_key_iv: data.encrypted_master_key_iv,
      hashed_authentication_key: data.hashed_authentication_key,
    });
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

// client random salt

interface GETSaltJSON{
  email: string,
}

// GETではBODYに格納するのが困難
router.post("/salt", async (ctx) => {
  if(!ctx.request.hasBody) return ctx.throw(Status.BadRequest, "Bad Request");
  const body = ctx.request.body();
  if(body.type !== "json") return ctx.throw(Status.BadRequest, "Bad Request");
  const data: Partial<GETSaltJSON> = await body.value;

  if (typeof data.email !== 'string')
      return ctx.throw(Status.BadRequest, "Bad Request");
  
  // OK
  const salt = await getClientRandomSalt(data.email);
  
  ctx.response.status = Status.OK;
  ctx.response.body = {salt};
  ctx.response.type = "json";
});

// login
interface POSTloginJSON{
  email: string,
  token: string,
  authentication_key: string,
}

router.post("/login", async (ctx) => {
  if(!ctx.request.hasBody) return ctx.throw(Status.BadRequest, "Bad Request");
  const body = ctx.request.body();
  if(body.type !== "json") return ctx.throw(Status.BadRequest, "Bad Request");
  const data: Partial<POSTloginJSON> = await body.value;

  if (typeof data.email !== 'string' || typeof data.authentication_key !== 'string' || typeof data.token !== 'string')
      return ctx.throw(Status.BadRequest, "Bad Request");
  
  // OK
  const hashedAuthenticationKey = await crypto.subtle.digest("SHA-256", base642ByteArray(data.authentication_key));
  const hashed_authentication_key = byteArray2base64(hashedAuthenticationKey);

  const user = await getUserByEmail(data.email);
  // there is no user || same hash?
  if(!user || user.hashed_authentication_key !== hashed_authentication_key)
    return ctx.throw(Status.Unauthorized, "Unauthorized");
  // use totp?
  if(user.two_factor_authentication_secret_key){
    const totp = new OTPAuth.TOTP({
      issuer: "E2EE",
      label: `${user.email}`,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: user.two_factor_authentication_secret_key,
    });
    if(totp.validate({token: data.token, window: 1}) === null)
      return ctx.throw(Status.Unauthorized, "Unauthorized");
  }
  // login!!
  await ctx.state.session.set("uid", user.id);
  
  ctx.response.status = Status.OK;
  ctx.response.body = {
    encrypted_master_key: user.encrypted_master_key,
    encrypted_master_key_iv: user.encrypted_master_key_iv,
    useTwoFactorAuth: user.two_factor_authentication_secret_key !== null,
  };
  ctx.response.type = "json";
});

router.post("/logout", async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get("uid");
  const user = await getUserById(uid);
  if(!user) return ctx.response.status = Status.NoContent;

  // logout
  await ctx.state.session.set("uid", null);
  ctx.response.status = Status.NoContent;
}); 


// user

interface POSTAddTwoFactorSecretKeyJSON{
  secret_key: string,
  token: string,
}

router.put("/user/totp", async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get("uid");
  const user = await getUserById(uid);
  if(!user) return ctx.throw(Status.Unauthorized, "Unauthorized");

  // verify body
  if(!ctx.request.hasBody) return ctx.throw(Status.BadRequest, "Bad Request");
  const body = ctx.request.body();
  if(body.type !== "json") return ctx.throw(Status.BadRequest, "Bad Request");
  const data: Partial<POSTAddTwoFactorSecretKeyJSON> = await body.value;

  if (typeof data.secret_key !== 'string' || typeof data.token !== 'string')
      return ctx.throw(Status.BadRequest, "Bad Request");
  
  // verify token
  const totp = new OTPAuth.TOTP({
    issuer: "E2EE",
    label: `${user.email}`,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: data.secret_key,
  });
  const result = totp.validate({
    token: data.token,
    window: 1
  });
  console.log(data,user, result);

  if(result === null) return ctx.throw(Status.BadRequest, "Bad Token");

  await user.addTwoFactorAuthSecretKey(data.secret_key);

  return ctx.response.status = Status.NoContent;
});

router.delete("/user/totp", async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get("uid");
  const user = await getUserById(uid);
  if(!user) return ctx.throw(Status.Unauthorized, "Unauthorized");

  // verify token
  await user.addTwoFactorAuthSecretKey(null);

  return ctx.response.status = Status.NoContent;
});

// public key

interface PUTpubkeyJSON{
  encrypted_rsa_private_key: string,
  encrypted_rsa_private_key_iv: string,
  rsa_public_key: string,
}
router.put("/user/pubkey", async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get("uid");
  const user = await getUserById(uid);
  if(!user) return ctx.throw(Status.Unauthorized, "Unauthorized");

  // verify body
  if(!ctx.request.hasBody) return ctx.throw(Status.BadRequest, "Bad Request");
  const body = ctx.request.body();
  if(body.type !== "json") return ctx.throw(Status.BadRequest, "Bad Request");
  const data: Partial<PUTpubkeyJSON> = await body.value;

  if (typeof data.encrypted_rsa_private_key !== 'string'
      || typeof data.encrypted_rsa_private_key_iv !== 'string'
      || typeof data.rsa_public_key !== 'string')
      return ctx.throw(Status.BadRequest, "Bad Request");
  
  await user.addRSAPublicKey({
    encrypted_rsa_private_key: data.encrypted_rsa_private_key,
    encrypted_rsa_private_key_iv: data.encrypted_rsa_private_key_iv,
    rsa_public_key: data.rsa_public_key
  });

  return ctx.response.status = Status.NoContent;
});

interface POSTFilesForm{
  id: string,
  encryptedFile: Uint8Array,
  encryptedFileIVBase64: string,
  encryptedFileKeyBase64: string,
  encryptedFileInfoBase64: string,
  encryptedFileInfoIVBase64: string,
}

router.post("/files", async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get("uid");
  const user = await getUserById(uid);
  if(!user) return ctx.response.status = Status.NoContent;

  // MultipartReader
  const body = ctx.request.body({type: "form-data"});
  const reader = await body.value;
  const data = await reader.read({maxSize: 10000000});
  const receivedFile:Partial<POSTFilesForm> = {};

  receivedFile.id = data.fields.id;
  receivedFile.encryptedFileIVBase64 = data.fields.encryptedFileIVBase64;
  receivedFile.encryptedFileInfoBase64 = data.fields.encryptedFileInfoBase64;
  receivedFile.encryptedFileInfoIVBase64 = data.fields.encryptedFileInfoIVBase64;
  receivedFile.encryptedFileKeyBase64 = data.fields.encryptedFileKeyBase64;

  if(!data.files) return ctx.throw(Status.BadRequest, "Bad Request");

  for(const x of data.files){
    if(x.name === "encryptedFile")
      receivedFile[x.name] = x.content;
  }
  if(receivedFile.id === undefined
    || receivedFile.encryptedFile === undefined
    || receivedFile.encryptedFileIVBase64 === undefined
    || receivedFile.encryptedFileKeyBase64 === undefined
    || receivedFile.encryptedFileInfoBase64 === undefined
    || receivedFile.encryptedFileInfoIVBase64 === undefined)
    return ctx.throw(Status.BadRequest, "Bad Request");

  // save file
  const x = await addFile({
    id: receivedFile.id,
    encrypted_file_iv: receivedFile.encryptedFileIVBase64,
    encrypted_file_info: receivedFile.encryptedFileInfoBase64,
    encrypted_file_info_iv: receivedFile.encryptedFileInfoIVBase64,
    encrypted_file_key: receivedFile.encryptedFileKeyBase64,
    bin: receivedFile.encryptedFile,
    created_by: user,
  });
  console.log(x);

  return ctx.response.status = Status.NoContent;
}); 

export default router;