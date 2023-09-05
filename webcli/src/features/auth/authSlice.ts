import { createAction, createSlice } from '@reduxjs/toolkit';
import {
  addFIDO2Async,
  afterAddFIDO2AsyncFullfilled,
} from './thunk/addFIDO2Async';
import {
  addTOTPAsync,
  afterAddTOTPAsyncFullfilled,
} from './thunk/addTOTPAsync';
import { changePasswordAsync } from './thunk/changePasswordAsync';
import {
  confirmEmailAsync,
  afterConfirmEmailAsyncFullfilled,
} from './thunk/confirmEmailAsync';
import {
  deleteTOTPAsync,
  afterDeleteTOTPAsyncFullfilled,
} from './thunk/deleteTOTPAsync';
import {
  afterFIDO2LoginAsyncFullfilled,
  afterFIDO2LoginAsyncPending,
  afterFIDO2LoginAsyncRejected,
  fido2LoginAsync,
} from './thunk/fido2LoginAsync';
import {
  afterLoginAsyncFullfilled,
  afterLoginAsyncPending,
  afterLoginAsyncRejected,
  loginAsync,
} from './thunk/loginAsync';
import {
  loginSuccess,
  afterLoginSuccessFullfilled,
} from './thunk/loginSuccessAsync';
import { afterLogoutAsyncFullfilled, logoutAsync } from './thunk/logoutAsync';
import {
  afterMFACancelAsyncFullfilled,
  mfaCancelAsync,
} from './thunk/mfaCancelAsync';
import {
  afterMFACodeLoginAsyncFullfilled,
  afterMFACodeLoginAsyncPending,
  afterMFACodeLoginAsyncRejected,
  mfacodeLoginAsync,
} from './thunk/mfacodeLoginAsync';
import { removeMFACode, afterRemoveMFACode } from './thunk/removeMFACode';
// Thunk
import { signupAsync } from './thunk/signupAsync';
import {
  afterTOTPLoginAsyncFullfilled,
  afterTOTPLoginAsyncPending,
  afterTOTPLoginAsyncRejected,
  totpLoginAsync,
} from './thunk/totpLoginAsync';

export const selectMFASolution = createAction<AuthState['loginStatus']['step']>(
  'auth/selectMFASolution',
);

export { removeMFACode };
export { signupAsync };
export { confirmEmailAsync };
export { addFIDO2Async };
export { addTOTPAsync };
export { deleteTOTPAsync };
export { loginAsync };
export { logoutAsync };
export { totpLoginAsync };
export { changePasswordAsync };
export { mfaCancelAsync };
export { mfacodeLoginAsync };

export interface PostSignUp {
  email: string;
}

export interface EmailConfirm {
  type: 'ADD_USER';
  token: string;
  clientRandomValueBase64: string;
  encryptedMasterKeyBase64: string;
  encryptedMasterKeyIVBase64: string;
  hashedAuthenticationKeyBase64: string;
  encryptedRSAPrivateKeyBase64: string;
  encryptedRSAPrivateKeyIVBase64: string;
  RSAPublicKeyBase64: string;
}

export interface UserState {
  email: string;
  MasterKey: number[];
  authority: 'ADMIN' | null;
}

export type MFASolution = 'CODE' | 'EMAIL' | 'FIDO2' | 'TOTP';

type ConfirmState = 'LOADING' | 'ERROR' | 'SUCCESS';

export interface AuthState {
  mfacode: string[] | null;
  suggestedMfa: MFASolution[];
  user: UserState | null;
  signupStatus: 'failed' | null;
  loginStatus:
    | { step: 'EmailAndPass' | MFASolution; state: null | 'pending' | 'error' }
    | { step: 'SelectMFASolution' };
  confirmstate: Record<string, ConfirmState | undefined>;
}

const initialState: AuthState = {
  mfacode: null,
  suggestedMfa: [],
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
      .addCase(mfacodeLoginAsync.pending, afterMFACodeLoginAsyncPending)
      .addCase(mfacodeLoginAsync.rejected, afterMFACodeLoginAsyncRejected)
      .addCase(mfacodeLoginAsync.fulfilled, afterMFACodeLoginAsyncFullfilled)
      .addCase(fido2LoginAsync.rejected, afterFIDO2LoginAsyncRejected)
      .addCase(fido2LoginAsync.pending, afterFIDO2LoginAsyncPending)
      .addCase(fido2LoginAsync.fulfilled, afterFIDO2LoginAsyncFullfilled)
      .addCase(logoutAsync.fulfilled, afterLogoutAsyncFullfilled)
      .addCase(removeMFACode, afterRemoveMFACode)
      .addCase(mfaCancelAsync.fulfilled, afterMFACancelAsyncFullfilled)
      .addCase(selectMFASolution, (state, action) => {
        // 指定MFA手段に変更する
        state.loginStatus = { step: action.payload, state: null };
      });
  },
});

export default authSlice.reducer;
