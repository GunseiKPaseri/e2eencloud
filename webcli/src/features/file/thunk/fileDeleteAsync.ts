import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import type { BuildFileTableAsyncResult } from '../file.type';
import {
  getAllDependentFile,
  buildFileTable,
} from '../utils';
import {
  assertFileNodeFolder,
} from '../filetypeAssert';
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';
import type { RootState } from '../../../app/store';
import type { FileState } from '../fileSlice';
import { enqueueSnackbar } from '../../snackbar/snackbarSlice';
import { axiosWithSession } from '../../../lib/axios';
import { updateUsageAsync } from './updateUsageAsync';

/**
 * ファイルを完全削除するReduxThunk
 */
export const fileDeleteAsync = createAsyncThunk<
BuildFileTableAsyncResult,
{ targetIds: string[] },
{ state: RootState }>(
  'file/filedelete',
  async ({ targetIds }, { getState, dispatch }) => {
    const step = 1;
    const state = getState();
    dispatch(setProgress(progress(0, step)));

    const { fileTable } = state.file;

    const deleteItems = targetIds.map((targetId) => (
      getAllDependentFile(fileTable[targetId], fileTable)
    )).flat();

    // get all file info
    const rowfiles = await axiosWithSession.post<
    { files: string[] },
    AxiosResponse<{ deleted: string[] }>
    >(
      '/api/files/delete',
      { files: deleteItems },
      {
        onDownloadProgress: (progressEvent) => {
          dispatch(setProgress(progress(0, step, progressEvent)));
        },
      },
    );

    // console.log(rowfiles);
    const deleteItemsSet = new Set(rowfiles.data.deleted);
    const result = buildFileTable(
      Object
        .values(fileTable)
        .filter((x) => !deleteItemsSet.has(x.id) && x.id !== 'root')
        .map((x) => ({ ...x.origin })),
    );
    dispatch(deleteProgress());
    const itemsize = targetIds.filter((id) => deleteItemsSet.has(id)).length;
    dispatch(enqueueSnackbar({ message: `${itemsize}件のファイルを完全に削除しました`, options: { variant: 'success' } }));

    // storage更新
    await dispatch(updateUsageAsync());

    return result;
  },
);

export const afterFileDeleteAsyncFullfilled:
CaseReducer<FileState, PayloadAction<BuildFileTableAsyncResult>> = (state, action) => {
  // 生成したファイルツリーをstateに反映
  state.fileTable = action.payload.fileTable;
  state.tagTree = action.payload.tagTree;
  assertFileNodeFolder(action.payload.fileTable.root);
  state.activeFile = null;
  state.activeFileGroup = {
    type: 'dir', folderId: 'root', files: action.payload.fileTable.root.files, selecting: [], parents: ['root'],
  };
};
