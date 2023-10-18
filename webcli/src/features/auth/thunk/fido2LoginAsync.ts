import type { CaseReducer } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession } from '~/lib/axios';
import type { AuthState } from '~/features/auth/authSlice';
import {
  base642ByteArray,
  base64uri2ByteArray,
  byteArray2base64,
  byteArray2base64uri,
} from '~/utils/uint8';
import {
  loginSuccess,
  type APILoginSuccessResopnse,
} from './loginSuccessAsync';

// ログイン処理
export const fido2LoginAsync = createAsyncThunk<
  { success: boolean; auto: boolean },
  { auto: boolean }
>('auth/fido2Login', async ({ auto }, { dispatch }) => {
  try {
    type Res = Omit<
      PublicKeyCredentialRequestOptions,
      'allowCredentials' | 'challenge'
    > & {
      allowCredentials?: (Omit<
        NonNullable<
          PublicKeyCredentialRequestOptions['allowCredentials']
        >[number],
        'id'
      > & { id: string })[];
      challenge: string;
    };
    const resp = await axiosWithSession.post<Res>(
      '/api/fido2/assertion/options',
    );
    const option = {
      ...resp.data,
      allowCredentials: resp.data.allowCredentials
        ? resp.data.allowCredentials.map((x) => ({
            ...x,
            id: base64uri2ByteArray(x.id).buffer,
          }))
        : undefined,
      challenge: base642ByteArray(resp.data.challenge).buffer,
    };
    const credential = await navigator.credentials.get({ publicKey: option });
    if (credential !== null) {
      const rawId = (credential as { rawId?: unknown })?.rawId;
      const response = (credential as { response?: unknown })?.response;
      if (typeof response !== 'object')
        throw new Error('responce is not object');

      const authenticatorData = (response as { authenticatorData?: unknown })
        ?.authenticatorData;
      const clientDataJSON = (response as { clientDataJSON?: unknown })
        ?.clientDataJSON;
      const signature = (response as { signature?: unknown })?.signature;
      const userHandle = (response as { userHandle?: unknown })?.userHandle;

      const credentialJSON = {
        id: credential.id,
        rawId:
          rawId instanceof ArrayBuffer
            ? byteArray2base64uri(new Uint8Array(rawId))
            : undefined,
        response: {
          authenticatorData:
            authenticatorData instanceof ArrayBuffer
              ? byteArray2base64(new Uint8Array(authenticatorData))
              : undefined,
          clientDataJSON:
            clientDataJSON instanceof ArrayBuffer
              ? byteArray2base64(new Uint8Array(clientDataJSON))
              : undefined,
          signature:
            signature instanceof ArrayBuffer
              ? byteArray2base64(new Uint8Array(signature))
              : undefined,
          userHandle:
            userHandle instanceof ArrayBuffer
              ? byteArray2base64(new Uint8Array(userHandle))
              : undefined,
        },
        type: credential.type,
      };

      const result2 = await axiosWithSession.post<
        PublicKeyCredentialRequestOptions,
        AxiosResponse<APILoginSuccessResopnse>
      >('/api/fido2/assertion/result', credentialJSON);
      if (result2.data.success) {
        await dispatch(loginSuccess(result2.data));
        return { auto, success: true };
      }
    }
  } catch {
    return { auto, success: false };
  }
  return { auto, success: false };
});

export const afterFIDO2LoginAsyncPending = (state: AuthState) => {
  state.loginStatus = { state: 'pending', step: 'FIDO2' };
};

export const afterFIDO2LoginAsyncRejected = (state: AuthState) => {
  state.loginStatus = { state: 'error', step: 'FIDO2' };
};

export const afterFIDO2LoginAsyncFullfilled: CaseReducer<
  AuthState,
  ReturnType<typeof fido2LoginAsync.fulfilled>
> = (state, action) => {
  state.loginStatus = action.payload.success
    ? { state: null, step: 'EmailAndPass' }
    : action.payload.auto
    ? { step: 'SelectMFASolution' }
    : { state: 'error', step: 'FIDO2' };
};
