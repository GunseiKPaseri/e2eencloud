import { createAsyncThunk, createAction, createSlice } from '@reduxjs/toolkit'

import {
  FileInfoFolder,
  FileTable,
  tagGroup,
  dirGroup,
  FileNode,
  getfileinfoJSONRow,
  FileCryptoInfoWithoutBin,
  FileCryptoInfoWithBin
} from './file.type'

import { allProgress, decryptAESGCM, getAESGCMKey } from '../../util'
import { axiosWithSession, appLocation } from '../componentutils'
import { AxiosResponse } from 'axios'
import { RootState } from '../../app/store'

import { setProgress, deleteProgress, progress } from '../progress/progressSlice'

import {
  assertFileNodeFolder,
  assertWritableDraftFileNodeFolder,
  assertNonWritableDraftFileNodeDiff,
  buildFileTable,
  decryptoFileInfo,
  genUUID,
  getEncryptedFileRaw,
  getFileHash,
  getSafeName,
  integrateDifference,
  submitFileInfoWithEncryption,
  submitFileWithEncryption,
  createDiff,
  assertFileInfoDiffFile,
  assertFileInfoFolder
} from './utils'

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
 * ファイルをアップロードするReduxThunk
 */
export const fileuploadAsync = createAsyncThunk<{uploaded: FileCryptoInfoWithBin[], parents: string[]}, {files: File[]}, {state: RootState}>(
  'file/fileupload',
  async (fileinput, { getState, dispatch }) => {
    const state = getState()
    const activeFileGroup = state.file.activeFileGroup
    if (activeFileGroup?.type !== 'dir') throw new Error('ここにアップロードできません')
    const changedNameFile = getSafeName(
      fileinput.files.map(x => x.name),
      activeFileGroup.files.flatMap(x => (state.file.fileTable[x].type === 'file' ? [state.file.fileTable[x].name] : []))
    )

    const parent = activeFileGroup.parents.length === 0 ? null : activeFileGroup.parents[activeFileGroup.parents.length - 1]

    const loadedfile = await allProgress(
      fileinput.files.map((x, i) => submitFileWithEncryption(x, changedNameFile[i], parent)),
      (resolved, all) => {
        dispatch(setProgress({ progress: resolved / (all + 1), progressBuffer: all / (all + 1) }))
      })
    dispatch(deleteProgress())

    return { uploaded: loadedfile, parents: activeFileGroup.parents }
  }
)

/**
 * フォルダを作成するReduxThunk
 */
export const createFolderAsync = createAsyncThunk<{uploaded: FileCryptoInfoWithoutBin, parents: string[]}, {name: string}, {state: RootState}>(
  'file/createFolder',
  async ({ name }, { getState, dispatch }) => {
    const state = getState()
    const activeFileGroup = state.file.activeFileGroup
    if (activeFileGroup?.type !== 'dir') throw new Error('ここにアップロードできません')
    if (name === '') throw new Error('空文字は許容されません')
    const [changedFolderName] = getSafeName([name],
      activeFileGroup.files.flatMap(x => (state.file.fileTable[x].type === 'folder' ? [state.file.fileTable[x].name] : []))
    )

    const parent = activeFileGroup.parents.length === 0 ? null : activeFileGroup.parents[activeFileGroup.parents.length - 1]
    const fileInfo: FileInfoFolder = {
      id: genUUID(),
      name: changedFolderName,
      createdAt: Date.now(),
      type: 'folder',
      parentId: parent
    }
    const addFolder = await submitFileInfoWithEncryption(fileInfo)

    return { uploaded: addFolder, parents: activeFileGroup.parents }
  }
)

/**
 * ファイルをダウンロードするThunk
 */
export const filedownloadAsync = createAsyncThunk<{url: string, fileId: string}, {fileId: string}, {state: RootState}>(
  'file/filedownload',
  async ({ fileId }, { getState, dispatch }) => {
    const step = 4
    dispatch(setProgress(progress(0, step)))

    const state = getState()
    const fileObj:FileNode | undefined = state.file.fileTable[fileId]

    if (!fileObj) throw new Error(`${fileId}は存在しません`)
    if (fileObj.type !== 'file') throw new Error('バイナリファイルが関連付いていない要素です')

    let url = fileObj.blobURL

    if (!url) {
      const { fileKeyBin, encryptedFileIVBin } = fileObj
      dispatch(setProgress(progress(1, step)))
      const fileKey = await getAESGCMKey(Uint8Array.from(fileKeyBin))
      dispatch(setProgress(progress(2, step)))

      const encryptedFile = await getEncryptedFileRaw(fileId)
      const filebin = await decryptAESGCM(encryptedFile, fileKey, Uint8Array.from(encryptedFileIVBin))
      dispatch(setProgress(progress(3, step)))
      const { hashStr } = await getFileHash(filebin)

      if (hashStr !== fileObj.sha256) throw new Error('hashが異なります')
      url = URL.createObjectURL(new Blob([filebin], { type: fileObj.mime }))
    }
    dispatch(deleteProgress())
    return { url, fileId }
  }
)

/**
 *  ファイル名を変更するReduxThunk
 */
export const createDiffAsync = createAsyncThunk<{uploaded: FileCryptoInfoWithoutBin, targetId: string}, Parameters<typeof createDiff>[0], {state: RootState}>(
  'file/rename',
  async (params, { getState, dispatch }) => {
    const step = 2
    dispatch(setProgress(progress(0, step)))

    const state = getState()
    const fileTable = state.file.fileTable

    const uploaded = createDiff(params, fileTable)

    const addObject = await submitFileInfoWithEncryption(uploaded)
    dispatch(setProgress(progress(1, step)))
    dispatch(deleteProgress())
    return { uploaded: addObject, targetId: params.targetId }
  }
)
/**
 * ファイル情報を解析してディレクトリツリーを構成するReduxThunk
 */
export const buildFileTableAsync = createAsyncThunk<{ fileTable: FileTable, tagTree: { [key: string]: string[] } }>(
  'file/createfiletree',
  async (_, { dispatch }) => {
    const step = 3
    dispatch(setProgress(progress(0, step)))
    // get all file info
    const rowfiles = await axiosWithSession.get<{}, AxiosResponse<getfileinfoJSONRow[]>>(
      `${appLocation}/api/user/files`,
      {
        onDownloadProgress: (progressEvent) => {
          dispatch(setProgress(progress(0, step, progressEvent.loaded / progressEvent.total)))
        }
      }
    )
    dispatch(setProgress(progress(1, step)))
    const files = await Promise.all(rowfiles.data.map(x => decryptoFileInfo(x)))
    dispatch(setProgress(progress(2, step)))

    // create filetable
    console.log(files)

    const result = buildFileTable(files)
    dispatch(deleteProgress())
    return result
  }
)

/**
 * activeFileGroupを変更(ディレクトリ)
 * */
export const changeActiveDir = createAction<{id: string}>('file/changeActiveFileGroup')

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(buildFileTableAsync.fulfilled, (state, action) => {
        // 生成したファイルツリーをstateに反映
        state.fileTable = action.payload.fileTable
        state.tagTree = action.payload.tagTree
        assertFileNodeFolder(action.payload.fileTable.root)
        state.activeFileGroup = { type: 'dir', files: action.payload.fileTable.root.files, parents: [] }
      })
      .addCase(fileuploadAsync.fulfilled, (state, action) => {
        // アップロードしたファイルをstateに反映
        const { uploaded, parents } = action.payload
        const parent:string =
          parents.length === 0
            ? 'root'
            : parents[parents.length - 1]
        // add table
        for (const { fileInfo, fileKeyBin, encryptedFileIVBin } of uploaded) {
          state.fileTable[fileInfo.id] = { ...fileInfo, history: [fileInfo.id], originalFileInfo: fileInfo, fileKeyBin, encryptedFileIVBin }
        }
        const parentNode = state.fileTable[parent]
        assertWritableDraftFileNodeFolder(parentNode)
        parentNode.files =
          [
            ...parentNode.files,
            ...uploaded.map(x => x.fileInfo.id)
          ]
        // add activeGroup
        state.activeFileGroup = { type: 'dir', files: parentNode.files, parents: action.payload.parents }
      })
      .addCase(createDiffAsync.fulfilled, (state, action) => {
        const { uploaded, targetId } = action.payload
        const { fileInfo, fileKeyBin } = uploaded
        assertFileInfoDiffFile(fileInfo)
        // fileTableを更新
        if (!fileInfo.prevId) throw new Error('前方が指定されていません')
        state.fileTable[fileInfo.prevId].nextId = fileInfo.id
        state.fileTable[fileInfo.id] = { ...fileInfo, parentId: fileInfo.parentId, originalFileInfo: fileInfo, fileKeyBin }
        // tagTreeを更新
        if (fileInfo.diff.addtag) {
          for (const tag of fileInfo.diff.addtag) {
            if (state.tagTree[tag]) {
              state.tagTree[tag].push(targetId)
            } else {
              state.tagTree[tag] = [targetId]
            }
          }
        }
        if (fileInfo.diff.deltag) {
          for (const tag of fileInfo.diff.deltag) {
            state.tagTree[tag] = state.tagTree[tag].filter(x => x !== targetId)
          }
        }
        // 差分反映
        const targetNode = state.fileTable[targetId]
        assertNonWritableDraftFileNodeDiff(targetNode)
        integrateDifference([fileInfo.id], state.fileTable, targetNode)
        // historyの追加
        targetNode.history.unshift(fileInfo.id)
      })
      .addCase(createFolderAsync.fulfilled, (state, action) => {
        const { uploaded, parents } = action.payload
        const { fileInfo, fileKeyBin } = uploaded
        // 作成したフォルダをstateに反映
        const parent:string =
          parents.length === 0
            ? 'root'
            : parents[parents.length - 1]
        // add table
        assertFileInfoFolder(fileInfo)
        state.fileTable[fileInfo.id] = { ...fileInfo, files: [], history: [fileInfo.id], originalFileInfo: fileInfo, fileKeyBin }
        const parentNode = state.fileTable[parent]
        assertWritableDraftFileNodeFolder(parentNode)
        parentNode.files.push(fileInfo.id)
        // add activeGroup
        state.activeFileGroup = { type: 'dir', files: parentNode.files, parents: action.payload.parents }
      })
      .addCase(filedownloadAsync.fulfilled, (state, action) => {
        // 生成したblobリンク等を反映
        state.activeFile = {
          link: action.payload.url,
          fileId: action.payload.fileId
        }
      })
      .addCase(changeActiveDir, (state, action) => {
        // 指定idのディレクトリをactiveディレクトリにする
        const parents: string[] = []
        const firstId = action.payload.id
        const activeDir:FileNode = state.fileTable[firstId]
        if (activeDir.type !== 'folder') throw new Error('指定オブジェクトはactiveDirになれません')
        let id: string | null = firstId
        while (id) {
          parents.unshift(id)
          const parentNode: FileNode = state.fileTable[id]
          assertFileNodeFolder(parentNode)
          id = parentNode.parentId
        }
        state.activeFileGroup = {
          type: 'dir',
          files: activeDir.files,
          parents
        }
      })
  }
})

export default fileSlice.reducer
