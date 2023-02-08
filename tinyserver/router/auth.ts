import { base642ByteArray, byteArray2base64, Router, Status, uaparser, z } from '../deps.ts';
import { addEmailConfirmation } from '../model/ConfirmingEmailAddress.ts';
import { addUser, getClientRandomSalt, getUserByEmail, getUserById, userEmailConfirm } from '../model/Users.ts';

const router = new Router();

interface POSTSignUpJSON {
  email: string;
  clientRandomValueBase64: string;
  encryptedMasterKeyBase64: string;
  encryptedMasterKeyIVBase64: string;
  hashedAuthenticationKeyBase64: string;
}

router.post('/signup', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const data: Partial<POSTSignUpJSON> = await body.value;
  if (
    !data ||
    typeof data.email !== 'string' ||
    typeof data.clientRandomValueBase64 !== 'string' ||
    typeof data.encryptedMasterKeyBase64 !== 'string' ||
    typeof data.encryptedMasterKeyIVBase64 !== 'string' ||
    typeof data.hashedAuthenticationKeyBase64 !== 'string'
  ) {
    return ctx.response.status = Status.BadRequest;
  }

  const issuccess = await addUser({
    email: data.email,
    client_random_value: data.clientRandomValueBase64,
    encrypted_master_key: data.encryptedMasterKeyBase64,
    encrypted_master_key_iv: data.encryptedMasterKeyIVBase64,
    hashed_authentication_key: data.hashedAuthenticationKeyBase64,
    max_capacity: 5 * 1024 * 1024, //5n * 1024n * 1024n * 1024n,
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

const POSTEmailConfirmScheme = z.object({
  email: z.string().email(),
  emailConfirmationToken: z.string(),
});

router.post('/email_confirm', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = POSTEmailConfirmScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }
  const data = parsed.data;

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

const GETSaltScheme = z.object({
  email: z.string().email(),
});

// GETではBODYに格納するのが困難
router.post('/salt', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = GETSaltScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }
  const data = parsed.data;

  // OK
  const salt = await getClientRandomSalt(data.email);

  ctx.response.status = Status.OK;
  ctx.response.body = { salt };
  ctx.response.type = 'json';
});

// login
const POSTloginScheme = z.object({
  email: z.string().email(),
  token: z.string(),
  authenticationKeyBase64: z.string(),
});

router.post('/login', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = POSTloginScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }
  const data = parsed.data;

  // OK
  const hashedAuthenticationKey = await crypto.subtle.digest(
    'SHA-256',
    base642ByteArray(data.authenticationKeyBase64),
  );
  const hashed_authentication_key = byteArray2base64(hashedAuthenticationKey);

  const user = await getUserByEmail(data.email);
  // there is no user || same hash?
  if (!user || user.hashed_authentication_key !== hashed_authentication_key) {
    return ctx.response.status = Status.Unauthorized;
  }
  // use totp?
  const confirmTOTP = await user.confirmTOTP(data.token);
  if (!confirmTOTP.success) return ctx.response.status = Status.Unauthorized;

  // login!!
  await ctx.state.session.set('uid', user.id);

  // add clientname
  if (!await ctx.state.session.get('client_name')) {
    const ua = ctx.request.headers.get('user-agent');
    if (ua) {
      const userEnv = uaparser(ua);
      await ctx.state.session.set(
        'client_name',
        `${userEnv.os.name}${userEnv.os.version} ${userEnv.browser.name}`,
      );
    } else {
      await ctx.state.session.set('client_name', `unknown`);
    }
  }

  const result = {
    encryptedMasterKeyBase64: user.encrypted_master_key,
    encryptedMasterKeyIVBase64: user.encrypted_master_key_iv,
    useTwoFactorAuth: confirmTOTP.useTOTP,
    role: user.role,
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
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.NoContent;

  // logout
  await ctx.state.session.set('uid', null);
  ctx.response.status = Status.NoContent;
});

export default router;
