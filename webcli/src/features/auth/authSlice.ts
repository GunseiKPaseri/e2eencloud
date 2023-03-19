import { createSlice } from '@reduxjs/toolkit';

// Thunk
import { signupAsync } from './thunk/signupAsync';
import { confirmEmailAsync, afterConfirmEmailAsyncFullfilled } from './thunk/confirmEmailAsync';
import { addFIDO2Async, afterAddFIDO2AsyncFullfilled } from './thunk/addFIDO2Async';
import { addTOTPAsync, afterAddTOTPAsyncFullfilled } from './thunk/addTOTPAsync';
import { deleteTOTPAsync, afterDeleteTOTPAsyncFullfilled } from './thunk/deleteTOTPAsync';
import {
  afterLoginAsyncFullfilled,
  afterLoginAsyncPending,
  afterLoginAsyncRejected,
  loginAsync,
} from './thunk/loginAsync';
import {
  loginSuccess,
  afterLoginSuccessFullfilled,
} from './thunk/loginSuccess';

import { afterLogoutAsyncFullfilled, logoutAsync } from './thunk/logoutAsync';
import { changePasswordAsync } from './thunk/changePasswordAsync';
import {
  afterTOTPLoginAsyncFullfilled,
  afterTOTPLoginAsyncPending,
  afterTOTPLoginAsyncRejected,
  totpLoginAsync,
} from './thunk/totpLoginAsync';

export { signupAsync };
export { confirmEmailAsync };
export { addFIDO2Async };
export { addTOTPAsync };
export { deleteTOTPAsync };
export { loginAsync };
export { logoutAsync };
export { totpLoginAsync };
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
  loginStatus: { step: 'EmailAndPass', state: null | 'pending' | 'error' } | { step: 'TOTP', state: null | 'pending' | 'error' };
  confirmstate: Record<string, ConfirmState | undefined>;
}

const initialState: AuthState = {
  user: null,
  signupStatus: null,
  loginStatus: { step: 'EmailAndPass', state: null },
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
      .addCase(addFIDO2Async.fulfilled, afterAddFIDO2AsyncFullfilled)
      .addCase(deleteTOTPAsync.fulfilled, afterDeleteTOTPAsyncFullfilled)
      .addCase(loginAsync.pending, afterLoginAsyncPending)
      .addCase(loginAsync.rejected, afterLoginAsyncRejected)
      .addCase(loginAsync.fulfilled, afterLoginAsyncFullfilled)
      .addCase(loginSuccess.fulfilled, afterLoginSuccessFullfilled)
      .addCase(totpLoginAsync.pending, afterTOTPLoginAsyncPending)
      .addCase(totpLoginAsync.rejected, afterTOTPLoginAsyncRejected)
      .addCase(totpLoginAsync.fulfilled, afterTOTPLoginAsyncFullfilled)
      .addCase(logoutAsync.fulfilled, afterLogoutAsyncFullfilled);
  },
});

export default authSlice.reducer;
