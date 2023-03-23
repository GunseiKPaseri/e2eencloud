import { type CaseReducer, createAction } from '@reduxjs/toolkit';
import { type AuthState } from '~/features/auth/authSlice';

/**
 * MFACodeを削除
 * */
export const removeMFACode = createAction('auth/removeMFACode');

export const afterRemoveMFACode:
CaseReducer<AuthState> = (state) => {
  // 指定タグのディレクトリをactiveにする
  state.mfacode = null;
};
