import { OTPAuth, Router, Status, z } from 'tinyserver/deps.ts';
import { getUserById, mfaColumnsSchema, parseMFAFilterQuery } from 'tinyserver/src/model/Users.ts';
import { getFileInfo } from 'tinyserver/src/model/Files.ts';
import SessionsStore from 'tinyserver/src/model/Sessions.ts';
import { prisma } from '../../client/dbclient.ts';

const router = new Router({ prefix: '/my' });

// each user

const POSTAddTOTPSecretKeyScheme = z.object({
  secretKey: z.string(),
  token: z.string(),
});

router.put('/totp', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify body
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const parsed = POSTAddTOTPSecretKeyScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }

  const data = parsed.data;
  // verify token
  const totp = new OTPAuth.TOTP({
    issuer: 'E2EEncloud',
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

  const date = (new Date()).toLocaleString();
  await user.addTOTP({ key: data.secretKey, name: `${date}に追加したTOTPキー` });

  return ctx.response.status = Status.NoContent;
});

router.delete('/totp', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify token
  await user.deleteTOTPAll();

  return ctx.response.status = Status.NoContent;
});

// get capacity
interface GETCapacityResultJSON {
  usage: string;
  max_capacity: string;
}

router.get('/capacity', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  const usage = user.file_usage;

  // verify body
  const result: GETCapacityResultJSON = {
    usage: usage.toString(),
    max_capacity: user.max_capacity.toString(),
  };

  ctx.response.status = Status.OK;
  ctx.response.body = result;
  ctx.response.type = 'json';
});

const PATCHPasswordScheme = z.object({
  clientRandomValueBase64: z.string(),
  encryptedMasterKeyBase64: z.string(),
  encryptedMasterKeyIVBase64: z.string(),
  hashedAuthenticationKeyBase64: z.string(),
});
interface PATCHPasswordJSON {
  clientRandomValueBase64: string;
  encryptedMasterKeyBase64: string;
  encryptedMasterKeyIVBase64: string;
  hashedAuthenticationKeyBase64: string;
}

router.patch('/password', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  if (!ctx.request.hasBody) return ctx.throw(Status.BadRequest, 'Bad Request');
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.throw(Status.BadRequest, 'Bad Request');

  const parsed = PATCHPasswordScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }
  const data = parsed.data;

  await user.patchPassword({
    client_random_value: data.clientRandomValueBase64,
    encrypted_master_key: data.encryptedMasterKeyBase64,
    encrypted_master_key_iv: data.encryptedMasterKeyIVBase64,
    hashed_authentication_key: data.hashedAuthenticationKeyBase64,
  });

  return ctx.response.status = Status.NoContent;
});

// ADD public key

const PUTpubkeyScheme = z.object({
  encryptedRSAPrivateKeyBase64: z.string(),
  encryptedRSAPrivateKeyIVBase64: z.string(),
  RSAPublicKeyBase64: z.string(),
});
router.put('/pubkey', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify body
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = PUTpubkeyScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }

  const data = parsed.data;
  await user.addRSAPublicKey({
    encrypted_rsa_private_key: data.encryptedRSAPrivateKeyBase64,
    encrypted_rsa_private_key_iv: data.encryptedRSAPrivateKeyIVBase64,
    rsa_public_key: data.RSAPublicKeyBase64,
  });

  return ctx.response.status = Status.NoContent;
});

router.get('/files', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');
  const files = (await getFileInfo(user.id)).map((x) => x.toSendObj());

  ctx.response.status = Status.OK;
  ctx.response.body = files;
  ctx.response.type = 'json';
});

router.get('/sessions', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const me: string = await ctx.state.session.get('id');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');
  const sessions = (await SessionsStore.getSessionsByUserId(user.id)).map((
    x,
  ) => ({
    id: x.id,
    clientName: x.client_name,
    accessed: x._accessed,
    isMe: x.id === me,
  }));

  ctx.response.status = Status.OK;
  ctx.response.body = sessions;
  ctx.response.type = 'json';
});

const PATCHSessionsScheme = z.object({
  clientName: z.string(),
});

router.patch('/sessions', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);

  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify body
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = PATCHSessionsScheme.safeParse(await body.value);
  if (!parsed.success) return ctx.response.status = Status.BadRequest;

  const data = parsed.data;
  await ctx.state.session.set('client_name', data.clientName);
  ctx.response.status = Status.NoContent;
});

router.delete('/sessions/:id', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);

  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  const id = ctx.params.id;

  SessionsStore.deleteSessionById(id, user.id);

  ctx.response.status = Status.NoContent;
  ctx.response.type = 'json';
});

router.get('/mfa', async (ctx) => {
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.Forbidden;
  // validate
  const prmoffset: number = parseInt(
    ctx.request.url.searchParams.get('offset') ?? '0',
    10,
  );
  const prmlimit: number = parseInt(
    ctx.request.url.searchParams.get('limit') ?? '10',
    10,
  );
  const offset = isNaN(prmoffset) ? 0 : prmoffset;
  const limit = isNaN(prmlimit) ? 10 : prmlimit;
  const orderBy = mfaColumnsSchema.default('id').parse(ctx.request.url.searchParams.get('orderby') ?? undefined);

  const order = ctx.request.url.searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  const queryFilter = {
    ...parseMFAFilterQuery(
      ctx.request.url.searchParams.get('q') ?? '',
    ),
    user_id: user.id,
  };

  const [list, getSizeOfHooks] = await Promise.all([
    user.getMFAList({
      offset,
      limit,
      order,
      orderBy,
      queryFilter,
      select: {
        id: true,
        type: true,
        name: true,
        available: true,
      },
    }),
    user.getNumberOfMFAs(queryFilter),
  ]);
  const result = {
    number_of_mfa: getSizeOfHooks,
    mfa: list,
  };

  ctx.response.status = Status.OK;
  ctx.response.body = result;
  ctx.response.type = 'json';
});

router.patch('/mfa/:id', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);

  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify body
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = z.object({ available: z.boolean(), name: z.string() }).partial().safeParse(await body.value);
  if (!parsed.success) return ctx.response.status = Status.BadRequest;

  const id = ctx.params.id;

  await prisma.mFASolution.update({
    where: {
      id,
    },
    data: {
      available: parsed.data.available,
      name: parsed.data.name,
    },
  });
  ctx.response.status = Status.NoContent;
});

router.delete('/mfa/:id', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);

  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  const id = ctx.params.id;

  await prisma.mFASolution.delete({
    where: {
      id,
    },
  });
  ctx.response.status = Status.NoContent;
});

export default router;
