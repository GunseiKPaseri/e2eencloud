import { createAsyncThunk, createAction, createSlice } from '@reduxjs/toolkit'
import { decryptByRSA, encryptByRSA } from '../../encrypt'
import { getAESGCMKey, AESGCM, string2ByteArray, byteArray2base64, base642ByteArray, decryptAESGCM, byteArray2string } from '../../util'
import { v4 } from 'uuid'
import { axiosWithSession, appLocation } from '../componentutils'
import FormData from 'form-data'
import { AxiosResponse } from 'axios'
import { db, IndexDBFiles } from '../../indexeddb'
import { RootState } from '../../app/store'

import { setProgress, deleteProgress, progress } from '../progress/progressSlice'
import { WritableDraft } from 'immer/dist/internal'

/**
 * 生成
 */
const genUUID = () => v4().replace(/-/g, '_')

/**
 * ディレクトリツリー要素
 */
type FileObject = {type: 'file', name: string, diff: string[]}
/**
 * ディレクトリツリー要素
 */
 type FolderObject = {type: 'folder', name: string, files: string[], parent: string | null, diff: string[]}

/**
 * ディレクトリツリー要素
 */
export type FileNode = FileObject | FolderObject

/**
 * ディレクトリテーブル
 */
export type FileTable = { [key: string]: FileNode }

/**
 *  サーバDBに保存するファイル情報
 */
interface FileInfoFile {
  type: 'file',
  id: string,
  name: string,
  sha256: string,
  mime: string,
  size: number,
  parentId: string | null,
  prevId: string | null,
  tag: string[]
}
interface FileInfoFolder {
  type: 'folder',
  id: string,
  name: string,
  parentId: string | null,
  prevId: string | null,
}

export type FileInfo = FileInfoFile | FileInfoFolder

/**
 * IndexDB情報からサーバDB保存用データを抽出
 */
const IndexDBFiles2FileInfo = (file: IndexDBFiles):FileInfo => (
  file.type === 'folder'
    ? {
        id: file.id,
        name: file.name,
        type: file.type,
        parentId: file.parentId,
        prevId: file.prevId
      }
    : {
        id: file.id,
        name: file.name,
        sha256: file.sha256,
        type: file.type,
        mime: file.mime,
        size: file.size,
        parentId: file.parentId,
        prevId: file.prevId,
        tag: file.tag
      })
/**
 * サーバDB保存データからIndexDB情報を生成
 */
const FileInfo2IndexDBFiles = (
  props: {fileInfo: FileInfoFile, encryptedFileIV: Uint8Array, fileKeyRaw: Uint8Array} |
  {fileInfo: FileInfoFolder, fileKeyRaw: Uint8Array}
):IndexDBFiles => ('encryptedFileIV' in props
  ? {
      id: props.fileInfo.id,
      name: props.fileInfo.name,
      sha256: props.fileInfo.sha256,
      mime: props.fileInfo.mime,
      size: props.fileInfo.size,
      parentId: props.fileInfo.parentId,
      prevId: props.fileInfo.prevId,
      tag: props.fileInfo.tag,
      type: props.fileInfo.type,
      encryptedFileIV: props.encryptedFileIV,
      fileKeyRaw: props.fileKeyRaw
    }
  : {
      id: props.fileInfo.id,
      name: props.fileInfo.name,
      type: props.fileInfo.type,
      parentId: props.fileInfo.parentId,
      prevId: props.fileInfo.prevId,
      fileKeyRaw: props.fileKeyRaw
    }
)

/**
 * サーバDBから取得した情報
 */
export interface FileInfoFileWithCrypto {
  encryptedFileIV: Uint8Array,
  fileKey: CryptoKey,
  fileInfo: FileInfoFile,
  fileKeyRaw: Uint8Array
}

export interface FileInfoFolderWithCrypto {
  fileKey: CryptoKey,
  fileInfo: FileInfoFolder,
  fileKeyRaw: Uint8Array
}

type FileInfoWithCrypto = FileInfoFileWithCrypto | FileInfoFolderWithCrypto

type tagGroup = {type: 'tag', files: string[], tagName: string}
type dirGroup = {type: 'dir', files: string[], parents: string[]}

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
 * ファイル名に指定番号を追加したものを取得(Like Windows)
 */
const getAddingNumberFileName = (name: string, idx: number) => {
  if (idx === 0) return name
  const t = name.lastIndexOf('.')
  return `${name.slice(0, t)} (${idx})${name.slice(t)}`
}

/**
 * 指定階層に保存して問題のないファイル名を取得
 */
const getSafeName = (hopedName: string[], samelevelfiles: string[]) => {
  const safeName = hopedName.map(x =>
    x
      .replaceAll('\\', '＼')
      .replaceAll('/', '／')
      .replaceAll(':', '：')
      .replaceAll('*', '＊')
      .replaceAll('?', '？')
      .replaceAll('<', '＜')
      .replaceAll('>', '＞')
      .replaceAll('|', '｜')
  )
  const existFiles = new Set(samelevelfiles)
  const result:string[] = []
  for (const name of safeName) {
    for (let i = 0; true; i++) {
      const suggestName = getAddingNumberFileName(name, i)
      if (!existFiles.has(suggestName)) {
        result.push(suggestName)
        existFiles.add(suggestName)
        break
      }
    }
  }
  return result
}

/**
 * FileオブジェクトをArrayBufferに変換
 */
const readfile = (x: File) => new Promise<ArrayBuffer>((resolve, reject) => {
  const fileReader = new FileReader()
  fileReader.readAsArrayBuffer(x)
  fileReader.onload = (e) => {
    if (typeof fileReader.result === 'string' || fileReader.result === null) return reject(new Error('bad file'))
    resolve(fileReader.result)
  }
})

/**
 * ファイルのハッシュ値を生成
 */
const getFileHash = async (bin: ArrayBuffer) => {
  const hash = await crypto.subtle.digest('SHA-256', bin)
  return { hashStr: Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''), bin: bin }
}

/**
 * ファイル情報のみをサーバに保存
 */
const submitFileInfoWithEncryption = async (fileInfo: FileInfoFolder): Promise<FileInfoFolderWithCrypto> => {
  // genkey
  const fileKeyRaw = crypto.getRandomValues(new Uint8Array(32))
  // readfile,getHash | getKey
  const fileKey = await getAESGCMKey(fileKeyRaw)
  // encrypt
  const [
    encryptedFileInfo,
    encryptedFileKey
  ] = await Promise.all([
    AESGCM(string2ByteArray(JSON.stringify(fileInfo)), fileKey),
    encryptByRSA(fileKeyRaw)
  ])

  console.log(fileKey)

  const encryptedFileInfoBase64 = byteArray2base64(new Uint8Array(encryptedFileInfo.encrypt))
  const encryptedFileInfoIVBase64 = byteArray2base64(encryptedFileInfo.iv)

  const encryptedFileKeyBase64 = byteArray2base64(new Uint8Array(encryptedFileKey))

  // send encryptedfile, send encryptedfileinfo, encryptedfilekey iv,iv
  const fileSendData = new FormData()
  fileSendData.append('id', fileInfo.id)
  fileSendData.append('encryptedFileInfoBase64', encryptedFileInfoBase64)
  fileSendData.append('encryptedFileInfoIVBase64', encryptedFileInfoIVBase64)
  fileSendData.append('encryptedFileKeyBase64', encryptedFileKeyBase64)
  await axiosWithSession.post(`${appLocation}/api/files`, fileSendData)

  // memory file to indexedDB

  return { fileKey, fileInfo, fileKeyRaw }
}
/**
 * ファイルをenryptoしてサーバに保存
 */
const submitFileWithEncryption = async (x: File, name: string, parentId: string | null): Promise<FileInfoFileWithCrypto> => {
  // gen unique name
  const uuid = genUUID()

  const fileKeyRaw = crypto.getRandomValues(new Uint8Array(32))
  // readfile,getHash | getKey
  const [{ bin, hashStr }, fileKey] = await Promise.all([readfile(x).then((bin) => getFileHash(bin)), getAESGCMKey(fileKeyRaw)])

  const fileInfo:FileInfoFile = {
    id: uuid,
    name: name,
    sha256: hashStr,
    mime: x.type,
    type: 'file',
    size: bin.byteLength,
    parentId,
    prevId: null,
    tag: []
  }

  // encrypt
  const [
    encryptedFile,
    encryptedFileInfo,
    encryptedFileKey
  ] = await Promise.all([
    AESGCM(bin, fileKey),
    AESGCM(string2ByteArray(JSON.stringify(fileInfo)), fileKey),
    encryptByRSA(fileKeyRaw)
  ])
  const encryptedFileBlob = new Blob([encryptedFile.encrypt], { type: 'application/octet-binary' })

  const encryptedFileIV = encryptedFile.iv
  const encryptedFileIVBase64 = byteArray2base64(encryptedFile.iv)
  console.log(encryptedFile, encryptedFile.iv, fileKey)

  const encryptedFileInfoBase64 = byteArray2base64(new Uint8Array(encryptedFileInfo.encrypt))
  const encryptedFileInfoIVBase64 = byteArray2base64(encryptedFileInfo.iv)

  const encryptedFileKeyBase64 = byteArray2base64(new Uint8Array(encryptedFileKey))

  // send encryptedfile, send encryptedfileinfo, encryptedfilekey iv,iv
  const fileSendData = new FormData()
  fileSendData.append('id', uuid)
  fileSendData.append('encryptedFile', encryptedFileBlob)
  fileSendData.append('encryptedFileIVBase64', encryptedFileIVBase64)
  fileSendData.append('encryptedFileInfoBase64', encryptedFileInfoBase64)
  fileSendData.append('encryptedFileInfoIVBase64', encryptedFileInfoIVBase64)
  fileSendData.append('encryptedFileKeyBase64', encryptedFileKeyBase64)
  await axiosWithSession.post(`${appLocation}/api/files`, fileSendData)

  // memory file to indexedDB

  return { encryptedFileIV, fileKey, fileInfo, fileKeyRaw }
}

/**
 * ファイルをアップロードするReduxThunk
 */
export const fileuploadAsync = createAsyncThunk<{uploaded: FileInfoFile[], parents: string[]}, {files: File[]}, {state: RootState}>(
  'file/fileupload',
  async (fileinput, { getState }) => {
    const state = getState()
    const activeFileGroup = state.file.activeFileGroup
    if (activeFileGroup?.type !== 'dir') throw new Error('ここにアップロードできません')
    const changedNameFile = getSafeName(
      fileinput.files.map(x => x.name),
      activeFileGroup.files.flatMap(x => (state.file.fileTable[x].type === 'file' ? [state.file.fileTable[x].name] : []))
    )

    const parent = activeFileGroup.parents.length === 0 ? null : activeFileGroup.parents[activeFileGroup.parents.length - 1]
    const loadedfile = await Promise.all(
      fileinput.files.map((x, i) => submitFileWithEncryption(x, changedNameFile[i], parent)))
    console.log(loadedfile)

    await db.files.bulkPut(loadedfile.map(x => FileInfo2IndexDBFiles(x)))

    return { uploaded: loadedfile.map(x => x.fileInfo), parents: activeFileGroup.parents }
  }
)

/**
 * フォルダを作成するReduxThunk
 */
export const createFolderAsync = createAsyncThunk<{uploaded: FileInfoFolder, parents: string[]}, {name: string}, {state: RootState}>(
  'file/createFolder',
  async ({ name }, { getState }) => {
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

interface getfileinfoJSONRow {
  id: string,
  encryptedFileIVBase64?: string,
  encryptedFileKeyBase64: string,
  encryptedFileInfoBase64: string,
  encryptedFileInfoIVBase64: string,
  encryptedSize: string;
}

/**
 * 取得したファイル情報を複合
 */
const decryptoFileInfo = async (fileinforaw: getfileinfoJSONRow): Promise<FileInfoWithCrypto> => {
  const encryptedFileKey = base642ByteArray(fileinforaw.encryptedFileKeyBase64)
  const encryptedFileInfo = base642ByteArray(fileinforaw.encryptedFileInfoBase64)
  const encryptedFileInfoIV = base642ByteArray(fileinforaw.encryptedFileInfoIVBase64)

  const fileKeyRaw = new Uint8Array(await decryptByRSA(encryptedFileKey))

  const fileKey = await getAESGCMKey(fileKeyRaw)
  const fileInfo:FileInfo = JSON.parse(byteArray2string(await decryptAESGCM(encryptedFileInfo, fileKey, encryptedFileInfoIV)))
  if (fileInfo.type === 'file') {
    if (!fileinforaw.encryptedFileIVBase64) throw new Error('取得情報が矛盾しています。fileにも関わらずencryptedFileIVが含まれていません')
    const encryptedFileIV = base642ByteArray(fileinforaw.encryptedFileIVBase64)
    return { encryptedFileIV, fileKey, fileInfo, fileKeyRaw }
  }
  return { fileKey, fileInfo, fileKeyRaw }
}

/**
 * 対象ファイルの生データを取得
 */
const getEncryptedFileRaw = async (fileId: string) => {
  const encryptedFileRowDL = await axiosWithSession.get<{}, AxiosResponse<ArrayBuffer>>(`${appLocation}/bin/${fileId}`, { responseType: 'arraybuffer' })
  return encryptedFileRowDL.data
}

/**
 * ファイルをダウンロードするThunk
 */
export const filedownloadAsync = createAsyncThunk<{url: string, fileInfo: FileInfoFile}, {fileId: string}>(
  'file/filedownload',
  async (fileinput, { dispatch }) => {
    const step = 4
    dispatch(setProgress(progress(0, step)))
    const [file, encryptedFile] =
      await Promise.all([db.files.get(fileinput.fileId), getEncryptedFileRaw(fileinput.fileId)])

    if (!file) throw new Error(`${fileinput.fileId}は存在しません`)
    if (file.type === 'folder') throw new Error('フォルダはダウンロードできません')
    const { fileKeyRaw, sha256, encryptedFileIV, mime } = file
    dispatch(setProgress(progress(1, step)))
    const fileKey = await getAESGCMKey(fileKeyRaw)
    dispatch(setProgress(progress(2, step)))

    const filebin = await decryptAESGCM(encryptedFile, fileKey, encryptedFileIV)
    dispatch(setProgress(progress(3, step)))
    const { hashStr } = await getFileHash(filebin)

    if (hashStr !== sha256) throw new Error('hashが異なります')

    const url = URL.createObjectURL(new Blob([filebin], { type: mime }))
    dispatch(deleteProgress())
    const fileInfo: FileInfo = IndexDBFiles2FileInfo(file)
    if (fileInfo.type === 'folder') throw new Error('フォルダはダウンロードできません')
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
