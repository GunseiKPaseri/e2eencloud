import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios, { AxiosRequestConfig } from 'axios';
import { AESECB, createSalt, SHA256, argon2encrypt, byteArray2base64 } from './util';

interface UserForm {
  email: string;
  password: string;
}

interface UserState {
  email: string;
  token: string;
}
export interface AuthState {
  user: UserState | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

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

    const config: AxiosRequestConfig = {
      headers: {
        'Content-type': 'application/json',
      },
    };

    console.log(userinfo);

    const result = await axios.post('http://localhost:3001/api/signup', sendData, config);
    console.log(result);
    return {success: result.data.success ?? false, ...userinfo};
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
        state.user = {email: action.payload.email, token: action.payload.password};
      });
  }
});

export default authSlice.reducer;

