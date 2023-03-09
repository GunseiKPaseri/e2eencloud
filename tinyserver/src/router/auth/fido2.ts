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
      email: user.email,
    },
  };
  console.log(attestationOptions);
  // add challenge
  await ctx.state.session.set('challenge', attestationOptions.challenge);
  ctx.response.status = Status.OK;
  ctx.response.body = attestationOptions;
  ctx.response.type = 'json';
});

const FIDO2RegistSchema = z.object({
  id: z.string(),
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
  const request = result.data;

  const attestationExpectations = {
    challenge,
    origin: SERVER_URI,
    factor: 'either',
  };

  const regResult = await f2l.attestationResult(
    { ...request, rawId: base642ByteArray(request.id) },
    attestationExpectations,
  );

  console.log(regResult);

  const credId = byteArray2base64(regResult.authnrData?.get('credId'));
  const counter = regResult.authnrData?.get('counter');

  const _re = await prisma.tFASolution.create({
    data: {
      id: credId,
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

const FIDO2AssertionSchema = z.object({
  id: z.string(),
});

router.post('/assertion/options', async (ctx) => {
  // parse
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const result = FIDO2AssertionSchema.safeParse(await body.value);
  if (!result.success) return ctx.response.status = Status.BadRequest;
  const request = result.data;

  // select user
  const user = await getUserById(request.id);
  if (!user) return ctx.response.status = Status.Forbidden;

  const assertionOptionsOrigin = await f2l.assertionOptions() as {
    extensions: Record<string, never>;
    challenge: ArrayBuffer;
  };
  console.log(assertionOptionsOrigin);

  // select credential
  const allowCredentials = (await prisma.tFASolution.findMany({
    select: { id: true },
    where: {
      type: 'FIDO2',
      user_id: user.id,
      available: true,
    },
  })).map((x) => ({
    type: 'public-key',
    id: x.id,
    transports: ['usb', 'nfc', 'ble'] as const,
  }));
  const assertionOptions = {
    ...assertionOptionsOrigin,
    allowCredentials,
    challenge: byteArray2base64(assertionOptionsOrigin.challenge),
  };

  await ctx.state.session.set('challenge', assertionOptions.challenge);
  await ctx.state.session.set('challenge_uid', user.id);
  ctx.response.status = Status.OK;
  ctx.response.body = assertionOptions;
});

const FIDO2AssertionResultSchema = z.object({
  id: z.string(),
});

router.post('/assertion/result', async (ctx) => {
  // use challenge
  const challenge: string | null = await ctx.state.session.get('challenge');
  if (typeof challenge !== 'string') return ctx.response.status = Status.Forbidden;
  // use challenge_uid
  const challengeUID: string | null = await ctx.state.session.get('challenge_uid');
  if (typeof challengeUID !== 'string') return ctx.response.status = Status.Forbidden;

  // parse
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  const result = FIDO2AssertionResultSchema.safeParse(await body.value);
  if (!result.success) return ctx.response.status = Status.BadRequest;
  const request = result.data;

  const attestationOrigin = await prisma.tFASolution.findFirst({
    select: {
      id: true,
      value: true,
    },
    where: {
      id: request.id,
      user_id: challengeUID,
      type: 'FIDO2',
      available: true,
    },
  });
  if (!attestationOrigin) return ctx.response.status = Status.BadRequest;
  const attestationValue = FIDO2DBSchema.safeParse(attestationOrigin.value);
  if (!attestationValue.success) return ctx.response.status = Status.BadRequest;
  const attestation = { id: request.id, ...attestationValue.data };

  const assertionExpectations = {
    challenge,
    origin: SERVER_URI,
    factor: 'either',
    publicKey: attestation.publicKey,
    prevCounter: attestation.counter,
    userHandle: null,
  };

  const authnResult = await f2l.assertionResult(
    { ...request, rawId: base642ByteArray(request.id) },
    assertionExpectations,
  );
  console.log(authnResult);

  if (!(authnResult as Fido2AssertionResult & { audit?: { complete?: boolean } })?.audit?.complete) {
    return ctx.response.status = Status.BadRequest;
  }
  const nextCounter = authnResult.authnrData?.get('counter');
  await prisma.tFASolution.update({
    where: {
      id: request.id,
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
  ctx.response.status = Status.OK;
  ctx.response.body = nextCounter;
});

export default router;
