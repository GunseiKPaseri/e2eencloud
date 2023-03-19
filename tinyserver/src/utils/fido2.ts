import { Fido2Lib, SERVER_HOSTNAME, SERVER_URI, z } from '../../deps.ts';

export const f2l = new Fido2Lib({
  timeout: 42,
  rpId: SERVER_HOSTNAME,
  rpName: 'E2EEENCLOUD',
  rpIcon: `${SERVER_URI}/logo.png`,
  challengeSize: 128,
  attestation: 'none',
  cryptoParams: [-7, -257],
  authenticatorAttachment: 'platform',
  authenticatorRequireResidentKey: false,
  authenticatorUserVerification: 'preferred',
});

export const FIDO2DBSchema = z.object({
  publicKey: z.string(),
  counter: z.number(),
  fmt: z.string(),
});

export type FIDO2DB = z.infer<typeof FIDO2DBSchema>;
