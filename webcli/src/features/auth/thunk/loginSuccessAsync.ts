import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  importRSAKey,
  getAESCTRKey,
} from '~/utils/crypto';
import { base642ByteArray } from '~/utils/uint8';
import { decryptoByDerivedEncryptionKey, setRSAKey } from '~/class/encrypt';
import type { AuthState, UserState } from '~/features/auth/authSlice';
import { enqueueSnackbar } from '~/features/snackbar/snackbarSlice';
import { buildFileTableAsync } from '~/features/file/thunk/buildFileTableAsync';

import { updateUsageAsync } from '~/features/file/thunk/updateUsageAsync';
import { deleteProgress } from '~/features/progress/progressSlice';
import { push } from 'redux-first-history';
import socket from '~/class/socketio';

type LoginSuccess = {
  role: 'ADMIN' | 'USER',
  email: string,
  encryptedMasterKeyBase64: string,
  encryptedMasterKeyIVBase64: string,
  useMultiFactorAuth: boolean,
  encryptedRSAPrivateKeyBase64: string,
  encryptedRSAPrivateKeyIVBase64: string,
  RSAPublicKeyBase64: string,
};

export type APILoginSuccessResopnse = {
  success: true,
  email: string,
  role: 'ADMIN' | 'USER',
  encryptedMasterKeyBase64: string,
  encryptedMasterKeyIVBase64: string,
  useMultiFactorAuth: boolean,
  encryptedRSAPrivateKeyBase64: string,
  encryptedRSAPrivateKeyIVBase64: string,
  RSAPublicKeyBase64: string,
};

// ログイン処理
export const loginSuccess = createAsyncThunk<
UserState, LoginSuccess>(
  'auth/loginSuccess',
  async (result, { dispatch }) => {
    const EncryptedMasterKey = base642ByteArray(result.encryptedMasterKeyBase64);
    // console.log(result.data.encryptedMasterKeyIVBase64);

    const MasterKeyRaw = await decryptoByDerivedEncryptionKey({
      data: EncryptedMasterKey,
      iv: base642ByteArray(result.encryptedMasterKeyIVBase64),
    });

    // console.log(MasterKeyRaw);
    const MasterKey = await getAESCTRKey(MasterKeyRaw);
    // console.log(result.data);
    // encrypt key
    try {
      // dispatch(setProgress(progress(3, step, 0)));
      const importKey = await importRSAKey({
        masterkey: MasterKey,
        encryptedPrivateKeyBase64: result.encryptedRSAPrivateKeyBase64,
        encryptedPrivateKeyIVBase64: result.encryptedRSAPrivateKeyIVBase64,
        publicKeyBase64: result.RSAPublicKeyBase64,
      });
      setRSAKey({ rsaPublicKey: importKey.publicKey, rsaPrivateKey: importKey.privateKey });
    } catch (e) {
      dispatch(deleteProgress());
      dispatch(enqueueSnackbar({ message: '暗号鍵の復元に失敗しました', options: { variant: 'error' } }));
      throw e;
    }
    // file tree
    await Promise.all([
      dispatch(buildFileTableAsync()), // file tree
      dispatch(updateUsageAsync()), //    storage
    ]);

    // join user room
    socket.emit('LOGGED_IN')

    dispatch(deleteProgress());

    dispatch(push('/'));

    dispatch(enqueueSnackbar({ message: 'ログインに成功しました', options: { variant: 'success' } }));
    return {
      authority: result.role === 'ADMIN' ? 'ADMIN' : null,
      email: result.email,
      MasterKey: Array.from(MasterKeyRaw),
      useMultiFactorAuth: result.useMultiFactorAuth,
    };
  },
);

export const afterLoginSuccessFullfilled:
CaseReducer<AuthState, PayloadAction<UserState>> = (state, action) => {
  state.user = action.payload;
};
