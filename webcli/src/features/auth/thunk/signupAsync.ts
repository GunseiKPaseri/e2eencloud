import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession } from '~/lib/axios';
import type { PostSignUp } from '~/features/auth/authSlice';
import {
  setProgress,
  deleteProgress,
  progress,
} from '~/features/progress/progressSlice';

// サインアップ処理
export const signupAsync = createAsyncThunk<
  { success: boolean },
  { email: string }
>('auth/signup', async (userinfo, { dispatch }) => {
  try {
    const result = await axiosWithSession.post<
      PostSignUp,
      AxiosResponse<{ success: boolean }>
    >(
      '/api/signup',
      { email: userinfo.email },
      {
        onUploadProgress: (progressEvent) => {
          dispatch(setProgress(progress(0, 1, progressEvent)));
        },
      },
    );
    dispatch(deleteProgress());
    return { success: result.data.success ?? false };
  } catch (e) {
    // console.error(e);
    dispatch(deleteProgress());
    return { success: false };
  }
});
