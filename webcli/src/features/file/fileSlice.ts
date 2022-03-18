import { createAction, createSlice } from '@reduxjs/toolkit'

import {
  FileTable,
  tagGroup,
  dirGroup,
  FileNode,
  FileInfo,
  searchGroup,
} from './file.type'

import { getFileParentsList } from './utils'
import { logoutAsync } from '../auth/authSlice'

import {
  buildFileTableAsync,
  afterBuildFileTableAsyncFullfilled
} from './thunk/buildFileTableAsync'
export { buildFileTableAsync }
import {
  createDiffAsync,
  afterCreateDiffAsyncFullfilled
} from './thunk/createDiffAsync'
export { createDiffAsync }
import {
  fileuploadAsync,
  afterFileuploadAsyncFullfilled
} from './thunk/fileuploadAsync'
export { fileuploadAsync }
import {
  createFolderAsync,
  afterCreateFolderAsyncFullfilled
} from './thunk/createFolderAsync'
export { createFolderAsync }
import {
  filedownloadAsync,
  afterFiledownloadAsyncFullfilled
} from './thunk/filedownloadAsync'
export { filedownloadAsync }

import {
  fileDeleteAsync,
  afterFileDeleteAsyncFullfilled
} from './thunk/fileDeleteAsync'
export { fileDeleteAsync }

import {
  changeActiveFileGroupDir,
  changeActiveFileGroupTag,
  afterChangeActiveFileGroupDir,
  afterChangeActiveFileGroupTag,
  afterChangeActiveFileGroupSearch,
  changeActiveFileGroupSearch
} from './thunk/changeActiveFileGroup'
export {
  changeActiveFileGroupDir,
  changeActiveFileGroupTag, 
  changeActiveFileGroupSearch
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
  activeFileGroup: null | tagGroup | dirGroup | searchGroup
};

const initialState: FileState = {
  loading: 0,
  fileTable: {},
  tagTree: {},
  activeFile: null,
  activeFileGroup: null,
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
      .addCase(changeActiveFileGroupDir, afterChangeActiveFileGroupDir)
      .addCase(changeActiveFileGroupTag, afterChangeActiveFileGroupTag)
      .addCase(changeActiveFileGroupSearch, afterChangeActiveFileGroupSearch)
      .addCase(logoutAsync.pending, (state, action) =>{
        // ログアウト時削除
        Object.values(state.fileTable).map((row) =>{
          if(row.type === 'file' && row.blobURL){
            URL.revokeObjectURL(row.blobURL)
          }
        })
        // initialState
        state.loading = 0
        state.fileTable = {}
        state.tagTree = {}
        state.activeFile = null
        state.activeFileGroup = null
      })
  }
})

export default fileSlice.reducer
