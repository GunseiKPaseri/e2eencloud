import { decode as base642ByteArray, encode as byteArray2base64 } from 'https://deno.land/std/encoding/base64.ts';
import { Router, Status } from 'https://deno.land/x/oak@v10.1.0/mod.ts';
import { addEmailConfirmation } from '../model/EmailConfirmations.ts';
import { addUser, getClientRandomSalt, getUserByEmail, getUserById, userEmailConfirm } from '../model/Users.ts';
// @deno-types="https://deno.land/x/otpauth/dist/otpauth.d.ts"
import * as OTPAuth from 'https://deno.land/x/otpauth/dist/otpauth.esm.js';
import { addFile, getFileById, getFileInfo } from '../model/Files.ts';

// @deno-types="https://cdn.skypack.dev/@types/ua-parser-js?dts"
import uaparser from 'https://cdn.skypack.dev/ua-parser-js@1.0.2?dts';
import SessionsStore from '../model/Sessions.ts';

const router = new Router({ prefix: '/api' });

interface POSTSignUpJSON {
  email: string;
  clientRandomValueBase64: string;
  encryptedMasterKeyBase64: string;
  encryptedMasterKeyIVBase64: string;
  hashedAuthenticationKeyBase64: string;
}

router.post('/signup', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.throw(Status.BadRequest, 'Bad Request');
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.throw(Status.BadRequest, 'Bad Request');
  const data: Partial<POSTSignUpJSON> = await body.value;
  if (
    !data ||
    typeof data.email !== 'string' ||
    typeof data.clientRandomValueBase64 !== 'string' ||
    typeof data.encryptedMasterKeyBase64 !== 'string' ||
    typeof data.encryptedMasterKeyIVBase64 !== 'string' ||
    typeof data.hashedAuthenticationKeyBase64 !== 'string'
  ) {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }

  const issuccess = await addUser({
    email: data.email,
    client_random_value: data.clientRandomValueBase64,
    encrypted_master_key: data.encryptedMasterKeyBase64,
    encrypted_master_key_iv: data.encryptedMasterKeyIVBase64,
    hashed_authentication_key: data.hashedAuthenticationKeyBase64,
  });
  console.log(issuccess);
  if (issuccess) {
    // 128 bit email confirmation token
    const email_confirmation_token = crypto.getRandomValues(new Uint8Array(16));
    const token = byteArray2base64(email_confirmation_token);
    await addEmailConfirmation(data.email, token);
    console.log('SEND<', data.email, '> ', token);
  }
  // userがそのメールアドレスが登録済か知る必要はない
  ctx.response.status = Status.OK;
  ctx.response.body = { success: true };
  ctx.response.type = 'json';
  return;
});

interface POSTEmailConfirmJSON {
  email: string;
  emailConfirmationToken: string;
}

router.post('/email_confirm', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.throw(Status.BadRequest, 'Bad Request');
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.throw(Status.BadRequest, 'Bad Request');
  const data: Partial<POSTEmailConfirmJSON> = await body.value;

  if (
    typeof data.email !== 'string' ||
    typeof data.emailConfirmationToken !== 'string'
  ) {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }

  // OK
  const status = await userEmailConfirm(
    data.email,
    data.emailConfirmationToken,
  );

  // login
  const user = await getUserByEmail(data.email);
  if (!user) throw new Error('Why!!');
  await ctx.state.session.set('uid', user.id);

  ctx.response.status = Status.OK;
  ctx.response.body = { success: status };
  ctx.response.type = 'json';
});

// client random salt

interface GETSaltJSON {
  email: string;
}

// GETではBODYに格納するのが困難
router.post('/salt', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.throw(Status.BadRequest, 'Bad Request');
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.throw(Status.BadRequest, 'Bad Request');
  const data: Partial<GETSaltJSON> = await body.value;

  if (typeof data.email !== 'string') {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }

  // OK
  const salt = await getClientRandomSalt(data.email);

  ctx.response.status = Status.OK;
  ctx.response.body = { salt };
  ctx.response.type = 'json';
});

// login
interface POSTloginJSON {
  email: string;
  token: string;
  authenticationKeyBase64: string;
}

router.post('/login', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.throw(Status.BadRequest, 'Bad Request');
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.throw(Status.BadRequest, 'Bad Request');
  const data: Partial<POSTloginJSON> = await body.value;

  if (
    typeof data.email !== 'string' ||
    typeof data.authenticationKeyBase64 !== 'string' ||
    typeof data.token !== 'string'
  ) {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }

  // OK
  const hashedAuthenticationKey = await crypto.subtle.digest(
    'SHA-256',
    base642ByteArray(data.authenticationKeyBase64),
  );
  const hashed_authentication_key = byteArray2base64(hashedAuthenticationKey);

  const user = await getUserByEmail(data.email);
  // there is no user || same hash?
  if (!user || user.hashed_authentication_key !== hashed_authentication_key) {
    return ctx.throw(Status.Unauthorized, 'Unauthorized');
  }
  // use totp?
  if (user.two_factor_authentication_secret_key) {
    const totp = new OTPAuth.TOTP({
      issuer: 'E2EE',
      label: `${user.email}`,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: user.two_factor_authentication_secret_key,
    });
    if (totp.validate({ token: data.token, window: 1 }) === null) {
      return ctx.throw(Status.Unauthorized, 'Unauthorized');
    }
  }
  // login!!
  await ctx.state.session.set('uid', user.id);

  // add clientname
  if (!await ctx.state.session.get('client_name')) {
    const ua = ctx.request.headers.get('user-agent');
    if (ua) {
      const userEnv = uaparser(ua);
      await ctx.state.session.set('client_name', `${userEnv.os.name}${userEnv.os.version} ${userEnv.browser.name}`);
    } else {
      await ctx.state.session.set('client_name', `unknown`);
    }
  }

  const result = {
    encryptedMasterKeyBase64: user.encrypted_master_key,
    encryptedMasterKeyIVBase64: user.encrypted_master_key_iv,
    useTwoFactorAuth: user.two_factor_authentication_secret_key !== null,
  };
  const result_rsa_key = {
    encryptedRSAPrivateKeyBase64: user.encrypted_rsa_private_key,
    encryptedRSAPrivateKeyIVBase64: user.encrypted_rsa_private_key_iv,
    RSAPublicKeyBase64: user.rsa_public_key,
  };
  ctx.response.status = Status.OK;
  ctx.response.body = result_rsa_key.RSAPublicKeyBase64 ? { ...result, ...result_rsa_key } : result;
  ctx.response.type = 'json';
});

router.post('/logout', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.NoContent;

  // logout
  await ctx.state.session.set('uid', null);
  ctx.response.status = Status.NoContent;
});

// user

interface POSTAddTwoFactorSecretKeyJSON {
  secretKey: string;
  token: string;
}

router.put('/user/totp', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify body
  if (!ctx.request.hasBody) return ctx.throw(Status.BadRequest, 'Bad Request');
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.throw(Status.BadRequest, 'Bad Request');
  const data: Partial<POSTAddTwoFactorSecretKeyJSON> = await body.value;

  if (typeof data.secretKey !== 'string' || typeof data.token !== 'string') {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }

  // verify token
  const totp = new OTPAuth.TOTP({
    issuer: 'E2EE',
    label: `${user.email}`,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: data.secretKey,
  });
  const result = totp.validate({
    token: data.token,
    window: 1,
  });

  if (result === null) return ctx.throw(Status.BadRequest, 'Bad Token');

  await user.addTwoFactorAuthSecretKey(data.secretKey);

  return ctx.response.status = Status.NoContent;
});

router.delete('/user/totp', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify token
  await user.addTwoFactorAuthSecretKey(null);

  return ctx.response.status = Status.NoContent;
});

// ADD public key

interface PUTpubkeyJSON {
  encryptedRSAPrivateKeyBase64: string;
  encryptedRSAPrivateKeyIVBase64: string;
  RSAPublicKeyBase64: string;
}
router.put('/user/pubkey', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify body
  if (!ctx.request.hasBody) return ctx.throw(Status.BadRequest, 'Bad Request');
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.throw(Status.BadRequest, 'Bad Request');
  const data: Partial<PUTpubkeyJSON> = await body.value;

  if (
    typeof data.encryptedRSAPrivateKeyBase64 !== 'string' ||
    typeof data.encryptedRSAPrivateKeyIVBase64 !== 'string' ||
    typeof data.RSAPublicKeyBase64 !== 'string'
  ) {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }

  await user.addRSAPublicKey({
    encrypted_rsa_private_key: data.encryptedRSAPrivateKeyBase64,
    encrypted_rsa_private_key_iv: data.encryptedRSAPrivateKeyIVBase64,
    rsa_public_key: data.RSAPublicKeyBase64,
  });

  return ctx.response.status = Status.NoContent;
});

router.get('/user/files', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');
  const files = (await getFileInfo(user.id)).map((x) => x.toSendObj());

  ctx.response.status = Status.OK;
  ctx.response.body = files;
  ctx.response.type = 'json';
});

router.get('/user/sessions', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const me: string = await ctx.state.session.get('id');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');
  const sessions = (await SessionsStore.getSessionsByUserId(user.id)).map((x) => ({
    id: x.id,
    clientName: x.data.client_name,
    accessed: x.data._accessed,
    isMe: x.id === me,
  }));

  ctx.response.status = Status.OK;
  ctx.response.body = sessions;
  ctx.response.type = 'json';
});

interface PATCHsessionsJSON {
  clientName?: string;
}

router.patch('/user/sessions', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);

  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify body
  if (!ctx.request.hasBody) return ctx.throw(Status.BadRequest, 'Bad Request');
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.throw(Status.BadRequest, 'Bad Request');
  const data: Partial<PATCHsessionsJSON> = await body.value;

  if (!data.clientName) return ctx.throw(Status.BadRequest, 'BadRequest');
  await ctx.state.session.set('client_name', data.clientName);
  ctx.response.status = Status.NoContent;
});

router.delete('/user/sessions/:id', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);

  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  const id = ctx.params.id;

  SessionsStore.deleteSessionById(id, user.id);

  ctx.response.status = Status.NoContent;
  ctx.response.type = 'json';
});

// ADD FILE
interface POSTFilesForm {
  id: string;
  encryptedFile: Uint8Array;
  encryptedFileIVBase64: string;
  encryptedFileKeyBase64: string;
  encryptedFileInfoBase64: string;
  encryptedFileInfoIVBase64: string;
}

router.post('/files', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.NoContent;

  // MultipartReader
  const body = ctx.request.body({ type: 'form-data' });
  const reader = await body.value;
  const data = await reader.read({ maxSize: 10000000 });
  const receivedFile: Partial<POSTFilesForm> = {};

  receivedFile.id = data.fields.id;
  receivedFile.encryptedFileIVBase64 = data.fields.encryptedFileIVBase64;
  receivedFile.encryptedFileInfoBase64 = data.fields.encryptedFileInfoBase64;
  receivedFile.encryptedFileInfoIVBase64 = data.fields.encryptedFileInfoIVBase64;
  receivedFile.encryptedFileKeyBase64 = data.fields.encryptedFileKeyBase64;

  if (!data.files) return ctx.throw(Status.BadRequest, 'Bad Request');

  for (const x of data.files) {
    if (x.name === 'encryptedFile' && x.content) {
      receivedFile[x.name] = new Uint8Array(
        x.content.buffer,
        0,
        x.content.buffer.byteLength - 2,
      ); // remove CRLF
    }
  }
  if (
    receivedFile.id === undefined ||
    receivedFile.encryptedFile === undefined ||
    receivedFile.encryptedFileIVBase64 === undefined ||
    receivedFile.encryptedFileKeyBase64 === undefined ||
    receivedFile.encryptedFileInfoBase64 === undefined ||
    receivedFile.encryptedFileInfoIVBase64 === undefined
  ) {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }

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
  console.log('save ', x?.id);

  return ctx.response.status = Status.NoContent;
});

// GET FILEINFO
router.get('/files/:fileid', async (ctx) => {
  const fileinfo = await getFileById(ctx.params.fileid);
  if (!fileinfo) return ctx.throw(Status.NotFound, 'Not Found');

  ctx.response.status = Status.OK;
  ctx.response.body = fileinfo.toSendObj();
  ctx.response.type = 'json';
});

export default router;
