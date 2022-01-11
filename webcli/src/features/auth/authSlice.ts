import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { AxiosResponse, AxiosResponseHeaders } from 'axios';
import { axiosWithSession, appLocation } from '../apirequest';
import { createSalt, SHA256, argon2encrypt, byteArray2base64, base642ByteArray, generateRSAKey, importRSAKey, AESCTR, getAESCTRKey, decryptAESCTR } from '../../util';
import { setRSAKey } from '../../encrypt';

interface UserForm {
  email: string;
  password: string;
}

interface UserState {
  email: string;
  useTowFactorAuth: boolean;
  MasterKey: number[];
}
export interface AuthState {
  user: UserState | null;
  status: 'idle' | 'loading' | 'failed';
  confirmstate: 0|1;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  confirmstate: 0,
};

// Thunk
// サインアップ処理
export const signupAsync = createAsyncThunk<{success: boolean}, UserForm>(
  'auth/signup',
  async (userinfo) => {
    // 128 bit MasterKey
    const MasterKey = window.crypto.getRandomValues(new Uint8Array(16));
    // 128 bit Client Random Value
    const ClientRandomValue = window.crypto.getRandomValues(new Uint8Array(16));
    // 256 bit Salt
    const salt = createSalt(ClientRandomValue);
    // 256bit Derived Key
    const DerivedKey = await argon2encrypt(userinfo.password, salt);
    // 128bit Derived Encryption Key & Derived Authentication Key
    const DerivedEncryptionKey = await getAESCTRKey(DerivedKey.slice(0,16));
    const DerivedAuthenticationKey = DerivedKey.slice(16,32);
    // 128bit Encrypted Master Key
    const EncryptedMasterKey = await AESCTR(MasterKey, DerivedEncryptionKey);
    const HashedAuthenticationKey = SHA256(DerivedAuthenticationKey);
    console.log(MasterKey, DerivedEncryptionKey, EncryptedMasterKey);

    const sendData = {
      email: userinfo.email,
      client_random_value: byteArray2base64(ClientRandomValue),
      encrypted_master_key: byteArray2base64(EncryptedMasterKey.encrypt),
      encrypted_master_key_iv: byteArray2base64(EncryptedMasterKey.iv),
      hashed_authentication_key: byteArray2base64(HashedAuthenticationKey),
    };

    const result = await axiosWithSession.post<UserForm, AxiosResponse<{success: boolean}>>(`${appLocation}/api/signup`, sendData);
    console.log(result);
    return {success: result.data.success ?? false};
  },
);

// メールアドレス確認処理
export const confirmEmailAsync = createAsyncThunk<{success: boolean}, {email: string, token: string}>(
  'auth/confirm_email',
  async (usertoken) => {
    const sendData = {
      email: usertoken.email,
      email_confirmation_token: usertoken.token,
    }
    const result = await axiosWithSession.post<{email: string, email_confirmation_token: string}, AxiosResponse<{success: boolean}>>(`${appLocation}/api/email_confirm`, sendData);
    if(!result.data.success){
      throw new Error("email confirm failed");
    }
    return {success: true};
  },
);

// TOTP追加処理
export const addTOTPAsync = createAsyncThunk<void, {secret_key: string, token: string}>(
  'auth/add_totp',
  async (secretkey) => {
    await axiosWithSession.put<{secret_key: string, token: string}>(`${appLocation}/api/user/totp`, secretkey);
  },
);

// TOTP削除処理
export const deleteTOTPAsync = createAsyncThunk<void, void>(
  'auth/delete_totp',
  async (_) => {
    await axiosWithSession.delete(`${appLocation}/api/user/totp`);
  },
);

// ログイン処理
export const loginAsync = createAsyncThunk<UserState, {email: string, password: string, token: string}>(
  'auth/login',
  async (userinfo) => {
    const getSalt = await axiosWithSession.post<
                        {email: string},
                        AxiosResponse<{salt: string}>
                      >(`${appLocation}/api/salt`, {email: userinfo.email});
    
    const salt = base642ByteArray(getSalt.data.salt);

    const DerivedKey = await argon2encrypt(userinfo.password, salt);

    const DerivedEncryptionKey = await getAESCTRKey(DerivedKey.slice(0,16));
    const DerivedAuthenticationKey = DerivedKey.slice(16,32);

    const authentication_key = byteArray2base64(DerivedAuthenticationKey);

    // login
    const result = await axiosWithSession.post<
                      {email: string, authentication_key: string, token: string},
                      AxiosResponse<{
                        encrypted_master_key: string,
                        encrypted_master_key_iv: string,
                        useTwoFactorAuth: boolean,
                        encrypted_rsa_private_key?: string,
                        encrypted_rsa_private_key_iv?: string,
                        rsa_public_key?: string,
                      }>
                    >(`${appLocation}/api/login`, {email: userinfo.email, authentication_key,token: userinfo.token});
    const EncryptedMasterKey = base642ByteArray(result.data.encrypted_master_key);
    console.log(result.data.encrypted_master_key_iv);
    const MasterKeyRaw = await decryptAESCTR(EncryptedMasterKey, DerivedEncryptionKey, base642ByteArray(result.data.encrypted_master_key_iv));
    console.log(MasterKeyRaw);
    const MasterKey = await getAESCTRKey(MasterKeyRaw);
    // encrypt key
    if(!result.data.rsa_public_key || !result.data.encrypted_rsa_private_key || !result.data.encrypted_rsa_private_key_iv){
      // add key
      console.log(MasterKey);
      const genKey = await generateRSAKey(MasterKey);
      await axiosWithSession.put<{
                      encrypted_rsa_private_key: string,
                      encrypted_rsa_private_key_iv: string,
                      rsa_public_key: string
                    }>(`${appLocation}/api/user/pubkey`, {
                      encrypted_rsa_private_key: genKey.encripted_private_key,
                      encrypted_rsa_private_key_iv: genKey.encripted_private_key_iv,
                      rsa_public_key: genKey.public_key
                    });
      setRSAKey({rsaPrivateKey: genKey.privateKey, rsaPublicKey: genKey.publicKey});
    } else {
      const importKey = await importRSAKey({
        masterkey:MasterKey,
        encrypted_private_key: result.data.encrypted_rsa_private_key,
        encrypted_private_key_iv: result.data.encrypted_rsa_private_key_iv,
        public_key: result.data.rsa_public_key
      });
      setRSAKey({rsaPublicKey: importKey.publicKey, rsaPrivateKey: importKey.privateKey});
    }

    return {email: userinfo.email, MasterKey: Array.from(MasterKeyRaw), useTowFactorAuth: result.data.useTwoFactorAuth};
  },
);

// ログアウト処理
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_) => {
    // logout
    const result = await axiosWithSession.post(`${appLocation}/api/logout`);
    return;
  },
);

// Slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signupAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signupAsync.rejected, (state) => {
        state.status = 'idle';
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.status = 'idle';
      })
      .addCase(confirmEmailAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(confirmEmailAsync.rejected, (state) => {
        state.status = 'idle';
      })
      .addCase(confirmEmailAsync.fulfilled, (state) => {
        state.status = 'idle';
        state.confirmstate = 1;
      })
      .addCase(addTOTPAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addTOTPAsync.rejected, (state) => {
        state.status = 'idle';
      })
      .addCase(addTOTPAsync.fulfilled, (state) => {
        state.status = 'idle';
        if(state.user){
          state.user.useTowFactorAuth = true;
        }
      })
      .addCase(deleteTOTPAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTOTPAsync.rejected, (state) => {
        state.status = 'idle';
      })
      .addCase(deleteTOTPAsync.fulfilled, (state) => {
        state.status = 'idle';
        if(state.user){
          state.user.useTowFactorAuth = false;
        }
      })
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginAsync.rejected, (state) => {
        state.status = 'idle';
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        console.log("get", action.payload.MasterKey);
        state.user = action.payload;
      })
      .addCase(logoutAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.status = 'idle';
      })
      .addCase(logoutAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = null;
      });
  }
});

export default authSlice.reducer;

