import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { setRSAKey } from '../../../lib/encrypt';
import { axiosWithSession } from '../../../lib/axios';
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';
import {
  createSalt,
  SHA256,
  argon2encrypt,
  AESCTR,
  getAESCTRKey,
  generateRSAKey,
} from '../../../utils/crypto';
import { byteArray2base64 } from '../../../utils/uint8';

import { AES_AUTH_KEY_LENGTH } from '../../../global/const';

import type { AuthState, EmailConfirm, UserState } from '../authSlice';
import { buildFileTableAsync } from '../../file/thunk/buildFileTableAsync';
import type { StorageInfo } from '../../file/file.type';
import { updateUsage } from '../../file/thunk/updateUsageAsync';

type APIEmailConfirmResopnse = {
  success: true
  user: {
    email: string
    role: 'ADMIN' | 'USER',
    encryptedMasterKeyBase64: string,
    encryptedMasterKeyIVBase64: string,
    useMultiFactorAuth: boolean,
    encryptedRSAPrivateKeyBase64: string,
    encryptedRSAPrivateKeyIVBase64: string,
    RSAPublicKeyBase64: string,
  }
  storage: StorageInfo
} | {
  success: false
};

type EmailConfirmReturned = ({ success: false } | { success: true, user: UserState })
& { token: string };

// メールアドレス確認処理
export const confirmEmailAsync = createAsyncThunk<
EmailConfirmReturned,
{ password: string, token: string }
>(
  'auth/confirm_email',
  async (usertoken, { dispatch }) => {
    try {
      // generate user

      // 128 bit MasterKey
      const MasterKey = window.crypto.getRandomValues(new Uint8Array(AES_AUTH_KEY_LENGTH));
      // 128 bit Client Random Value
      const ClientRandomValue = window.crypto.getRandomValues(new Uint8Array(AES_AUTH_KEY_LENGTH));
      // 256 bit Salt
      const salt = createSalt(ClientRandomValue);
      // 256bit Derived Key
      const DerivedKey = await argon2encrypt(usertoken.password, salt);
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

      // RSAKey
      const generatedRSAKey = await generateRSAKey(await getAESCTRKey(MasterKey));

      const sendData: EmailConfirm = {
        type: 'ADD_USER',
        token: usertoken.token,
        clientRandomValueBase64: byteArray2base64(ClientRandomValue),
        encryptedMasterKeyBase64: byteArray2base64(EncryptedMasterKey.encrypt),
        encryptedMasterKeyIVBase64: byteArray2base64(EncryptedMasterKey.iv),
        hashedAuthenticationKeyBase64: byteArray2base64(HashedAuthenticationKey),
        encryptedRSAPrivateKeyBase64: generatedRSAKey.encripted_private_key,
        encryptedRSAPrivateKeyIVBase64: generatedRSAKey.encripted_private_key_iv,
        RSAPublicKeyBase64: generatedRSAKey.public_key,
      };

      const result = await axiosWithSession.post<
      EmailConfirm,
      AxiosResponse<{ success: false } | APIEmailConfirmResopnse>
      >(
        '/api/email_confirm',
        sendData,
        {
          onUploadProgress: (progressEvent) => {
            dispatch(setProgress(progress(0, 1, progressEvent)));
          },
        },
      );
      dispatch(deleteProgress());

      if (!result.data.success) {
        dispatch(deleteProgress());
        return { success: false, token: usertoken.token };
      }

      setRSAKey({
        rsaPrivateKey: generatedRSAKey.privateKey,
        rsaPublicKey: generatedRSAKey.publicKey,
      });
      await dispatch(buildFileTableAsync()); // file tree
      dispatch(updateUsage(result.data.storage));// file usage

      const loginUser:UserState = {
        MasterKey: Array.from(MasterKey),
        authority: null,
        ...result.data.user,
      };

      dispatch(deleteProgress());
      return {
        success: true, user: loginUser, token: usertoken.token,
      };
    } catch (e) {
      // console.error(e);
      dispatch(deleteProgress());
      return { success: false, token: usertoken.token };
    }
  },
);

export const afterConfirmEmailAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<EmailConfirmReturned>> = (state, action) => {
  if (action.payload.success) {
    state.user = action.payload.user;
  }
  state.confirmstate[action.payload.token] = action.payload.success ? 'SUCCESS' : 'ERROR';
};
