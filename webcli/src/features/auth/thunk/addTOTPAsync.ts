import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { enqueueSnackbar } from '../../snackbar/snackbarSlice';
import { axiosWithSession } from '../../../lib/axios';
import { APP_LOCATION } from '../../../const';
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';

import type { AuthState } from '../authSlice';
// TOTP追加処理
export const addTOTPAsync = createAsyncThunk<void, { secretKey: string, token: string }>(
  'auth/add_totp',
  async (secretkey, { dispatch }) => {
    try {
      await axiosWithSession.put<{ secretKey: string, token: string }>(
        `${APP_LOCATION}/api/my/totp`,
        secretkey,
        {
          onUploadProgress: (progressEvent) => {
            dispatch(setProgress(progress(0, 1, progressEvent)));
          },
        },
      );
      dispatch(enqueueSnackbar({ message: '正常に反映しました', options: { variant: 'success' } }));
    } catch (_e) {
      dispatch(enqueueSnackbar({ message: 'エラーが発生しました', options: { variant: 'success' } }));
    }
    dispatch(deleteProgress());
  },
);

export const afterAddTOTPAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<void>> = () => {
  //
};
