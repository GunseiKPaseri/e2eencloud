import { createAsyncThunk, createAction, createSlice } from '@reduxjs/toolkit'

import {
  FileInfoFile,
  FileInfoFolder,
  FileTable,
  tagGroup,
  dirGroup,
  FileNode,
  FolderObject,
  getfileinfoJSONRow
} from './file.type'

import { allProgress, decryptAESGCM, getAESGCMKey } from '../../util'
import { axiosWithSession, appLocation } from '../componentutils'
import { AxiosResponse } from 'axios'
import { db } from '../../indexeddb'
import { RootState } from '../../app/store'

import { setProgress, deleteProgress, progress } from '../progress/progressSlice'
import { WritableDraft } from 'immer/dist/internal'

import {
  decryptoFileInfo,
  FileInfo2IndexDBFiles,
  genUUID,
  getEncryptedFileRaw,
  getFileHash,
  getSafeName,
  IndexDBFiles2FileInfo,
  submitFileInfoWithEncryption,
  submitFileWithEncryption
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
    fileInfo: FileInfoFile,
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
    console.log(loadedfile)

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
    const addFolder = await submitFileInfoWithEncryption({
      id: genUUID(),
      name: changedFolderName,
      type: 'folder',
      parentId: parent,
      prevId: null
    })
    await db.files.put(FileInfo2IndexDBFiles(addFolder))

    return { uploaded: addFolder.fileInfo, parents: activeFileGroup.parents }
  }
)

/**
 * ファイルをダウンロードするThunk
 */
export const filedownloadAsync = createAsyncThunk<{url: string, fileInfo: FileInfoFile}, {fileId: string}, {state: RootState}>(
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
    const fileInfo = IndexDBFiles2FileInfo(file)
    dispatch(deleteProgress())
    return { url, fileInfo }
  }
)

/**
 * ファイル情報を解析してディレクトリツリーを構成するReduxThunk
 */
export const createFileTreeAsync = createAsyncThunk<{ fileTable: FileTable, tagTree: { [key: string]: string[] } }>(
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
    const fileTable: FileTable = { root: { type: 'folder', name: 'root', files: [], parent: null, diff: [] } }
    for (const x of files) {
      fileTable[x.fileInfo.id] = x.fileInfo.type === 'folder'
        ? { type: x.fileInfo.type, name: x.fileInfo.name, files: [], parent: x.fileInfo.parentId ?? 'root', diff: [] }
        : { type: x.fileInfo.type, name: x.fileInfo.name, diff: [] }
    }

    // add children
    for (const x of files) {
      (fileTable[x.fileInfo.parentId ?? 'root'] as FolderObject).files.push(x.fileInfo.id)
    }

    // create tagtree
    const tagTree: { [key: string]: string[] } = {}
    for (const x of files) {
      if (x.fileInfo.type !== 'file') continue
      for (const tag of x.fileInfo.tag) {
        if (tagTree[tag]) {
          tagTree[tag].push(x.fileInfo.id)
        } else {
          tagTree[tag] = [x.fileInfo.id]
        }
      }
    }
    console.log(files)

    dispatch(deleteProgress())
    return { fileTable, tagTree }
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
      .addCase(createFileTreeAsync.fulfilled, (state, action) => {
        // 生成したファイルツリーをstateに反映
        state.fileTable = action.payload.fileTable
        state.tagTree = action.payload.tagTree
        state.activeFileGroup = { type: 'dir', files: (action.payload.fileTable.root as FolderObject).files, parents: [] }
      })
      .addCase(fileuploadAsync.fulfilled, (state, action) => {
        // アップロードしたファイルをstateに反映
        const parent:string =
          action.payload.parents.length === 0
            ? 'root'
            : action.payload.parents[action.payload.parents.length - 1]
        // add table
        for (const t of action.payload.uploaded) {
          state.fileTable[t.id] = { type: 'file', name: t.name, diff: [] }
        }
        (state.fileTable[parent] as WritableDraft<FolderObject>).files =
          [
            ...(state.fileTable[parent] as WritableDraft<FolderObject>).files,
            ...action.payload.uploaded.map<string>(x => x.id)
          ]
        // add activeGroup
        state.activeFileGroup = { type: 'dir', files: (state.fileTable[parent] as WritableDraft<FolderObject>).files, parents: action.payload.parents }
      })
      .addCase(createFolderAsync.fulfilled, (state, action) => {
        // 作成したフォルダをstateに反映
        const parent:string =
          action.payload.parents.length === 0
            ? 'root'
            : action.payload.parents[action.payload.parents.length - 1]
        // add table
        state.fileTable[action.payload.uploaded.id] = { type: 'folder', name: action.payload.uploaded.name, files: [], parent: parent, diff: [] };
        (state.fileTable[parent] as WritableDraft<FolderObject>).files.push(action.payload.uploaded.id)
        // add activeGroup
        state.activeFileGroup = { type: 'dir', files: (state.fileTable[parent] as WritableDraft<FolderObject>).files, parents: action.payload.parents }
      })
      .addCase(filedownloadAsync.fulfilled, (state, action) => {
        // 生成したblobリンク等を反映
        state.activeFile = {
          link: action.payload.url,
          fileInfo: action.payload.fileInfo
        }
      })
      .addCase(changeActiveDir, (state, action) => {
        // 指定idのディレクトリをactiveディレクトリにする
        const parents: string[] = []
        const firstId = action.payload.id
        const activeDir = state.fileTable[firstId]
        if (activeDir.type === 'file') throw new Error('ファイルはactiveDirになれません')
        let id: string | null = firstId
        while (id) {
          parents.unshift(id)
          const parent: FileNode = state.fileTable[id]
          if (parent.type === 'file') throw new Error('ディレクトリ構造が壊れています')
          id = parent.parent
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
