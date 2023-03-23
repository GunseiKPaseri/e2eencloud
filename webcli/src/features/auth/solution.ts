import { type MFASolution } from './authSlice';

const solutionName = {
  CODE: '使い捨てコード',
  EMAIL: 'メール認証',
  FIDO2: 'WebAuthn認証器',
  TOTP: 'ワンタイムコード',
} as const satisfies { [key in MFASolution]: string };

export const mfasolution2name = (solution: MFASolution) => solutionName[solution];
