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
  assertFileInfoFolder,
  assertFileNodeFile,
  fileSort
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
export const fileuploadAsync = createAsyncThunk<{uploaded: FileCryptoInfoWithBin[], parentId: string}, {files: File[], parentId: string}, {state: RootState}>(
  'file/fileupload',
  async ({ files, parentId }, { getState, dispatch }) => {
    const state = getState()

    const fileTable = state.file.fileTable

    const parent = fileTable[parentId]
    if (!parent || parent.type !== 'folder') throw new Error('ここにアップロードできません')
    const changedNameFile = getSafeName(
      files.map(x => x.name),
      parent.files.flatMap(x => (fileTable[x].type === 'file' ? [fileTable[x].name] : []))
    )

    const loadedfile = await allProgress(
      files.map((x, i) => submitFileWithEncryption(x, changedNameFile[i], parentId)),
      (resolved, all) => {
        dispatch(setProgress({ progress: resolved / (all + 1), progressBuffer: all / (all + 1) }))
      })
    dispatch(deleteProgress())

    return { uploaded: loadedfile, parentId }
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
      .addCase(buildFileTableAsync.fulfilled, (state, action) => {
        // 生成したファイルツリーをstateに反映
        state.fileTable = action.payload.fileTable
        state.tagTree = action.payload.tagTree
        assertFileNodeFolder(action.payload.fileTable.root)
        state.activeFileGroup = { type: 'dir', folderId: 'root', files: action.payload.fileTable.root.files, parents: [] }
      })
      .addCase(fileuploadAsync.fulfilled, (state, action) => {
        // アップロードしたファイルをstateに反映
        const { uploaded, parentId } = action.payload
        // add table
        state.fileTable = {
          ...state.fileTable,
          ...Object.fromEntries(
            uploaded.map(({ fileInfo, fileKeyBin, encryptedFileIVBin }) => ([
              fileInfo.id,
              { ...fileInfo, history: [fileInfo.id], originalFileInfo: fileInfo, fileKeyBin, encryptedFileIVBin }
            ]))
          )
        }
        const parentNode = state.fileTable[parentId]
        assertWritableDraftFileNodeFolder(parentNode)
        parentNode.files =
          [
            ...parentNode.files,
            ...uploaded.map(x => x.fileInfo.id)
          ]
        // renew activeGroup
        if (state.activeFileGroup && state.activeFileGroup.type === 'dir' && state.activeFileGroup.files[state.activeFileGroup.files.length - 1]) {
          state.activeFileGroup = { ...state.activeFileGroup, files: fileSort([...state.activeFileGroup.files, ...uploaded.map(x => x.fileInfo.id)], state.fileTable) }
        }
      })
      .addCase(createDiffAsync.fulfilled, (state, action) => {
        const { uploaded, targetId } = action.payload
        const { fileInfo, fileKeyBin } = uploaded
        assertFileInfoDiffFile(fileInfo)
        // fileTableを更新
        if (!fileInfo.prevId) throw new Error('前方が指定されていません')
        state.fileTable[fileInfo.prevId].nextId = fileInfo.id
        state.fileTable[fileInfo.id] = { ...fileInfo, parentId: fileInfo.parentId, originalFileInfo: fileInfo, fileKeyBin }
        state.fileTable = { ...state.fileTable }
        // tagTreeを更新
        if (fileInfo.diff.addtag || fileInfo.diff.deltag) {
          for (const tag of fileInfo.diff.addtag ?? []) {
            if (state.tagTree[tag]) {
              state.tagTree[tag].push(targetId)
            } else {
              state.tagTree[tag] = [targetId]
            }
          }
          for (const tag of fileInfo.diff.deltag ?? []) {
            state.tagTree[tag] = state.tagTree[tag].filter(x => x !== targetId)
          }
          state.tagTree = { ...state.tagTree }
        }
        // 差分反映
        const targetNode = state.fileTable[targetId]
        assertNonWritableDraftFileNodeDiff(targetNode)
        integrateDifference([fileInfo.id], state.fileTable, targetNode)
        // historyの追加
        state.fileTable[targetId] = { ...targetNode, history: [fileInfo.id, ...targetNode.history] }
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
        const newFileTable:FileTable = {
          [fileInfo.id]: { ...fileInfo, files: [], history: [fileInfo.id], originalFileInfo: fileInfo, fileKeyBin },
          ...state.fileTable
        }
        // add parent
        const parentNode = state.fileTable[parent]
        assertWritableDraftFileNodeFolder(parentNode)
        const newFiles = [...parentNode.files, fileInfo.id]
        const sortedNewFiles = fileSort(newFiles, newFileTable)
        newFileTable[parent] = { ...parentNode, files: sortedNewFiles }
        // set fileTable
        state.fileTable = { ...newFileTable }
        // add activeGroup
        state.activeFileGroup = { type: 'dir', folderId: parent, files: sortedNewFiles, parents }
      })
      .addCase(filedownloadAsync.fulfilled, (state, action) => {
        // 生成したblobリンク等を反映
        const { url, fileId } = action.payload
        state.activeFile = {
          link: url,
          fileId: fileId
        }
        const target = state.fileTable[fileId]
        assertFileNodeFile(target)
        state.fileTable = { ...state.fileTable, [fileId]: { ...target, blobURL: url } }
      })
      .addCase(changeActiveDir, (state, action) => {
        // 指定idのディレクトリをactiveディレクトリにする
        const parents: string[] = []
        const firstId = action.payload.id
        const activeDir:FileNode = state.fileTable[firstId]
        if (activeDir.type !== 'folder') throw new Error('指定オブジェクトはactiveDirになれません')
        let id: string | null = firstId
        while (id) {
          parents.push(id)
          const parentNode: FileNode = state.fileTable[id]
          assertFileNodeFolder(parentNode)
          id = parentNode.parentId
        }
        state.activeFileGroup = {
          type: 'dir',
          folderId: firstId,
          files: activeDir.files,
          parents: parents.reverse()
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
  }
})

export default fileSlice.reducer
