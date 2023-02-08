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
    const capacity = await axiosWithSession.get<Record<string, never>, AxiosResponse<{ 'usage': string, 'max_capacity': string }>>(
      `${appLocation}/api/my/capacity`,
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
  // 生成したファイルツリーをstateに反映
  state.storage = action.payload;
};
