import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import type { StorageInfo } from '../file.type';
import { axiosWithSession, appLocation } from '../../componentutils';
import type { FileState } from '../fileSlice';

/**
 * 容量情報を更新するReduxThunk
 */
export const updateUsageAsync = createAsyncThunk<StorageInfo>(
  'file/updateUsage',
  async () => {
    // get all file info
    const capacity = await axiosWithSession.get<Record<string, never>, AxiosResponse<{ 'usage':number, 'max_capacity': number }>>(
      `${appLocation}/api/user/capacity`,
    );
    const result: StorageInfo = {
      usage: capacity.data.usage,
      capacity: capacity.data.max_capacity,
    };
    return result;
  },
);

export const afterUpdateUsageAsyncFullfilled:
CaseReducer<FileState, PayloadAction<StorageInfo>> = (state, action) => {
  // 生成したファイルツリーをstateに反映
  state.storage = action.payload;
};
