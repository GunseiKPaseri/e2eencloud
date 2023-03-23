import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import type { StorageInfo } from '../file.type';
import { axiosWithSession } from '../../../lib/axios';
import type { FileState } from '../fileSlice';

/**
 * 容量情報を更新するReduxThunk
 */
export const updateUsageAsync = createAsyncThunk<StorageInfo>(
  'file/updateUsageAsync',
  async () => {
    // get all file info
    const capacity = await axiosWithSession.get<Record<string, never>, AxiosResponse<{ 'usage': string, 'max_capacity': string }>>(
      '/api/my/capacity',
    );
    const result: StorageInfo = {
      usage: Number(capacity.data.usage),
      capacity: Number(capacity.data.max_capacity),
    };
    return result;
  },
);

export const afterUpdateUsageAsyncFullfilled:
CaseReducer<FileState, PayloadAction<StorageInfo>> = (state, action) => {
  // ストレージ情報を更新
  state.storage = action.payload;
};

/**
 * 取得済の容量情報を更新
 * */
export const updateUsage = createAction<StorageInfo>('file/updateUsage');

export const afterUpdateUsage:
CaseReducer<FileState, PayloadAction<StorageInfo>> = (state, action) => {
  // ストレージ情報を更新
  state.storage = action.payload;
};
