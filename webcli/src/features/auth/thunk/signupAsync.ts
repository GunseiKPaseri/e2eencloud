import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession, appLocation } from '../../componentutils';
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

import type { UserForm } from '../authSlice';
// サインアップ処理
// eslint-disable-next-line import/prefer-default-export
export const signupAsync = createAsyncThunk<{ success: boolean }, UserForm>(
  'auth/signup',
  async (userinfo, { dispatch }) => {
    try {
      // 128 bit MasterKey
      const MasterKey = window.crypto.getRandomValues(new Uint8Array(AES_AUTH_KEY_LENGTH));
      // 128 bit Client Random Value
      const ClientRandomValue = window.crypto.getRandomValues(new Uint8Array(AES_AUTH_KEY_LENGTH));
      // 256 bit Salt
      const salt = createSalt(ClientRandomValue);
      // 256bit Derived Key
      const DerivedKey = await argon2encrypt(userinfo.password, salt);
      // 128bit Derived Encryption Key & Derived Authentication Key
      const DerivedEncryptionKey = await getAESCTRKey(DerivedKey.slice(0, AES_AUTH_KEY_LENGTH));
      const DerivedAuthenticationKey = DerivedKey.slice(
        AES_AUTH_KEY_LENGTH,
        AES_AUTH_KEY_LENGTH * 2,
      );
      // 128bit Encrypted Master Key
      const EncryptedMasterKey = await AESCTR(MasterKey, DerivedEncryptionKey);
      const HashedAuthenticationKey = SHA256(DerivedAuthenticationKey);
      // console.log(MasterKey, DerivedEncryptionKey, EncryptedMasterKey);

      const sendData = {
        email: userinfo.email,
        clientRandomValueBase64: byteArray2base64(ClientRandomValue),
        encryptedMasterKeyBase64: byteArray2base64(EncryptedMasterKey.encrypt),
        encryptedMasterKeyIVBase64: byteArray2base64(EncryptedMasterKey.iv),
        hashedAuthenticationKeyBase64: byteArray2base64(HashedAuthenticationKey),
      };
      const result = await axiosWithSession.post<
      UserForm,
      AxiosResponse<{ success: boolean }>
      >(
        `${appLocation}/api/signup`,
        sendData,
        {
          onUploadProgress: (progressEvent: { loaded: number, total: number }) => {
            dispatch(setProgress(progress(0, 1, progressEvent.loaded / progressEvent.total)));
          },
        },
      );
      dispatch(deleteProgress());
      return { success: result.data.success ?? false };
    } catch (e) {
      // console.error(e);
      dispatch(deleteProgress());
      return { success: false };
    }
  },
);
