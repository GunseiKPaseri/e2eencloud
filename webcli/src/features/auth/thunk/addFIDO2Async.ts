import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { enqueueSnackbar } from '../../snackbar/snackbarSlice';
import {
  base642ByteArray, byteArray2base64, UUID2ByteArray,
} from '../../../utils/uint8';
import { axiosWithSession, appLocation } from '../../componentutils';

import type { AuthState } from '../authSlice';
// TOTP追加処理
export const addFIDO2Async = createAsyncThunk<void, void>(
  'auth/add_fido2',
  async (_, { dispatch }) => {
    type GetAttestation = PublicKeyCredentialCreationOptions & {
      challenge: string,
      user: { id: string, displayName: string },
      rp: { id: string, name: string, icon: string }
    };
    const optionsOrigin = (await axiosWithSession.get<GetAttestation>(
      `${appLocation}/api/fido2/attestation`,
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
    if (cred === null) return;
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
      await axiosWithSession.post(
        `${appLocation}/api/fido2/attestation`,
        credentials,
      );
      dispatch(enqueueSnackbar({ message: '正常に反映しました', options: { variant: 'success' } }));
    } catch (_e) {
      dispatch(enqueueSnackbar({ message: 'エラーが発生しました', options: { variant: 'success' } }));
    }
  },
);

export const afterAddFIDO2AsyncFullfilled:
CaseReducer<AuthState, PayloadAction<void>> = (state) => {
  if (state.user) {
    state.user.useMultiFactorAuth = true;
  }
};
