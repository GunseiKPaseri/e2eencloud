import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession, appLocation } from '../../componentutils';
import {
  argon2encrypt,
  generateRSAKey,
  importRSAKey,
  getAESCTRKey,
  decryptAESCTR,
} from '../../../utils/crypto';
import { byteArray2base64, base642ByteArray } from '../../../utils/uint8';
import { setRSAKey } from '../../../app/encrypt';
import { buildFileTableAsync } from '../../file/thunk/buildFileTableAsync';

import { AES_AUTH_KEY_LENGTH } from '../../../const';

import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';
import { enqueueSnackbar } from '../../snackbar/snackbarSlice';
import { updateUsageAsync } from '../../file/thunk/updateUsageAsync';

import type { AuthState, UserState } from '../authSlice';

// ログイン処理
export const loginAsync = createAsyncThunk<
UserState, { email: string, password: string, token: string }>(
  'auth/login',
  async (userinfo, { dispatch }) => {
    const step = 4;
    dispatch(setProgress(progress(0, step)));
    let getSalt: AxiosResponse<{ salt: string }>;
    try {
      getSalt = await axiosWithSession.post<
      { email: string },
      AxiosResponse<{ salt: string }>
      >(
        `${appLocation}/api/salt`,
        { email: userinfo.email },
        {
          onUploadProgress: (progressEvent: { loaded: number, total: number }) => {
            dispatch(setProgress(progress(0, step, progressEvent.loaded / progressEvent.total)));
          },
        },
      );
    } catch (e) {
      dispatch(deleteProgress());
      dispatch(enqueueSnackbar({ message: 'サーバに接続できませんでした', options: { variant: 'error' } }));
      throw e;
    }

    const salt = base642ByteArray(getSalt.data.salt);

    const DerivedKey = await argon2encrypt(userinfo.password, salt);
    dispatch(setProgress(progress(1, step)));

    const DerivedEncryptionKey = await getAESCTRKey(DerivedKey.slice(0, AES_AUTH_KEY_LENGTH));
    const DerivedAuthenticationKey = DerivedKey.slice(AES_AUTH_KEY_LENGTH, AES_AUTH_KEY_LENGTH * 2);

    const authenticationKeyBase64 = byteArray2base64(DerivedAuthenticationKey);

    type APILoginResopnse = {
      authority: 'ADMIN' | null,
      encryptedMasterKeyBase64: string,
      encryptedMasterKeyIVBase64: string,
      useTwoFactorAuth: boolean,
      encryptedRSAPrivateKeyBase64?: string,
      encryptedRSAPrivateKeyIVBase64?: string,
      RSAPublicKeyBase64?: string,
    };
    // login
    let result: AxiosResponse<APILoginResopnse>;
    try {
      result = await axiosWithSession.post<
      { email: string, authenticationKey: string, token: string },
      AxiosResponse<APILoginResopnse>
      >(
        `${appLocation}/api/login`,
        { email: userinfo.email, authenticationKeyBase64, token: userinfo.token },
        {
          onUploadProgress: (progressEvent: { loaded: number, total: number }) => {
            dispatch(setProgress(progress(2, step, progressEvent.loaded / progressEvent.total)));
          },
        },
      );
      // console.log(result.data);
    } catch (e) {
      dispatch(deleteProgress());
      dispatch(enqueueSnackbar({ message: 'ログインに失敗しました', options: { variant: 'error' } }));
      throw e;
    }
    const EncryptedMasterKey = base642ByteArray(result.data.encryptedMasterKeyBase64);
    // console.log(result.data.encryptedMasterKeyIVBase64);

    const MasterKeyRaw = await decryptAESCTR(
      EncryptedMasterKey,
      DerivedEncryptionKey,
      base642ByteArray(result.data.encryptedMasterKeyIVBase64),
    );
    // console.log(MasterKeyRaw);
    const MasterKey = await getAESCTRKey(MasterKeyRaw);
    // console.log(result.data);
    // encrypt key
    if (!result.data.RSAPublicKeyBase64
        || !result.data.encryptedRSAPrivateKeyBase64
        || !result.data.encryptedRSAPrivateKeyIVBase64) {
      // add key
      // console.log(MasterKey);
      const genKey = await generateRSAKey(MasterKey);
      await axiosWithSession.put<{
        encryptedRSAPrivateKeyBase64: string,
        encryptedRSAPrivateKeyIVBase64: string,
        RSAPublicKeyBase64: string
      }>(
        `${appLocation}/api/user/pubkey`,
        {
          encryptedRSAPrivateKeyBase64: genKey.encripted_private_key,
          encryptedRSAPrivateKeyIVBase64: genKey.encripted_private_key_iv,
          RSAPublicKeyBase64: genKey.public_key,
        },
        {
          onUploadProgress: (progressEvent: { loaded: number, total: number }) => {
            dispatch(setProgress(progress(3, step, progressEvent.loaded / progressEvent.total)));
          },
        },
      );
      setRSAKey({ rsaPrivateKey: genKey.privateKey, rsaPublicKey: genKey.publicKey });
    } else {
      try {
        dispatch(setProgress(progress(3, step, 0)));
        const importKey = await importRSAKey({
          masterkey: MasterKey,
          encryptedPrivateKeyBase64: result.data.encryptedRSAPrivateKeyBase64,
          encryptedPrivateKeyIVBase64: result.data.encryptedRSAPrivateKeyIVBase64,
          publicKeyBase64: result.data.RSAPublicKeyBase64,
        });
        setRSAKey({ rsaPublicKey: importKey.publicKey, rsaPrivateKey: importKey.privateKey });
      } catch (e) {
        dispatch(deleteProgress());
        dispatch(enqueueSnackbar({ message: '暗号鍵の復元に失敗しました', options: { variant: 'error' } }));
        throw e;
      }
    }
    // file tree
    dispatch(buildFileTableAsync());

    // storage
    dispatch(updateUsageAsync());

    dispatch(deleteProgress());

    dispatch(enqueueSnackbar({ message: 'ログインに成功しました', options: { variant: 'success' } }));
    return {
      authority: result.data.authority,
      email: userinfo.email,
      MasterKey: Array.from(MasterKeyRaw),
      useTwoFactorAuth: result.data.useTwoFactorAuth,
    };
  },
);

export const afterLoginAsyncPending = (state: AuthState) => {
  state.loginStatus = null;
};

export const afterLoginAsyncRejected = (state: AuthState) => {
  state.loginStatus = 'failed';
};

export const afterLoginAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<UserState>> = (state, action) => {
  state.user = action.payload;
};
