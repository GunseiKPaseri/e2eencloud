import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { decryptByRSA, encryptByRSA } from '../../encrypt'
import { getAESGCMKey, AESGCM, string2ByteArray, byteArray2base64, base642ByteArray, decryptAESGCM, byteArray2string } from '../../util'
import { v4 as uuidv4 } from 'uuid'
import { axiosWithSession, appLocation } from '../componentutils'
import FormData from 'form-data'
import { AxiosResponse } from 'axios'
import { db, IndexDBFiles } from '../../indexeddb'
import { RootState } from '../../app/store'

import { setProgress, deleteProgress, progress } from '../progress/progressSlice'

/**
 * ディレクトリツリー要素
 */
type FileObject = {type: 'file', id: string, name: string}
/**
 * ディレクトリツリー要素
 */
 type FolderObject = {type: 'folder', id: string, name: string, files: FileTree}

/**
 * ディレクトリツリー要素
 */
export type FileNode = FileObject | FolderObject

/**
 * ディレクトリツリー
 */
export type FileTree = FileNode[]

/**
 *  サーバDBに保存するファイル情報
 */
export interface FileInfo {
  id: string,
  name: string,
  sha256: string,
  mime: string,
}

/**
 * IndexDB情報からサーバDB保存用データを抽出
 */
const IndexDBFiles2FileInfo = (file: IndexDBFiles):FileInfo =>
  ({ id: file.id, name: file.name, sha256: file.sha256, mime: file.mime })

/**
 * サーバDBから取得した情報
 */
export interface FileInfoWithCrypto {
  encryptedFileIV: Uint8Array,
  fileKey: CryptoKey,
  fileInfo: FileInfo,
  fileKeyRaw: Uint8Array
}

/**
 * ファイル関連のReduxState
 */
export interface FileState {
  loading: 0|1,
  files: FileTree,
  activeFile: {
    link: string,
    fileInfo: FileInfo,
  } | null
  active: string
};

const initialState: FileState = {
  loading: 0,
  files: [],
  activeFile: null,
  active: ''
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
const getSafeName = (hopedName: string[], tree: FileTree) => {
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
  const existFiles = new Set(tree.flatMap(x => x.type === 'file' ? x.name : []))
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
 * ファイルをenryptoしてサーバに保存
 */
const addFileWithEncryption = async (x: File, name: string): Promise<FileInfoWithCrypto> => {
  // gen unique name
  const uuid = uuidv4().replace(/-/g, '_')
  const fileKeyRaw = crypto.getRandomValues(new Uint8Array(32))
  // readfile,getHash | getKey
  const [{ bin, hashStr }, fileKey] = await Promise.all([readfile(x).then((bin) => getFileHash(bin)), getAESGCMKey(fileKeyRaw)])

  const fileInfo:FileInfo = {
    id: uuid,
    name: name,
    sha256: hashStr,
    mime: x.type
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
export const fileuploadAsync = createAsyncThunk<FileInfo[], {files: File[]}, {state: RootState}>(
  'file/fileupload',
  async (fileinput, { getState }) => {
    const state = getState()
    const changedNameFile = getSafeName(fileinput.files.map(x => x.name), state.file.files)

    const loadedfile = await Promise.all(
      fileinput.files.map((x, i) => addFileWithEncryption(x, changedNameFile[i])))
    console.log(loadedfile)
    await db.files.bulkPut(loadedfile.map(x => ({
      id: x.fileInfo.id,
      name: x.fileInfo.name,
      sha256: x.fileInfo.sha256,
      type: 'file',
      encryptedFileIV: x.encryptedFileIV,
      fileKeyRaw: x.fileKeyRaw,
      mime: x.fileInfo.mime
    })))

    return loadedfile
  }
)

interface getfileinfoJSON {
  id: string,
  encryptedFileIVBase64: string,
  encryptedFileKeyBase64: string,
  encryptedFileInfoBase64: string,
  encryptedFileInfoIVBase64: string,
  size: string;
}

/**
 * 取得したファイル情報を複合
 */
const decryptoFileInfo = async (fileinforaw: getfileinfoJSON): Promise<FileInfoWithCrypto> => {
  const encryptedFileIV = base642ByteArray(fileinforaw.encryptedFileIVBase64)
  const encryptedFileKey = base642ByteArray(fileinforaw.encryptedFileKeyBase64)
  const encryptedFileInfo = base642ByteArray(fileinforaw.encryptedFileInfoBase64)
  const encryptedFileInfoIV = base642ByteArray(fileinforaw.encryptedFileInfoIVBase64)

  const fileKeyRaw = new Uint8Array(await decryptByRSA(encryptedFileKey))

  const fileKey = await getAESGCMKey(fileKeyRaw)
  const fileInfo:FileInfo = JSON.parse(byteArray2string(await decryptAESGCM(encryptedFileInfo, fileKey, encryptedFileInfoIV)))
  return { encryptedFileIV, fileKey, fileInfo, fileKeyRaw }
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
export const filedownloadAsync = createAsyncThunk<{url: string, fileInfo: FileInfo}, {fileId: string}>(
  'file/filedownload',
  async (fileinput, { dispatch }) => {
    const step = 4
    dispatch(setProgress(progress(0, step)))
    const [file, encryptedFile] =
      await Promise.all([db.files.get(fileinput.fileId), getEncryptedFileRaw(fileinput.fileId)])

    if (!file) throw new Error(`${fileinput.fileId}は存在しません`)
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
    return {
      url,
      fileInfo: IndexDBFiles2FileInfo(file)
    }
  }
)

/**
 * ファイル情報を解析してディレクトリツリーを構成するReduxThunk
 */
export const createFileTreeAsync = createAsyncThunk<FileTree>(
  'file/createfiletree',
  async (_, { dispatch }) => {
    const step = 3
    dispatch(setProgress(progress(0, step)))
    const rowfiles = await axiosWithSession.get<{}, AxiosResponse<getfileinfoJSON[]>>(
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
    await db.files.bulkPut(files.map(x => ({
      id: x.fileInfo.id,
      name: x.fileInfo.name,
      sha256: x.fileInfo.sha256,
      type: 'file',
      encryptedFileIV: x.encryptedFileIV,
      fileKeyRaw: x.fileKeyRaw,
      mime: x.fileInfo.mime
    })))
    console.log(files)
    dispatch(deleteProgress())
    return files.map(x => ({ type: 'file', id: x.fileInfo.id, name: x.fileInfo.name }))
  }
)

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createFileTreeAsync.fulfilled, (state, action) => {
        state.files = action.payload
      })
      .addCase(fileuploadAsync.fulfilled, (state, action) => {
        state.files = [
          ...state.files,
          ...action.payload.map<FileObject>(x => ({ type: 'file', id: x.id, name: x.name }))
        ]
      })
      .addCase(filedownloadAsync.fulfilled, (state, action) => {
        state.activeFile = {
          link: action.payload.url,
          fileInfo: action.payload.fileInfo
        }
      })
  }
})

export default fileSlice.reducer
