import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { AxiosResponse, AxiosResponseHeaders } from 'axios';
import axiosWithSession from '../apirequest';
import { AESECB, createSalt, SHA256, argon2encrypt, byteArray2base64 } from './util';

interface UserForm {
  email: string;
  password: string;
}

interface UserState {
  email: string;
  useTowFactorAuth: boolean;
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

const appLocation = "http://localhost:3001";

// Thunk
// サインアップ処理
export const signupAsync = createAsyncThunk<{success: boolean, email: string, password: string}, UserForm>(
  'auth/signup',
  async (userinfo) => {
    // 128 bit MasterKey
    const MasterKey = window.crypto.getRandomValues(new Uint8Array(16));
    // 128 bit Client Random Value
    const ClientRandomValue = window.crypto.getRandomValues(new Uint8Array(16));
    // 256 bit Salt
    const salt = createSalt(ClientRandomValue);
    // 256bit Derived Key
    console.log(salt);
    const DerivedKey = await argon2encrypt(userinfo.password, salt);
    console.log(DerivedKey);
    // 128bit Derived Encryption Key & Derived Authentication Key
    const DerivedEncryptionKey = DerivedKey.slice(0,16);
    const DerivedAuthenticationKey = DerivedKey.slice(16,32);
    // 128bit Encrypted Master Key
    const EncryptedMasterKey = AESECB(MasterKey, DerivedEncryptionKey);
    const HashedAuthenticationKey = SHA256(DerivedAuthenticationKey);

    const sendData = {
      email: userinfo.email,
      client_random_value: byteArray2base64(ClientRandomValue),
      encrypted_master_key: byteArray2base64(EncryptedMasterKey),
      hashed_authentication_key: byteArray2base64(HashedAuthenticationKey),
    };
    console.log(sendData);

    const result = await axiosWithSession.post<UserForm, AxiosResponse<{success: boolean}>>(`${appLocation}/api/signup`, sendData);
    console.log(result);
    return {success: result.data.success ?? false, ...userinfo};
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

export const deleteTOTPAsync = createAsyncThunk<void, void>(
  'auth/delete_totp',
  async (_) => {
    await axiosWithSession.delete(`${appLocation}/api/user/totp`);
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
        state.user = {email: action.payload.email, useTowFactorAuth: false};
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
      });
  }
});

export default authSlice.reducer;

