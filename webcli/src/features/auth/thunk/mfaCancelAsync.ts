import type { CaseReducer } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosWithSession } from '../../../lib/axios';

import { setProgress, progress } from '../../progress/progressSlice';

import type { AuthState } from '../authSlice';

// mfaセッションを削除する処理
export const mfaCancelAsync = createAsyncThunk(
  'auth/mfaCancel',
  async (_, { dispatch }) => {
    try {
      await axiosWithSession.post(
        '/api/mfacancel',
        null,
        {
          onUploadProgress: (progressEvent) => {
            dispatch(setProgress(progress(0, 1, progressEvent)));
          },
        },
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  },
);

export const afterMFACancelAsyncFullfilled:
CaseReducer<AuthState> = (state) => {
  state.loginStatus = { step: 'EmailAndPass', state: null };
  state.mfacode = null;
  state.suggestedMfa = [];
};
