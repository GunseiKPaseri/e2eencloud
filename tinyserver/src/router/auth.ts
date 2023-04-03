import {
  base642ByteArray,
  byteArray2base64,
  RouteParams,
  Router,
  RouterContext,
  Status,
  uaparser,
  z,
} from 'tinyserver/deps.ts';
import { addEmailConfirmation } from 'tinyserver/src/model/ConfirmingEmailAddress.ts';
import {
  emailConfirmScheme,
  getClientRandomSalt,
  getUserByEmail,
  getUserById,
  User,
  userEmailConfirm,
} from 'tinyserver/src/model/Users.ts';
import { prisma } from 'tinyserver/src/client/dbclient.ts';

const router = new Router();

const postSignUpScheme = z.object({
  email: z.string().email(),
});

router.post('/signup', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const data = postSignUpScheme.safeParse(await body.value);
  if (!data.success) {
    return ctx.response.status = Status.BadRequest;
  }

  const email = data.data.email.toLowerCase();
  const cnt = await prisma.user.count({ where: { email } });
  if (cnt === 0) {
    console.log('send mail to ' + data.data.email);
    // remove await => queue
    await addEmailConfirmation(data.data.email);
  }

  ctx.response.status = Status.OK;
  ctx.response.body = { success: true };
  ctx.response.type = 'json';
  return;
});

router.post('/email_confirm', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = emailConfirmScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }
  const data = parsed.data;

  // OK
  const result = await userEmailConfirm(data);

  ctx.response.type = 'json';
  ctx.response.status = Status.OK;
  console.log(result);

  // if add user.. login
  if (typeof result !== 'boolean') {
    await ctx.state.session.set('uid', result.id);
    // same as login
    ctx.response.body = {
      success: true,
      user: {
        email: result.email,
        encryptedMasterKeyBase64: result.encrypted_master_key,
        encryptedMasterKeyIVBase64: result.encrypted_master_key_iv,
        useMultiFactorAuth: false,
        role: result.role,
        encryptedRSAPrivateKeyBase64: result.encrypted_rsa_private_key,
        encryptedRSAPrivateKeyIVBase64: result.encrypted_rsa_private_key_iv,
        RSAPublicKeyBase64: result.rsa_public_key,
      },
      storage: {
        usage: '' + result.file_usage,
        max_capacity: '' + result.max_capacity,
      },
    };
  } else {
    ctx.response.body = { success: result };
  }
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
  authenticationKeyBase64: z.string(),
});

export const login = async <R extends string>(props: {
  // deno-lint-ignore no-explicit-any
  ctx: RouterContext<R, RouteParams<R>, Record<string, any>>;
  user: User;
}) => {
  const { ctx, user } = props;
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
    success: true,
    email: user.email,
    encryptedMasterKeyBase64: user.encrypted_master_key,
    encryptedMasterKeyIVBase64: user.encrypted_master_key_iv,
    useMultiFactorAuth: false,
    role: user.role,
    encryptedRSAPrivateKeyBase64: user.encrypted_rsa_private_key,
    encryptedRSAPrivateKeyIVBase64: user.encrypted_rsa_private_key_iv,
    RSAPublicKeyBase64: user.rsa_public_key,
  };
  ctx.response.status = Status.OK;
  ctx.response.body = result;
  ctx.response.type = 'json';
};

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
  // use mfa?
  const usingMFA = await user.usingMFA();
  if (usingMFA.length > 0) {
    await ctx.state.session.set('mfa_uid', user.id);
    ctx.response.status = Status.OK;
    ctx.response.body = {
      success: false,
      suggestedSolution: usingMFA,
    };
    ctx.response.type = 'json';
    return;
  }
  login({ ctx, user });
});

// login
const POSTtotploginScheme = z.object({
  token: z.string(),
});

router.post('/totplogin', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const parsed = POSTtotploginScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }
  const data = parsed.data;

  // use mfa_uid
  const mfauid: string | null = await ctx.state.session.get('mfa_uid');
  if (typeof mfauid !== 'string') return ctx.response.status = Status.Forbidden;

  const user = await getUserById(mfauid);
  if (user === null) return ctx.response.status = Status.Forbidden;

  const confirmTOTP = await user.confirmTOTP(data.token);
  if (!confirmTOTP.success) return ctx.response.status = Status.Unauthorized;

  login({ ctx, user });
});

// mfacode
const POSTmfaloginScheme = z.object({
  mfacode: z.string(),
});

router.post('/mfacode', async (ctx) => {
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const parsed = POSTmfaloginScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }
  const data = parsed.data;

  // use mfa_uid
  const mfauid: string | null = await ctx.state.session.get('mfa_uid');
  if (typeof mfauid !== 'string') return ctx.response.status = Status.Forbidden;

  const user = await getUserById(mfauid);
  if (user === null) return ctx.response.status = Status.Forbidden;

  const confirmMFACode = await user.confirmMFACode(data.mfacode);
  if (!confirmMFACode) return ctx.response.status = Status.Unauthorized;

  login({ ctx, user });
});

router.post('/mfacancel', async (ctx) => {
  // mfa delete
  await ctx.state.session.set('mfa_uid', null);
  ctx.response.status = Status.NoContent;
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
