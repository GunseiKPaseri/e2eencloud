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

export interface UserForm {
  email: string;
  password: string;
}

export interface UserState {
  email: string;
  useTwoFactorAuth: boolean;
  MasterKey: number[];
  authority: 'ADMIN' | null;
}
export interface AuthState {
  user: UserState | null;
  signupStatus: 'failed' | null;
  loginStatus: 'failed' | null;
  confirmstate: 0 | 1;
}

const initialState: AuthState = {
  user: null,
  signupStatus: null,
  loginStatus: null,
  confirmstate: 0,
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
