import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '~/store/store';
import { enqueueSnackbar } from '~/features/snackbar/snackbarSlice';
import { setProgress, deleteProgress, progress } from '~/features/progress/progressSlice';
import {
  getAllDependentFile,
  buildFileTable,
} from '~/features/file/utils';
import type { FileState } from '~/features/file/fileSlice';
import type { BuildFileTableAsyncResult } from '~/features/file/file.type';
import {
  assertFileNodeFolder,
} from '~/features/file/filetypeAssert';
import { updateUsageAsync } from './updateUsageAsync';
import { deleteFile } from '../api';

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

    const rawFiles = await deleteFile({ deleteItems });

    // console.log(rowfiles);
    const deleteItemsSet = new Set(rawFiles.deleted);
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
