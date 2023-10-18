import type { CaseReducer } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosWithSession } from '~/lib/axios';
import type { AuthState } from '~/features/auth/authSlice';
import { setProgress, progress } from '~/features/progress/progressSlice';

// mfaセッションを削除する処理
export const mfaCancelAsync = createAsyncThunk(
  'auth/mfaCancel',
  async (_, { dispatch }) => {
    try {
      await axiosWithSession.post('/api/mfacancel', null, {
        onUploadProgress: (progressEvent) => {
          dispatch(setProgress(progress(0, 1, progressEvent)));
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  },
);

export const afterMFACancelAsyncFullfilled: CaseReducer<AuthState> = (
  state,
) => {
  state.loginStatus = { state: null, step: 'EmailAndPass' };
  state.mfacode = null;
  state.suggestedMfa = [];
};
