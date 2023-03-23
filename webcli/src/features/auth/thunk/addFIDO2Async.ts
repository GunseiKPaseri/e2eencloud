import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { enqueueSnackbar } from '../../snackbar/snackbarSlice';
import {
  base642ByteArray, byteArray2base64, UUID2ByteArray,
} from '../../../utils/uint8';
import { axiosWithSession } from '../../../lib/axios';
import { APP_LOCATION } from '../../../const';

import type { AuthState } from '../authSlice';
// TOTP追加処理
export const addFIDO2Async = createAsyncThunk<{ mfacode: string[] | null }>(
  'auth/add_fido2',
  async (_, { dispatch }) => {
    type GetAttestation = PublicKeyCredentialCreationOptions & {
      challenge: string,
      user: { id: string, displayName: string },
      rp: { id: string, name: string, icon: string }
    };
    const optionsOrigin = (await axiosWithSession.get<GetAttestation>(
      `${APP_LOCATION}/api/fido2/attestation`,
    )).data;
    const options = {
      ...optionsOrigin,
      challenge: base642ByteArray(optionsOrigin.challenge),
      user: {
        ...optionsOrigin.user,
        id: UUID2ByteArray(optionsOrigin.user.id),
      },
    };

    const cred = await navigator.credentials.create({ publicKey: options });
    if (cred === null) {
      dispatch(enqueueSnackbar({ message: 'WebAuthnに失敗しました', options: { variant: 'success' } }));
      return { mfacode: null };
    }
    const rawId = (cred as { rawId?: unknown })?.rawId;

    const { response } = cred as {
      response?: { attestationObject?: unknown, clientDataJSON?: unknown }
    };
    const fixResponse = response?.attestationObject && response?.clientDataJSON ? {
      attestationObject: response.attestationObject instanceof ArrayBuffer
        ? byteArray2base64(new Uint8Array(response.attestationObject))
        : undefined,
      clientDataJSON: response.clientDataJSON instanceof ArrayBuffer
        ? byteArray2base64(new Uint8Array(response.clientDataJSON))
        : undefined,
    } : undefined;
    const credentials = {
      id: cred.id,
      rawId: rawId instanceof ArrayBuffer ? byteArray2base64(new Uint8Array(rawId)) : undefined,
      type: cred.type,
      response: fixResponse,
    };
    try {
      const result = await axiosWithSession.post<{ mfacode: string[] | null }>(
        `${APP_LOCATION}/api/fido2/attestation`,
        credentials,
      );
      dispatch(enqueueSnackbar({ message: '正常に反映しました', options: { variant: 'success' } }));
      return result.data;
    } catch (_e) {
      dispatch(enqueueSnackbar({ message: 'エラーが発生しました', options: { variant: 'success' } }));
    }
    return { mfacode: null };
  },
);

export const afterAddFIDO2AsyncFullfilled:
CaseReducer<AuthState, PayloadAction<{ mfacode: string[] | null }>> = (state, action) => {
  state.mfacode = action.payload.mfacode;
};
