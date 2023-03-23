import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession } from '../../../lib/axios';
import { appLocation } from '../../../const';

import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';

import type { PostSignUp } from '../authSlice';
// サインアップ処理
export const signupAsync = createAsyncThunk<{ success: boolean }, { email: string }>(
  'auth/signup',
  async (userinfo, { dispatch }) => {
    try {
      const result = await axiosWithSession.post<
      PostSignUp,
      AxiosResponse<{ success: boolean }>
      >(
        `${appLocation}/api/signup`,
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
  },
);
