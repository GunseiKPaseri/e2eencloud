import {
  base642ByteArray,
  byteArray2base64,
  Fido2AssertionResult,
  Router,
  SERVER_URI,
  Status,
  z,
} from '../../../deps.ts';
import { prisma } from '../../client/dbclient.ts';
import { getUserById } from '../../model/Users.ts';
import { f2l, type FIDO2DB, FIDO2DBSchema } from '../../utils/fido2.ts';
import parseJSONwithoutErr from '../../utils/parseJSONWithoutErr.ts';
import { login } from '../auth.ts';

const router = new Router({ prefix: '/fido2' });

// get regist authkey
router.get('/attestation', async (ctx) => {
  // auth only user
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.Forbidden;

  const attestationOptionsOrigin = await f2l.attestationOptions() as {
    rp: { name: string; id: string; icon: string };
    user: { [key: string]: never };
    challenge: ArrayBuffer;
  };

  const attestationOptions = {
    ...attestationOptionsOrigin,
    challenge: byteArray2base64(attestationOptionsOrigin.challenge),
    user: {
      id: user.id,
      displayName: user.email,
      name: user.email,
    },
  };
  //console.log(attestationOptions);
  // add challenge
  await ctx.state.session.set('challenge', attestationOptions.challenge);
  ctx.response.status = Status.OK;
  ctx.response.body = attestationOptions;
  ctx.response.type = 'json';
});

const FIDO2RegistSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  type: z.string(),
  response: z.object({
    attestationObject: z.string(),
    clientDataJSON: z.string(),
  }).optional(),
});

// push regist
router.post('/attestation', async (ctx) => {
  // auth only user
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.Forbidden;
  // use challenge
  const challenge: string | null = await ctx.state.session.get('challenge');
  if (typeof challenge !== 'string') return ctx.response.status = Status.Forbidden;

  // parse
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const result = FIDO2RegistSchema.safeParse(await body.value);
  if (!result.success) return ctx.response.status = Status.BadRequest;
  const request = {
    ...result.data,
    rawId: base642ByteArray(result.data.rawId).buffer,
    response: result.data.response
      ? {
        attestationObject: base642ByteArray(result.data.response.attestationObject).buffer,
        clientDataJSON: base642ByteArray(result.data.response.clientDataJSON).buffer,
      }
      : undefined,
  };

  const attestationExpectations = {
    challenge,
    origin: SERVER_URI,
    factor: 'either',
  };

  const regResult = await f2l.attestationResult(
    request,
    attestationExpectations,
  );

  const credId = byteArray2base64(regResult.authnrData?.get('credId'));
  const counter = regResult.authnrData?.get('counter');

  const date = (new Date()).toLocaleString();
  const _re = await prisma.mFASolution.create({
    data: {
      id: credId,
      name: `${date}に追加したセキュリティデバイス`,
      type: 'FIDO2',
      user_id: user.id,
      available: true,
      value: JSON.stringify(
        {
          publicKey: regResult.authnrData?.get('credentialPublicKeyPem'),
          counter,
          fmt: regResult.authnrData?.get('fmt'),
        } satisfies FIDO2DB,
      ),
    },
  });

  ctx.response.status = Status.OK;
});

// test

router.post('/assertion/options', async (ctx) => {
  // // parse
  // if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  // const body = ctx.request.body();
  // if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  // const result = FIDO2AssertionSchema.safeParse(await body.value);
  // if (!result.success) return ctx.response.status = Status.BadRequest;
  // const request = result.data;
  // use mfa_uid
  const mfauid: string | null = await ctx.state.session.get('mfa_uid');
  if (typeof mfauid !== 'string') return ctx.response.status = Status.Forbidden;

  // select user
  const user = await getUserById(mfauid);
  if (!user) return ctx.response.status = Status.Forbidden;

  const assertionOptionsOrigin = await f2l.assertionOptions() as {
    extensions: Record<string, never>;
    challenge: ArrayBuffer;
  };
  // select credential
  const allowCredentialsOrigin = await prisma.mFASolution.findMany({
    select: { id: true },
    where: {
      type: 'FIDO2',
      user_id: user.id,
      available: true,
    },
  });
  const allowCredentials = allowCredentialsOrigin.map((x: { id: string }) => ({
    type: 'public-key',
    id: x.id,
    transports: ['usb', 'nfc', 'ble', 'internal'] as const,
  }));
  const assertionOptions = {
    ...assertionOptionsOrigin,
    allowCredentials,
    challenge: byteArray2base64(assertionOptionsOrigin.challenge),
  };

  await ctx.state.session.set('challenge', assertionOptions.challenge);
  ctx.response.status = Status.OK;
  ctx.response.body = assertionOptions;
});

const FIDO2AssertionResultSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  type: z.literal('public-key'),
  response: z.object({
    authenticatorData: z.string(),
    clientDataJSON: z.string(),
    signature: z.string(),
    userHandle: z.string(),
  }),
});

router.post('/assertion/result', async (ctx) => {
  // use challenge
  const challenge: string | null = await ctx.state.session.get('challenge');
  if (typeof challenge !== 'string') return ctx.response.status = Status.Forbidden;
  // use mfa_uid
  const challengeUID: string | null = await ctx.state.session.get('mfa_uid');
  if (typeof challengeUID !== 'string') return ctx.response.status = Status.Forbidden;

  // parse
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const result = FIDO2AssertionResultSchema.safeParse(await body.value);
  if (!result.success) return ctx.response.status = Status.BadRequest;
  const request = result.data;

  console.log(challengeUID);
  const attestationOrigin = await prisma.mFASolution.findFirst({
    select: {
      id: true,
      value: true,
    },
    where: {
      id: request.rawId,
      user_id: challengeUID,
      type: 'FIDO2',
      available: true,
    },
  });
  if (!attestationOrigin) return ctx.response.status = Status.BadRequest;
  const attestationValue = FIDO2DBSchema.safeParse(parseJSONwithoutErr(attestationOrigin.value));
  if (!attestationValue.success) return ctx.response.status = Status.BadRequest;
  const attestation = { id: base642ByteArray(request.rawId).buffer, ...attestationValue.data };
  const assertionExpectations = {
    challenge: challenge,
    origin: SERVER_URI,
    factor: 'either',
    publicKey: attestation.publicKey,
    prevCounter: attestation.counter,
    userHandle: request.response.userHandle,
  };

  const authnResult = await f2l.assertionResult(
    {
      id: request.id,
      rawId: base642ByteArray(request.rawId).buffer,
      response: request.response,
    },
    assertionExpectations,
  );

  if (!(authnResult as Fido2AssertionResult & { audit?: { complete?: boolean } })?.audit?.complete) {
    return ctx.response.status = Status.BadRequest;
  }
  const nextCounter = authnResult.authnrData?.get('counter');
  await prisma.mFASolution.update({
    where: {
      id: request.rawId,
    },
    data: {
      value: JSON.stringify(
        {
          ...attestationValue.data,
          counter: nextCounter,
        } satisfies FIDO2DB,
      ),
    },
  });
  const user = await getUserById(challengeUID);
  if (user === null) return ctx.response.status = Status.BadRequest;
  login({ ctx, user });
});

export default router;
