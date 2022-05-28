import { base642ByteArray, byteArray2base64, compareAsc } from '../deps.ts';
import { Router, Status } from '../deps.ts';
import { addEmailConfirmation } from '../model/EmailConfirmations.ts';
import {
  addUser,
  deleteUserById,
  getClientRandomSalt,
  getNumberOfUsers,
  getUserByEmail,
  getUserById,
  getUsers,
  parseUserFilterQuery,
  userEmailConfirm,
  userFieldValidate,
} from '../model/Users.ts';
import { OTPAuth } from '../deps.ts';
import { addFile, getFileById, getFileInfo } from '../model/Files.ts';
import { uaparser } from '../deps.ts';
import SessionsStore from '../model/Sessions.ts';
import { deleteFiles } from '../model/Files.ts';
import { bucket } from '../s3client.ts';
import { addHook, getHook, getHooksList, getNumberOfHooks, HookData, parseHookData } from '../model/Hooks.ts';
import { ExhaustiveError } from '../util.ts';

const router = new Router({ prefix: '/api' });

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
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const data: Partial<POSTEmailConfirmJSON> = await body.value;

  if (
    typeof data.email !== 'string' ||
    typeof data.emailConfirmationToken !== 'string'
  ) {
    return ctx.response.status = Status.BadRequest;
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
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const data: Partial<GETSaltJSON> = await body.value;

  if (typeof data.email !== 'string') {
    return ctx.response.status = Status.BadRequest;
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
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const data: Partial<POSTloginJSON> = await body.value;

  if (
    typeof data.email !== 'string' ||
    typeof data.authenticationKeyBase64 !== 'string' ||
    typeof data.token !== 'string'
  ) {
    return ctx.response.status = Status.BadRequest;
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
    return ctx.response.status = Status.Unauthorized;
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
      return ctx.response.status = Status.Unauthorized;
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
    authority: user.authority,
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
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const data: Partial<POSTAddTwoFactorSecretKeyJSON> = await body.value;

  if (typeof data.secretKey !== 'string' || typeof data.token !== 'string') {
    return ctx.response.status = Status.BadRequest;
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

  if (result === null) return ctx.response.status = Status.BadRequest;

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

// get capacity
interface GETCapacityResultJSON {
  usage: number;
  max_capacity: number;
}

router.get('/user/capacity', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  const usage = user.file_usage;

  // verify body
  const result: GETCapacityResultJSON = {
    usage,
    max_capacity: user.max_capacity,
  };

  ctx.response.status = Status.OK;
  ctx.response.body = result;
  ctx.response.type = 'json';
});

interface PATCHPasswordJSON {
  clientRandomValueBase64: string;
  encryptedMasterKeyBase64: string;
  encryptedMasterKeyIVBase64: string;
  hashedAuthenticationKeyBase64: string;
}

router.patch('/user/password', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  if (!ctx.request.hasBody) return ctx.throw(Status.BadRequest, 'Bad Request');
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.throw(Status.BadRequest, 'Bad Request');

  const data: Partial<PATCHPasswordJSON> = await body.value;
  if (
    !data ||
    typeof data.clientRandomValueBase64 !== 'string' ||
    typeof data.encryptedMasterKeyBase64 !== 'string' ||
    typeof data.encryptedMasterKeyIVBase64 !== 'string' ||
    typeof data.hashedAuthenticationKeyBase64 !== 'string'
  ) {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }

  await user.patchPassword({
    client_random_value: data.clientRandomValueBase64,
    encrypted_master_key: data.encryptedMasterKeyBase64,
    encrypted_master_key_iv: data.encryptedMasterKeyIVBase64,
    hashed_authentication_key: data.hashedAuthenticationKeyBase64,
  });

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
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const data: Partial<PUTpubkeyJSON> = await body.value;

  if (
    typeof data.encryptedRSAPrivateKeyBase64 !== 'string' ||
    typeof data.encryptedRSAPrivateKeyIVBase64 !== 'string' ||
    typeof data.RSAPublicKeyBase64 !== 'string'
  ) {
    return ctx.response.status = Status.BadRequest;
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
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const data: Partial<PATCHsessionsJSON> = await body.value;

  if (!data.clientName) return ctx.response.status = Status.BadRequest;
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
interface POSTFilesFormWithBin {
  id: string;
  encryptedFile: Uint8Array;
  encryptedFileIVBase64: string;
  encryptedFileKeyBase64: string;
  encryptedFileInfoBase64: string;
  encryptedFileInfoIVBase64: string;
}
interface POSTFilesFormWithoutBin {
  id: string;
  encryptedFileKeyBase64: string;
  encryptedFileInfoBase64: string;
  encryptedFileInfoIVBase64: string;
}

type POSTFilesForm = POSTFilesFormWithBin | POSTFilesFormWithoutBin;

router.post('/files', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.NoContent;

  // MultipartReader
  const body = ctx.request.body({ type: 'form-data' });
  const reader = await body.value;
  const data = await reader.read({ maxSize: 10000000 });
  let receivedFile: Partial<POSTFilesFormWithBin> | Partial<POSTFilesFormWithoutBin> = {};
  const { id, encryptedFileIVBase64, encryptedFileInfoBase64, encryptedFileInfoIVBase64, encryptedFileKeyBase64 } =
    data.fields;

  receivedFile = {
    id,
    encryptedFileIVBase64,
    encryptedFileInfoBase64,
    encryptedFileInfoIVBase64,
    encryptedFileKeyBase64,
  };

  if (
    receivedFile.id === undefined ||
    receivedFile.encryptedFileKeyBase64 === undefined ||
    receivedFile.encryptedFileInfoBase64 === undefined ||
    receivedFile.encryptedFileInfoIVBase64 === undefined
  ) {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }

  if (receivedFile.encryptedFileIVBase64) {
    // with bin
    if (!data.files) return ctx.response.status = Status.BadRequest;
    for (const x of data.files) {
      if (x.name === 'encryptedFile' && x.content) {
        receivedFile[x.name] = new Uint8Array(
          x.content.buffer,
          0,
          x.content.buffer.byteLength - 2, // remove CRLF
        );
      }
    }
    if (!receivedFile.encryptedFile) return ctx.response.status = Status.BadRequest;
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
  if (x === null) {
    return ctx.response.status = Status.BadRequest;
  }
  console.log(new Date(), 'save ', x?.id);

  return ctx.response.status = Status.NoContent;
});

interface POSTdeletefilesJSON {
  files: string[];
}

router.post('/files/delete', async (ctx) => {
  // auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify body
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const data: Partial<POSTdeletefilesJSON> = await body.value;

  if (!(data.files instanceof Array)) return ctx.response.status = Status.BadRequest;

  const deletedTarget = data.files.filter((x) => typeof x === 'string');
  const deleted = await deleteFiles(user, deletedTarget);

  ctx.response.status = Status.OK;
  ctx.response.body = { deleted };
  ctx.response.type = 'json';
});

// GET FILEINFO
router.get('/files/:fileid', async (ctx) => {
  const fileinfo = await getFileById(ctx.params.fileid);
  if (!fileinfo) return ctx.response.status = Status.NotFound;

  ctx.response.status = Status.OK;
  ctx.response.body = fileinfo.toSendObj();
  ctx.response.type = 'json';
});

router.get('/files/:fileid/bin', async (ctx) => {
  const result = await bucket.getObject(ctx.params.fileid);
  if (!result) return ctx.response.status = Status.NotFound;

  ctx.response.status = Status.OK;
  ctx.response.body = result.body;
  ctx.response.type = 'application/octet-stream';
});

// ADMIN

interface GETuserlistJSON {
  number_of_user: number;
  users: {
    id: number;
    email: string;
    max_capacity: number;
    file_usage: number;
    authority?: string;
    two_factor_authentication: boolean;
  }[];
}

router.get('/users', async (ctx) => {
  // admin auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user || user.authority !== 'ADMIN') return ctx.response.status = Status.Forbidden;

  // validate
  const prmoffset: number = parseInt(ctx.request.url.searchParams.get('offset') ?? '0', 10);
  const prmlimit: number = parseInt(ctx.request.url.searchParams.get('limit') ?? '10', 10);
  const offset = isNaN(prmoffset) ? 0 : prmoffset;
  const limit = isNaN(prmlimit) ? 10 : prmlimit;
  const orderBy = userFieldValidate(ctx.request.url.searchParams.get('orderby'));
  const order = ctx.request.url.searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  const queryFilter = parseUserFilterQuery(ctx.request.url.searchParams.get('q') ?? '');

  // get
  const number_of_users = getNumberOfUsers();
  const list = (await getUsers({ offset, limit, orderBy, order, queryFilter })).map((
    user,
  ): GETuserlistJSON['users'][0] => user.value());

  const result: GETuserlistJSON = {
    number_of_user: await number_of_users,
    users: list,
  };
  ctx.response.status = Status.OK;
  ctx.response.body = result;
  ctx.response.type = 'json';
});

router.delete('/user/:id', async (ctx) => {
  // admin auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user || user.authority !== 'ADMIN') return ctx.response.status = Status.Forbidden;

  const id = parseInt(ctx.params.id);

  // can't remove me
  if (user.id === id) return ctx.response.status = Status.BadRequest;

  const result = await deleteUserById(id);
  if (!result.success) return ctx.response.status = Status.BadRequest;
  ctx.response.status = Status.NoContent;
  ctx.response.type = 'json';
});

interface PATCHUserJSON {
  max_capacity: number;
  two_factor_authentication: boolean;
}

router.patch('/user/:id', async (ctx) => {
  // admin auth
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user || user.authority !== 'ADMIN') return ctx.response.status = Status.Forbidden;

  const id = parseInt(ctx.params.id);

  // validate request
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const bodyvalue: Partial<PATCHUserJSON> = await body.value;
  if (
    !(typeof bodyvalue.max_capacity === 'number' || typeof bodyvalue.max_capacity === 'undefined') ||
    !(bodyvalue.two_factor_authentication === false || typeof bodyvalue.two_factor_authentication === 'undefined')
  ) {
    return ctx.response.status = Status.BadRequest;
  }

  const targetUser = await getUserById(id);
  const result = await targetUser?.patch(bodyvalue);

  if (!result) return ctx.response.status = Status.BadRequest;
  ctx.response.status = Status.NoContent;
});

// hook

interface POSThooksJSON {
  name: string;
  data: HookData;
  expired_at?: string;
}

router.post('/hooks', async (ctx) => {
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.Forbidden;
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  // validate
  const bodyvalue: Partial<POSThooksJSON> = await body.value;
  if (typeof bodyvalue.name !== 'string' || typeof bodyvalue.data !== 'object') {
    return ctx.response.status = Status.BadRequest;
  }
  const data = parseHookData(bodyvalue.data);
  if (!data || data.method === 'NONE') return ctx.response.status = Status.BadRequest;

  const result = await addHook({
    name: bodyvalue.name,
    data,
    user_id: user.id,
    expired_at: bodyvalue.expired_at ? new Date(bodyvalue.expired_at) : undefined,
  });
  ctx.response.status = Status.OK;
  ctx.response.body = result.value();
  ctx.response.type = 'json';
});

router.get('/hooks', async (ctx) => {
  const uid: number | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.Forbidden;
  // validate
  const prmoffset: number = parseInt(ctx.request.url.searchParams.get('offset') ?? '0', 10);
  const prmlimit: number = parseInt(ctx.request.url.searchParams.get('limit') ?? '10', 10);
  const offset = isNaN(prmoffset) ? 0 : prmoffset;
  const limit = isNaN(prmlimit) ? 10 : prmlimit;

  const list = getHooksList(user.id, offset, limit);
  const getSizeOfHooks = getNumberOfHooks(user.id);

  const result = {
    number_of_hook: await getSizeOfHooks,
    hooks: (await list).map((hook) => hook.value()),
  };

  ctx.response.status = Status.OK;
  ctx.response.body = result;
  ctx.response.type = 'json';
});

router.post('/hook/:id', async (ctx) => {
  const hook = await getHook(ctx.params.id);
  console.log(hook?.value());
  if (
    !hook ||
    (hook.expired_at && compareAsc(hook.expired_at, new Date(Date.now())) < 0)
  ) {
    return ctx.response.status = Status.Forbidden;
  }

  switch (hook.data.method) {
    case 'USER_DELETE': {
      const result = await deleteUserById(typeof hook.user_id === 'number' ? hook.user_id : hook.user_id.id);
      if (!result.success) return ctx.response.status = Status.BadRequest;
      break;
    }
    case 'NONE': {
      break;
    }
    default:
      throw new ExhaustiveError(hook.data);
  }

  ctx.response.status = Status.OK;
});

export default router;
