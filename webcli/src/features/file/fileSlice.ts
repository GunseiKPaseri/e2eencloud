import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { decryptByRSA, encryptByRSA } from '../../encrypt'
import { getAESGCMKey, AESGCM, string2ByteArray, byteArray2base64, base642ByteArray, decryptAESGCM, byteArray2string } from '../../util'
import { v4 as uuidv4 } from 'uuid'
import { axiosWithSession, appLocation } from '../componentutils'
import FormData from 'form-data'
import { AxiosResponse } from 'axios'
import { db } from '../../indexeddb'
import { RootState } from '../../app/store'

type FileObject = {type: 'file', id: string, name: string}
type FolderObject = {type: 'folder', id: string, name: string, files: FileTree}

export type FileNode = FileObject | FolderObject
export type FileTree = FileNode[]
export interface FileState {
  loading: 0|1,
  files: FileTree,
  downloadlink: string,
  downloadname: string,
};

export interface FileInfo {
  id: string,
  name: string,
  sha256: string,
}

const initialState: FileState = {
  loading: 0,
  files: [],
  downloadlink: '',
  downloadname: ''
}

const getAddingNumberFileName = (name: string, idx: number) => {
  if (idx === 0) return name
  const t = name.lastIndexOf('.')
  return `${name.slice(0, t)} (${idx})${name.slice(t)}`
}

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
  console.log(existFiles, safeName)
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
  console.log(result)
  return result
}

const readfile = (x: File) => new Promise<ArrayBuffer>((resolve, reject) => {
  const fileReader = new FileReader()
  fileReader.readAsArrayBuffer(x)
  fileReader.onload = (e) => {
    if (typeof fileReader.result === 'string' || fileReader.result === null) return reject(new Error('bad file'))
    resolve(fileReader.result)
  }
})

const getFileHash = async (bin: ArrayBuffer) => {
  const hash = await crypto.subtle.digest('SHA-256', bin)
  return { hashStr: Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''), bin: bin }
}

const addFileWithEncryption = async (x: File, name: string) => {
  // gen unique name
  const uuid = uuidv4().replace(/-/g, '_')
  const fileKeyRaw = crypto.getRandomValues(new Uint8Array(32))
  // readfile,getHash | getKey
  const [{ bin, hashStr }, fileKey] = await Promise.all([readfile(x).then((bin) => getFileHash(bin)), getAESGCMKey(fileKeyRaw)])

  const fileinfo:FileInfo = {
    id: uuid,
    name: name,
    sha256: hashStr
  }

  // encrypt
  const [
    encryptedFile,
    encryptedFileInfo,
    encryptedFileKey
  ] = await Promise.all([
    AESGCM(bin, fileKey),
    AESGCM(string2ByteArray(JSON.stringify(fileinfo)), fileKey),
    encryptByRSA(fileKeyRaw)
  ])
  const encryptedFileBlob = new Blob([encryptedFile.encrypt], { type: 'application/octet-binary' })

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

  return fileinfo
}

export const fileuploadAsync = createAsyncThunk<FileInfo[], {files: File[]}, {state: RootState}>(
  'file/fileupload',
  async (fileinput, { getState }) => {
    const state = getState()
    const changedNameFile = getSafeName(fileinput.files.map(x => x.name), state.file.files)

    const loadedfile = await Promise.all(
      fileinput.files.map((x, i) => addFileWithEncryption(x, changedNameFile[i])))
    console.log(loadedfile)

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

const decryptoFileInfo = async (fileinforaw: getfileinfoJSON) => {
  const encryptedFileIV = base642ByteArray(fileinforaw.encryptedFileIVBase64)
  const encryptedFileKey = base642ByteArray(fileinforaw.encryptedFileKeyBase64)
  const encryptedFileInfo = base642ByteArray(fileinforaw.encryptedFileInfoBase64)
  const encryptedFileInfoIV = base642ByteArray(fileinforaw.encryptedFileInfoIVBase64)

  const fileKeyRaw = new Uint8Array(await decryptByRSA(encryptedFileKey))

  const fileKey = await getAESGCMKey(fileKeyRaw)
  const fileInfo:FileInfo = JSON.parse(byteArray2string(await decryptAESGCM(encryptedFileInfo, fileKey, encryptedFileInfoIV)))
  return { encryptedFileIV, fileKey, fileInfo, fileKeyRaw }
}

const getEncryptedFileRaw = async (fileId: string) => {
  const encryptedFileRowDL = await axiosWithSession.get<{}, AxiosResponse<ArrayBuffer>>(`${appLocation}/bin/${fileId}`, { responseType: 'arraybuffer' })
  return encryptedFileRowDL.data
}

export const filedownloadAsync = createAsyncThunk<{url: string, name: string}, {fileId: string}>(
  'file/filedownload',
  async (fileinput) => {
    const [file, encryptedFile] =
      await Promise.all([db.files.get(fileinput.fileId), getEncryptedFileRaw(fileinput.fileId)])

    if (!file) throw new Error(`${fileinput.fileId}は存在しません`)
    const { fileKeyRaw, sha256, encryptedFileIV } = file
    const fileKey = await getAESGCMKey(fileKeyRaw)

    const filebin = await decryptAESGCM(encryptedFile, fileKey, encryptedFileIV)

    const { hashStr } = await getFileHash(filebin)

    if (hashStr !== sha256) throw new Error('hashが異なります')

    const url = URL.createObjectURL(new Blob([filebin], { type: 'application/octet-binary' }))
    return {
      url,
      name: file.name
    }
  }
)

export const createFileTreeAsync = createAsyncThunk<FileTree>(
  'file/createfiletree',
  async () => {
    const rowfiles = await axiosWithSession.get<{}, AxiosResponse<getfileinfoJSON[]>>(`${appLocation}/api/user/files`)
    const files = await Promise.all(rowfiles.data.map(x => decryptoFileInfo(x)))
    await db.files.bulkPut(files.map(x => ({
      id: x.fileInfo.id,
      name: x.fileInfo.name,
      sha256: x.fileInfo.sha256,
      type: 'file',
      encryptedFileIV: x.encryptedFileIV,
      fileKeyRaw: x.fileKeyRaw
    })))
    console.log(files)
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
        state.downloadlink = action.payload.url
        state.downloadname = action.payload.name
      })
  }
})

export default fileSlice.reducer
