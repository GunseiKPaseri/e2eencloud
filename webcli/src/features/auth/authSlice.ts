import { createSlice } from '@reduxjs/toolkit';

// Thunk
import { signupAsync } from './thunk/signupAsync';
import { confirmEmailAsync, afterConfirmEmailAsyncFullfilled } from './thunk/confirmEmailAsync';
import { addTOTPAsync, afterAddTOTPAsyncFullfilled } from './thunk/addTOTPAsync';
import { deleteTOTPAsync, afterDeleteTOTPAsyncFullfilled } from './thunk/deleteTOTPAsync';
import {
  afterLoginAsyncFullfilled,
  afterLoginAsyncPending,
  afterLoginAsyncRejected,
  loginAsync,
} from './thunk/loginAsync';
import { afterLogoutAsyncFullfilled, logoutAsync } from './thunk/logoutAsync';
import { changePasswordAsync } from './thunk/changePasswordAsync';

export { signupAsync };
export { confirmEmailAsync };
export { addTOTPAsync };
export { deleteTOTPAsync };
export { loginAsync };
export { logoutAsync };
export { changePasswordAsync };

export interface PostSignUp {
  email: string;
}

export interface EmailConfirm {
  type: 'ADD_USER',
  token: string,
  clientRandomValueBase64: string,
  encryptedMasterKeyBase64: string,
  encryptedMasterKeyIVBase64: string,
  hashedAuthenticationKeyBase64: string,
  encryptedRSAPrivateKeyBase64: string,
  encryptedRSAPrivateKeyIVBase64: string,
  RSAPublicKeyBase64: string
}

export interface UserState {
  email: string;
  useTwoFactorAuth: boolean;
  MasterKey: number[];
  authority: 'ADMIN' | null;
}

type ConfirmState = 'LOADING' | 'ERROR' | 'SUCCESS';

export interface AuthState {
  user: UserState | null;
  signupStatus: 'failed' | null;
  loginStatus: 'failed' | null;
  confirmstate: Record<string, ConfirmState | undefined>;
}

const initialState: AuthState = {
  user: null,
  signupStatus: null,
  loginStatus: null,
  confirmstate: {},
};

// Slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(confirmEmailAsync.fulfilled, afterConfirmEmailAsyncFullfilled)
      .addCase(addTOTPAsync.fulfilled, afterAddTOTPAsyncFullfilled)
      .addCase(deleteTOTPAsync.fulfilled, afterDeleteTOTPAsyncFullfilled)
      .addCase(loginAsync.pending, afterLoginAsyncPending)
      .addCase(loginAsync.rejected, afterLoginAsyncRejected)
      .addCase(loginAsync.fulfilled, afterLoginAsyncFullfilled)
      .addCase(logoutAsync.fulfilled, afterLogoutAsyncFullfilled);
  },
});

export default authSlice.reducer;
