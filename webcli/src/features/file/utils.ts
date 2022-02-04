import {
  FileInfoFile,
  FileInfoFolder,
  FileInfoFolderWithCrypto,
  FileInfoFileWithCrypto,
  FileInfoWithCrypto,
  FileInfo,
  getfileinfoJSONRow
} from './file.type'

import { decryptByRSA, encryptByRSA } from '../../encrypt'
import { getAESGCMKey, AESGCM, string2ByteArray, byteArray2base64, base642ByteArray, decryptAESGCM, byteArray2string } from '../../util'
import { axiosWithSession, appLocation } from '../componentutils'
import FormData from 'form-data'
import { AxiosResponse } from 'axios'
import { IndexDBFiles, IndexDBFilesFile } from '../../indexeddb'

import { v4 } from 'uuid'
import { AES_FILE_KEY_LENGTH } from '../../const'

/**
 * 生成
 */
export const genUUID = () => v4().replace(/-/g, '_')

/**
 * IndexDB情報からサーバDB保存用データを抽出
 */
export const IndexDBFiles2FileInfo = (file: IndexDBFilesFile):FileInfoFile => ({
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
export const FileInfo2IndexDBFiles = (
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
 * ファイル名に指定番号を追加したものを取得(Like Windows)
 */
export const getAddingNumberFileName = (name: string, idx: number) => {
  if (idx === 0) return name
  const t = name.lastIndexOf('.')
  return `${name.slice(0, t)} (${idx})${name.slice(t)}`
}

/**
 * 指定階層に保存して問題のないファイル名を取得
 */
export const getSafeName = (hopedName: string[], samelevelfiles: string[]) => {
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
export const readfile = (x: File) => new Promise<ArrayBuffer>((resolve, reject) => {
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
export const getFileHash = async (bin: ArrayBuffer) => {
  const hash = await crypto.subtle.digest('SHA-256', bin)
  return { hashStr: Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''), bin: bin }
}

/**
 * ファイル情報のみをサーバに保存
 */
export const submitFileInfoWithEncryption = async (fileInfo: FileInfoFolder): Promise<FileInfoFolderWithCrypto> => {
  // genkey
  const fileKeyRaw = crypto.getRandomValues(new Uint8Array(AES_FILE_KEY_LENGTH))
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
export const submitFileWithEncryption = async (x: File, name: string, parentId: string | null): Promise<FileInfoFileWithCrypto> => {
  // gen unique name
  const uuid = genUUID()

  const fileKeyRaw = crypto.getRandomValues(new Uint8Array(AES_FILE_KEY_LENGTH))
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
 * 取得したファイル情報を複合
 */
export const decryptoFileInfo = async (fileinforaw: getfileinfoJSONRow): Promise<FileInfoWithCrypto> => {
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
export const getEncryptedFileRaw = async (fileId: string) => {
  const encryptedFileRowDL = await axiosWithSession.get<{}, AxiosResponse<ArrayBuffer>>(`${appLocation}/bin/${fileId}`, { responseType: 'arraybuffer' })
  return encryptedFileRowDL.data
}
