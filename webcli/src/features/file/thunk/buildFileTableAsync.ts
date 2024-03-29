import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setProgress, deleteProgress, progress } from '~/features/progress/progressSlice';
import { buildFileTable, decryptoFileInfo } from '~/features/file/utils';
import type { FileState } from '~/features/file/fileSlice';
import type { BuildFileTableAsyncResult } from '~/features/file/file.type';
import { assertFileNodeFolder } from '~/features/file/filetypeAssert';
import { getAllFileInfoRaw } from '../api';

/**
 * ファイル情報を解析してディレクトリツリーを構成するReduxThunk
 */
export const buildFileTableAsync = createAsyncThunk<BuildFileTableAsyncResult>(
  'file/createfiletree',
  async (_, { dispatch }) => {
    const step = 3;
    dispatch(setProgress(progress(0, step)));
    // get all file info
    const rowfiles = await getAllFileInfoRaw({
      onDownloadProgress: (progressEvent) => {
        dispatch(setProgress(progress(0, step, progressEvent)));
      },
    });
    dispatch(setProgress(progress(1, step)));
    const files = await Promise.all(rowfiles.map((x) => decryptoFileInfo(x)));
    dispatch(setProgress(progress(2, step)));

    // create filetable
    // console.log(files);

    const result = buildFileTable(files);
    dispatch(deleteProgress());
    return result;
  },
);

export const afterBuildFileTableAsyncFullfilled:
CaseReducer<FileState, PayloadAction<BuildFileTableAsyncResult>> = (state, action) => {
  // 生成したファイルツリーをstateに反映
  state.fileTable = action.payload.fileTable;
  state.tagTree = action.payload.tagTree;
  const rootOrigin = action.payload.fileTable.root;
  assertFileNodeFolder(rootOrigin);
  state.activeFileGroup = {
    type: 'dir', folderId: 'root', files: rootOrigin.files, selecting: [], parents: ['root'],
  };
};
