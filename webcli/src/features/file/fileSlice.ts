import { createAsyncThunk, createAction, createSlice } from '@reduxjs/toolkit'

import {
  FileInfoFile,
  FileInfoFolder,
  FileTable,
  tagGroup,
  dirGroup,
  FileNode,
  getfileinfoJSONRow,
  FileInfoDiffFile
} from './file.type'

import { allProgress, decryptAESGCM, getAESGCMKey } from '../../util'
import { axiosWithSession, appLocation } from '../componentutils'
import { AxiosResponse } from 'axios'
import { db } from '../../indexeddb'
import { RootState } from '../../app/store'

import { setProgress, deleteProgress, progress } from '../progress/progressSlice'

import {
  assertFileNodeFolder,
  assertWritableDraftFileNodeFolder,
  assertNonWritableDraftFileNodeDiff,
  buildFileTable,
  decryptoFileInfo,
  FileInfo2IndexDBFiles,
  genUUID,
  getEncryptedFileRaw,
  getFileHash,
  getSafeName,
  integrateDifference,
  submitFileInfoWithEncryption,
  submitFileWithEncryption,
  createDiff
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
export const fileuploadAsync = createAsyncThunk<{uploaded: FileInfoFile[], parents: string[]}, {files: File[]}, {state: RootState}>(
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

    await db.files.bulkPut(loadedfile.map(x => FileInfo2IndexDBFiles(x)))
    dispatch(deleteProgress())

    return { uploaded: loadedfile.map(x => x.fileInfo), parents: activeFileGroup.parents }
  }
)

/**
 * フォルダを作成するReduxThunk
 */
export const createFolderAsync = createAsyncThunk<{uploaded: FileInfoFolder, parents: string[]}, {name: string}, {state: RootState}>(
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
      type: 'folder',
      parentId: parent
    }
    const addFolder = await submitFileInfoWithEncryption(fileInfo)
    await db.files.put(FileInfo2IndexDBFiles(addFolder))

    return { uploaded: fileInfo, parents: activeFileGroup.parents }
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
    const file = await db.files.get(fileId)
    if (!file || file.type !== 'file') throw new Error('DB上に鍵情報が存在しません')

    if (!url) {
      const { fileKeyRaw, sha256, encryptedFileIV, mime } = file
      dispatch(setProgress(progress(1, step)))
      const fileKey = await getAESGCMKey(fileKeyRaw)
      dispatch(setProgress(progress(2, step)))

      const encryptedFile = await getEncryptedFileRaw(fileId)
      const filebin = await decryptAESGCM(encryptedFile, fileKey, encryptedFileIV)
      dispatch(setProgress(progress(3, step)))
      const { hashStr } = await getFileHash(filebin)

      if (hashStr !== sha256) throw new Error('hashが異なります')
      url = URL.createObjectURL(new Blob([filebin], { type: mime }))
    }
    dispatch(deleteProgress())
    return { url, fileId }
  }
)

/**
 *  ファイル名を変更するReduxThunk
 */
export const createDiffAsync = createAsyncThunk<{uploaded: FileInfoDiffFile, targetId: string}, Parameters<typeof createDiff>[0], {state: RootState}>(
  'file/rename',
  async (params, { getState, dispatch }) => {
    const step = 2
    dispatch(setProgress(progress(0, step)))

    const state = getState()
    const fileTable = state.file.fileTable

    const uploaded = createDiff(params, fileTable)

    const addObject = await submitFileInfoWithEncryption(uploaded)
    dispatch(setProgress(progress(1, step)))
    await db.files.put(FileInfo2IndexDBFiles(addObject))
    dispatch(deleteProgress())
    return { uploaded, targetId: params.targetId }
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
    await db.files.bulkPut(files.map(x => FileInfo2IndexDBFiles(x)))

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
        for (const fileInfo of uploaded) {
          state.fileTable[fileInfo.id] = { ...fileInfo, history: [fileInfo.id], originalFileInfo: fileInfo }
        }
        const parentNode = state.fileTable[parent]
        assertWritableDraftFileNodeFolder(parentNode)
        parentNode.files =
          [
            ...parentNode.files,
            ...uploaded.map(x => x.id)
          ]
        // add activeGroup
        state.activeFileGroup = { type: 'dir', files: parentNode.files, parents: action.payload.parents }
      })
      .addCase(createDiffAsync.fulfilled, (state, action) => {
        const { uploaded, targetId } = action.payload
        // add table
        if (!uploaded.prevId) throw new Error('前方が指定されていません')
        state.fileTable[uploaded.prevId].nextId = uploaded.id
        state.fileTable[uploaded.id] = { ...uploaded, parentId: uploaded.parentId, originalFileInfo: uploaded }
        // 差分反映
        const targetNode = state.fileTable[targetId]
        assertNonWritableDraftFileNodeDiff(targetNode)
        integrateDifference([uploaded.id], state.fileTable, targetNode)
        // historyの追加
        targetNode.history.unshift(uploaded.id)
      })
      .addCase(createFolderAsync.fulfilled, (state, action) => {
        const { uploaded, parents } = action.payload
        // 作成したフォルダをstateに反映
        const parent:string =
          parents.length === 0
            ? 'root'
            : parents[parents.length - 1]
        // add table
        state.fileTable[uploaded.id] = { ...uploaded, files: [], history: [uploaded.id], originalFileInfo: uploaded }
        const parentNode = state.fileTable[parent]
        assertWritableDraftFileNodeFolder(parentNode)
        parentNode.files.push(action.payload.uploaded.id)
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
