import { createAction, createSlice } from '@reduxjs/toolkit'

import {
  FileTable,
  tagGroup,
  dirGroup,
  FileNode,
} from './file.type'

import { assertFileNodeFolder, getFileParentsList } from './utils'
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
  } | null,
  activeFileGroup: null | tagGroup | dirGroup
};

const initialState: FileState = {
  loading: 0,
  fileTable: {},
  tagTree: {},
  activeFile: null,
  activeFileGroup: null
}

/**
 * activeFileGroupを変更(ディレクトリ)
 * */
export const changeActiveDir = createAction<{id: string}>('file/changeActiveFileGroupDirr')

/**
 * activeFileGroupを変更(タグ)
 * */
export const changeActiveTag = createAction<{tag: string}>('file/changeActiveFileGroupTag')

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
      .addCase(changeActiveDir, (state, action) => {
        // 指定idのディレクトリをactiveディレクトリにする
        const firstId = action.payload.id
        const activeDir:FileNode = state.fileTable[firstId]
        if (activeDir.type !== 'folder') throw new Error('指定オブジェクトはactiveDirになれません')
        const parents = getFileParentsList(firstId, state.fileTable)
        state.activeFileGroup = {
          type: 'dir',
          folderId: firstId,
          files: activeDir.files,
          parents
        }
      })
      .addCase(changeActiveTag, (state, action) => {
      // 指定タグのディレクトリをactiveにする
        state.activeFileGroup = {
          type: 'tag',
          files: state.tagTree[action.payload.tag] ?? [],
          tagName: action.payload.tag
        }
      })
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
