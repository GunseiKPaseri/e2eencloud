import { createSlice } from '@reduxjs/toolkit'

import {
  FileTable,
  tagGroup,
  dirGroup,
  searchGroup,
  StorageInfo
} from './file.type'

import { logoutAsync } from '../auth/authSlice'

import {
  buildFileTableAsync,
  afterBuildFileTableAsyncFullfilled
} from './thunk/buildFileTableAsync'
import {
  createDiffAsync,
  afterCreateDiffAsyncFullfilled
} from './thunk/createDiffAsync'
import {
  fileuploadAsync,
  afterFileuploadAsyncFullfilled
} from './thunk/fileuploadAsync'
import {
  createFolderAsync,
  afterCreateFolderAsyncFullfilled
} from './thunk/createFolderAsync'
import {
  filedownloadAsync,
  afterFiledownloadAsyncFullfilled
} from './thunk/filedownloadAsync'

import {
  fileDeleteAsync,
  afterFileDeleteAsyncFullfilled
} from './thunk/fileDeleteAsync'

import {
  changeActiveFileGroupDir,
  changeActiveFileGroupTag,
  changeActiveFileGroupSearch,
  changeSelection,
  afterChangeActiveFileGroupDir,
  afterChangeActiveFileGroupTag,
  afterChangeActiveFileGroupSearch,
  afterChangeSelection
} from './thunk/changeActiveFileGroup'
import { afterUpdateUsageAsyncFullfilled, updateUsageAsync } from './thunk/updateUsageAsync'
export { buildFileTableAsync }
export { createDiffAsync }
export { fileuploadAsync }
export { createFolderAsync }
export { filedownloadAsync }
export { fileDeleteAsync }
export {
  changeActiveFileGroupDir,
  changeActiveFileGroupTag,
  changeActiveFileGroupSearch,
  changeSelection
}

/**
 * ファイル関連のReduxState
 */
export interface FileState {
  loading: 0|1,
  fileTable: FileTable,
  tagTree: { [key: string]: string[] },
  activeFile: {
    link: string,
    fileId: string,
    similarFiles: string[]
  } | null,
  activeFileGroup: null | tagGroup | dirGroup | searchGroup,
  storage: StorageInfo
};

const initialState: FileState = {
  loading: 0,
  fileTable: {},
  tagTree: {},
  activeFile: null,
  activeFileGroup: null,
  storage: {
    usage: 0,
    capacity: 0
  }
}

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(buildFileTableAsync.fulfilled, afterBuildFileTableAsyncFullfilled)
      .addCase(fileuploadAsync.fulfilled, afterFileuploadAsyncFullfilled)
      .addCase(createDiffAsync.fulfilled, afterCreateDiffAsyncFullfilled)
      .addCase(createFolderAsync.fulfilled, afterCreateFolderAsyncFullfilled)
      .addCase(filedownloadAsync.fulfilled, afterFiledownloadAsyncFullfilled)
      .addCase(fileDeleteAsync.fulfilled, afterFileDeleteAsyncFullfilled)
      .addCase(updateUsageAsync.fulfilled, afterUpdateUsageAsyncFullfilled)
      .addCase(changeActiveFileGroupDir, afterChangeActiveFileGroupDir)
      .addCase(changeActiveFileGroupTag, afterChangeActiveFileGroupTag)
      .addCase(changeActiveFileGroupSearch, afterChangeActiveFileGroupSearch)
      .addCase(changeSelection, afterChangeSelection)
      .addCase(logoutAsync.pending, (state, action) => {
        // ログアウト時削除
        Object.values(state.fileTable).forEach((row) => {
          if (row.type === 'file' && row.blobURL) {
            URL.revokeObjectURL(row.blobURL)
          }
        })
        // initialState
        state.loading = 0
        state.fileTable = {}
        state.tagTree = {}
        state.activeFile = null
        state.activeFileGroup = null
        state.storage = { usage: 0, capacity: 0 }
      })
  }
})

export default fileSlice.reducer
