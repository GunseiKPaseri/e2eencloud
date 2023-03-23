import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession } from '../../../lib/axios';
import {
  createSalt,
  SHA256,
  argon2encrypt,
  AESCTR,
  getAESCTRKey,
} from '../../../utils/crypto';
import { byteArray2base64 } from '../../../utils/uint8';
import { AES_AUTH_KEY_LENGTH } from '../../../const';

import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';
import { enqueueSnackbar } from '../../snackbar/snackbarSlice';
import type { RootState } from '../../../app/store';

// パスワード変更処理
export const changePasswordAsync = createAsyncThunk<
Record<string, never>, { newpassword: string }, { state: RootState }
>(
  'auth/changePassword',
  async (params, { getState, dispatch }) => {
    const step = 5;
    dispatch(setProgress(progress(0, step)));

    const state = getState();
    const { user } = state.auth;
    if (!user) throw new Error('ログインしろ');
    const MasterKey = new Uint8Array(user.MasterKey);

    // 128 bit Client Random Value
    const ClientRandomValue = window.crypto.getRandomValues(new Uint8Array(AES_AUTH_KEY_LENGTH));
    // 256 bit Salt
    const salt = createSalt(ClientRandomValue);
    // 256bit Derived Key
    const DerivedKey = await argon2encrypt(params.newpassword, salt);

    dispatch(setProgress(progress(1, step)));

    // 128bit Derived Encryption Key & Derived Authentication Key
    const DerivedEncryptionKey = await getAESCTRKey(DerivedKey.slice(0, AES_AUTH_KEY_LENGTH));
    const DerivedAuthenticationKey = DerivedKey.slice(AES_AUTH_KEY_LENGTH, AES_AUTH_KEY_LENGTH * 2);

    dispatch(setProgress(progress(2, step)));

    // 128bit Encrypted Master Key
    const EncryptedMasterKey = await AESCTR(MasterKey, DerivedEncryptionKey);
    const HashedAuthenticationKey = SHA256(DerivedAuthenticationKey);
    // console.log(MasterKey, DerivedEncryptionKey, EncryptedMasterKey);

    dispatch(setProgress(progress(3, step)));

    type SendData = {
      clientRandomValueBase64: string;
      encryptedMasterKeyBase64: string;
      encryptedMasterKeyIVBase64: string;
      hashedAuthenticationKeyBase64: string;
    };
    const sendData = {
      clientRandomValueBase64: byteArray2base64(ClientRandomValue),
      encryptedMasterKeyBase64: byteArray2base64(EncryptedMasterKey.encrypt),
      encryptedMasterKeyIVBase64: byteArray2base64(EncryptedMasterKey.iv),
      hashedAuthenticationKeyBase64: byteArray2base64(HashedAuthenticationKey),
    };
    await axiosWithSession.patch<
    SendData,
    AxiosResponse<{ success: boolean }>
    >(
      '/api/my/password',
      sendData,
      {
        onUploadProgress: (progressEvent) => {
          dispatch(setProgress(progress(4, step, progressEvent)));
        },
      },
    );

    dispatch(enqueueSnackbar({ message: 'パスワードを変更しました', options: { variant: 'success' } }));
    dispatch(deleteProgress());
    return {};
  },
);
