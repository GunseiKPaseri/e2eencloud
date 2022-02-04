import { createAsyncThunk, createAction, createSlice } from '@reduxjs/toolkit'

import {
  FileInfoFile,
  FileInfoFolder,
  FileTable,
  tagGroup,
  dirGroup,
  FileNode,
  FolderObject,
  getfileinfoJSONRow,
  FileObject
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
    const nextTable: {[key: string]: string | undefined} = {}
    for (const x of files) {
      const { id, prevId, type, name, parentId } = x.fileInfo
      fileTable[id] = type === 'folder'
        ? { type, name, files: [], parent: parentId ?? 'root', diff: [], prevId }
        : { type, name, diff: [], prevId }
      if (prevId) nextTable[prevId] = x.fileInfo.id
    }

    // create diff tree
    const descendantsTable:{[key: string]: {prevId?: string, nextId?: string, diffList?: string[]} | undefined} = {}
    const fileNodes = files
      .filter(x => x.fileInfo.type === 'folder' || x.fileInfo.type === 'file')
      .map(x => x.fileInfo.id)
    // 次のfileNodesまで子孫を探索・nextの更新
    fileNodes
      .forEach((x) => {
        // old -> new
        const diffList: string[] = [x]
        let prevWatchId: string = x
        let nowWatchId: string | undefined = nextTable[x]
        let nowWatchObject: FileNode | undefined
        while (nowWatchId) {
          fileTable[prevWatchId].nextId = nowWatchId
          diffList.push(nowWatchId)
          nowWatchObject = fileTable[nowWatchId]
          if (nowWatchObject.type === 'file' || nowWatchObject.type === 'folder') break
          const nextWatchId: string | undefined = nextTable[nowWatchId]
          prevWatchId = nowWatchId
          nowWatchId = nextWatchId
        }
        if (nowWatchId && nowWatchObject && (nowWatchObject.type === 'file' || nowWatchObject.type === 'folder')) {
          // 次のfileNodesがある
          descendantsTable[nowWatchId] = { ...descendantsTable[nowWatchId], prevId: x }
          descendantsTable[x] = { ...descendantsTable[x], diffList, nextId: nowWatchId }
        } else {
          // 末端
          descendantsTable[x] = { ...descendantsTable[x], diffList }
        }
      })
    // 末端に最も近いfileNodesがdirTreeItemsになる
    const dirTreeItems = new Set<string>(fileNodes.filter(x => {
      const y = descendantsTable[x]
      return y && !y.nextId
    }))

    // 各dirTreeItemsについてdiffTreeを作成
    dirTreeItems.forEach((x) => {
      const childTree = descendantsTable[x]?.diffList
      if (!childTree) return
      let nowWatchId: string | undefined = x
      // new -> old
      const ancestors: string[][] = []
      while (nowWatchId) {
        ancestors.push(descendantsTable[nowWatchId]?.diffList ?? [])
        nowWatchId = descendantsTable[nowWatchId]?.prevId
      }
      (fileTable[x] as FileObject | FolderObject).diff = ancestors.reverse().flat().reverse()
      // 子供の差分を反映
      for (const c of childTree) {
        const { name, parent } = fileTable[c]
        if (name) (fileTable[x] as FileObject | FolderObject).name = name
        if (parent)(fileTable[x] as FileObject | FolderObject).parent = parent
      }
    })

    // create dir tree
    dirTreeItems.forEach((x) => {
      (fileTable[(fileTable[x] as FileObject | FolderObject).parent ?? 'root'] as FolderObject).files.push(x)
    })
    // sort directory name
    dirTreeItems.add('root')
    dirTreeItems.forEach((x) => {
      const t = fileTable[x]
      if (t.type === 'folder') {
        t.files = t.files.sort((a, b) => {
          const ta = fileTable[a]
          const tb = fileTable[b]
          if (ta.type === 'folder' && tb.type === 'file') return 1
          if (ta.type === 'file' && tb.type === 'folder') return -1
          return fileTable[a].name.localeCompare(fileTable[b].name, 'ja')
        })
      }
    })

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
