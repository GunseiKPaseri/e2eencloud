import { createAsyncThunk, createAction, createSlice } from '@reduxjs/toolkit'

import {
  FileInfoFile,
  FileInfoFolder,
  FileTable,
  tagGroup,
  dirGroup,
  FileNode,
  FileNodeFolder,
  getfileinfoJSONRow,
  FileNodeFile,
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
  assertNonFileNodeDiff,
  assertWritableDraftFileNodeFolder,
  assertNonWritableDraftFileNodeDiff,
  buildFileTable,
  decryptoFileInfo,
  FileInfo2IndexDBFiles,
  genUUID,
  getEncryptedFileRaw,
  getFileHash,
  getSafeName,
  IndexDBFiles2FileInfo,
  integrateDifference,
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
      parentId: parent
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
 *  ファイル名を変更するReduxThunk
 */
export const renameAsync = createAsyncThunk<{uploaded: FileInfoDiffFile, targetId: string}, {id: string, name: string}, {state: RootState}>(
  'file/rename',
  async ({ id, name }, { getState, dispatch }) => {
    const step = 2
    dispatch(setProgress(progress(0, step)))

    const state = getState()
    const fileTable = state.file.fileTable
    const targetNode = fileTable[id]
    if (!(targetNode.type === 'file' || targetNode.type === 'folder')) throw new Error('適用要素が実体を持っていません')

    if (!targetNode) throw new Error('存在しないファイルです')
    if (id === 'root' || targetNode.parent === null) throw new Error('rootの名称は変更できません')
    if (name === '') throw new Error('空文字は許容されません')
    const parentNode = fileTable[targetNode.parent]
    assertFileNodeFolder(parentNode)
    const [changedName] = getSafeName([name],
      parentNode.files.flatMap(x => (fileTable[x].type === targetNode.type ? [fileTable[x].name] : []))
    )
    if (targetNode.history.length === 0) throw new Error('過去のファイルは変更できません')
    const prevId = targetNode.history[targetNode.history.length - 1]

    const uploaded: FileInfoDiffFile = {
      id: genUUID(),
      name: changedName,
      type: 'diff',
      parentId: targetNode.parent === 'root' ? null : targetNode.parent,
      prevId,
      diff: {}
    }
    const addObject = await submitFileInfoWithEncryption(uploaded)
    dispatch(setProgress(progress(1, step)))
    await db.files.put(FileInfo2IndexDBFiles(addObject))
    dispatch(deleteProgress())
    return { uploaded, targetId: id }
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
        const parent:string =
          action.payload.parents.length === 0
            ? 'root'
            : action.payload.parents[action.payload.parents.length - 1]
        // add table
        for (const t of action.payload.uploaded) {
          state.fileTable[t.id] = { type: 'file', name: t.name, history: [], parent, tag: [] }
        }
        const parentNode = state.fileTable[parent]
        assertWritableDraftFileNodeFolder(parentNode)
        parentNode.files =
          [
            ...parentNode.files,
            ...action.payload.uploaded.map<string>(x => x.id)
          ]
        // add activeGroup
        state.activeFileGroup = { type: 'dir', files: parentNode.files, parents: action.payload.parents }
      })
      .addCase(renameAsync.fulfilled, (state, action) => {
        const { uploaded, targetId } = action.payload
        // add table
        if (!uploaded.prevId) throw new Error('前方が指定されていません')
        state.fileTable[uploaded.prevId].nextId = uploaded.id
        state.fileTable[uploaded.id] = { type: 'diff', name: uploaded.name, parent: uploaded.parentId, diff: uploaded.diff, prevId: uploaded.prevId }
        // 差分反映
        const targetNode = state.fileTable[targetId]
        assertNonWritableDraftFileNodeDiff(targetNode)
        integrateDifference([uploaded.id], state.fileTable, targetNode)
      })
      .addCase(createFolderAsync.fulfilled, (state, action) => {
        // 作成したフォルダをstateに反映
        const parent:string =
          action.payload.parents.length === 0
            ? 'root'
            : action.payload.parents[action.payload.parents.length - 1]
        // add table
        state.fileTable[action.payload.uploaded.id] = { type: 'folder', name: action.payload.uploaded.name, files: [], parent: parent, history: [] }
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
          fileInfo: action.payload.fileInfo
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
          id = parentNode.parent
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
