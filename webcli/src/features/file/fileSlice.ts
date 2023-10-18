import { createSlice } from '@reduxjs/toolkit';
import { logoutAsync } from '~/features/auth/thunk/logoutAsync';
import type {
  FileTable,
  TagGroup,
  DirGroup,
  SearchGroup,
  StorageInfo,
} from './file.type';
import {
  buildFileTableAsync,
  afterBuildFileTableAsyncFullfilled,
} from './thunk/buildFileTableAsync';
import {
  changeActiveFileGroupDir,
  changeActiveFileGroupTag,
  changeActiveFileGroupSearch,
  changeSelection,
  afterChangeActiveFileGroupDir,
  afterChangeActiveFileGroupTag,
  afterChangeActiveFileGroupSearch,
  afterChangeSelection,
} from './thunk/changeActiveFileGroup';
import {
  createDiffAsync,
  afterCreateDiffAsyncFullfilled,
} from './thunk/createDiffAsync';
import {
  createFolderAsync,
  afterCreateFolderAsyncFullfilled,
} from './thunk/createFolderAsync';
import {
  fileDeleteAsync,
  afterFileDeleteAsyncFullfilled,
} from './thunk/fileDeleteAsync';
import {
  filedownloadAsync,
  afterFiledownloadAsyncFullfilled,
} from './thunk/filedownloadAsync';
import {
  fileuploadAsync,
  afterFileuploadAsyncFullfilled,
} from './thunk/fileuploadAsync';
import {
  afterUpdateUsage,
  afterUpdateUsageAsyncFullfilled,
  updateUsage,
  updateUsageAsync,
} from './thunk/updateUsageAsync';

export { updateUsageAsync } from './thunk/updateUsageAsync';

/**
 * ファイル関連のReduxState
 */
export interface FileState {
  loading: 0 | 1;
  fileTable: FileTable;
  tagTree: Record<string, string[]>;
  activeFile: {
    link: string;
    fileId: string;
    similarFiles: string[];
  } | null;
  activeFileGroup: null | TagGroup | DirGroup | SearchGroup;
  storage: StorageInfo;
}

const initialState: FileState = {
  activeFile: null,
  activeFileGroup: null,
  fileTable: {},
  loading: 0,
  storage: {
    capacity: 0,
    usage: 0,
  },
  tagTree: {},
};

export const fileSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addCase(
        buildFileTableAsync.fulfilled,
        afterBuildFileTableAsyncFullfilled,
      )
      .addCase(fileuploadAsync.fulfilled, afterFileuploadAsyncFullfilled)
      .addCase(createDiffAsync.fulfilled, afterCreateDiffAsyncFullfilled)
      .addCase(createFolderAsync.fulfilled, afterCreateFolderAsyncFullfilled)
      .addCase(filedownloadAsync.fulfilled, afterFiledownloadAsyncFullfilled)
      .addCase(fileDeleteAsync.fulfilled, afterFileDeleteAsyncFullfilled)
      .addCase(updateUsageAsync.fulfilled, afterUpdateUsageAsyncFullfilled)
      .addCase(updateUsage, afterUpdateUsage)
      .addCase(changeActiveFileGroupDir, afterChangeActiveFileGroupDir)
      .addCase(changeActiveFileGroupTag, afterChangeActiveFileGroupTag)
      .addCase(changeActiveFileGroupSearch, afterChangeActiveFileGroupSearch)
      .addCase(changeSelection, afterChangeSelection)
      .addCase(logoutAsync.pending, (state) => {
        // ログアウト時削除
        Object.values(state.fileTable).forEach((row) => {
          if (row.type === 'file' && row.blobURL) {
            URL.revokeObjectURL(row.blobURL);
          }
        });
        // initialState
        state.loading = 0;
        state.fileTable = {};
        state.tagTree = {};
        state.activeFile = null;
        state.activeFileGroup = null;
        state.storage = { capacity: 0, usage: 0 };
      });
  },
  initialState,
  name: 'file',
  reducers: {},
});

export default fileSlice.reducer;

export { buildFileTableAsync } from './thunk/buildFileTableAsync';
export { createDiffAsync } from './thunk/createDiffAsync';
export { fileuploadAsync } from './thunk/fileuploadAsync';
export { createFolderAsync } from './thunk/createFolderAsync';
export { filedownloadAsync } from './thunk/filedownloadAsync';
export { fileDeleteAsync } from './thunk/fileDeleteAsync';
export {
  changeActiveFileGroupDir,
  changeActiveFileGroupTag,
  changeActiveFileGroupSearch,
  changeSelection,
} from './thunk/changeActiveFileGroup';
