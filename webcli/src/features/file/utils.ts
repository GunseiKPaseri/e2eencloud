import {
  FileInfoFile,
  FileInfoFolder,
  FileCryptoInfoWithoutBin,
  FileCryptoInfoWithBin,
  FileCryptoInfo,
  FileInfo,
  getfileinfoJSONRow,
  FileTable,
  FileNode,
  FileNodeFile,
  FileNodeFolder,
  FileInfoDiffFile
} from './file.type'

import { decryptByRSA, encryptByRSA } from '../../encrypt'
import { getAESGCMKey, AESGCM, string2ByteArray, byteArray2base64, base642ByteArray, decryptAESGCM, byteArray2string } from '../../util'
import { axiosWithSession, appLocation } from '../componentutils'
import FormData from 'form-data'
import { AxiosResponse } from 'axios'
import { IndexDBFiles, IndexDBFilesFile } from '../../indexeddb'

import { v4 } from 'uuid'
import { AES_FILE_KEY_LENGTH } from '../../const'
import { WritableDraft } from 'immer/dist/internal'

/**
 * 要素がFileNodeDiffで無いと確信
 * @param fileNode FileNodeFile | FileNodeFolder
 */
export const assertNonFileNodeDiff:
  (fileNode:FileNode) => asserts fileNode is FileNodeFile | FileNodeFolder =
  (fileNode) => {
    if (fileNode.type === 'diff') {
      throw new Error('This is Diff Object!!')
    }
  }

/**
 * 要素がFileNodeFolderであると確信
 * @param fileNode FileNodeFolder
 */
export const assertFileNodeFolder:
  (fileNode:FileNode) => asserts fileNode is FileNodeFolder =
  (fileNode) => {
    if (fileNode.type !== 'folder') {
      throw new Error('This is not Folder Object!!')
    }
  }

/**
 * 要素がWritableDraft<FileNodeDiff>で無いと確信
 * @param fileNode WritableDraft<WileObject> | WritableDraft<FileNodeFolder>
 */
export const assertNonWritableDraftFileNodeDiff:
  (fileNode:WritableDraft<FileNode>) => asserts fileNode is WritableDraft<FileNodeFile> | WritableDraft<FileNodeFolder> =
  (fileNode) => {
    if (fileNode.type === 'diff') {
      throw new Error('This is Diff Object!!')
    }
  }

/**
 * 要素がFileNodeFolderであると確信
 * @param fileNode WritableDraft<FileNodeFolder>
 */
export const assertWritableDraftFileNodeFolder:
  (fileNode:WritableDraft<FileNode>) => asserts fileNode is WritableDraft<FileNodeFolder> =
  (fileNode) => {
    if (fileNode.type !== 'folder') {
      throw new Error('This is not Folder Object!!')
    }
  }

/**
 * 生成
 */
export const genUUID = () => v4().replace(/-/g, '_')

/**
 * 拡張子が変化しているかを確認する
 */
export const diffExt = (a: string, b: string) => {
  const aidx = a.lastIndexOf('.')
  const bidx = b.lastIndexOf('.')
  const exta = aidx === -1 ? '' : a.slice(aidx)
  const extb = bidx === -1 ? '' : b.slice(bidx)
  return exta !== extb
}

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
  {fileInfo: FileInfoFolder | FileInfoDiffFile, fileKeyRaw: Uint8Array}
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
  if (idx === 1) return name
  const t = name.lastIndexOf('.')
  return t === -1 ? `${name} (${idx})` : `${name.slice(0, t)} (${idx})${name.slice(t)}`
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
    for (let i = 1; true; i++) {
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
export const submitFileInfoWithEncryption = async <T extends FileCryptoInfoWithoutBin['fileInfo']>(fileInfo: T): Promise<FileCryptoInfoWithoutBin> => {
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
export const submitFileWithEncryption = async (x: File, name: string, parentId: string | null): Promise<FileCryptoInfoWithBin> => {
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
    parentId: parentId ?? 'root',
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
export const decryptoFileInfo = async (fileinforaw: getfileinfoJSONRow): Promise<FileCryptoInfo> => {
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

/**
 * 差分をオブジェクトに反映
 */
export const integrateDifference = (diffs: string[], fileTable: FileTable, targetFile: FileNodeFile | FileNodeFolder) => {
  const tagset = new Set<string>((targetFile.type === 'file' ? targetFile.tag : []))
  for (const c of diffs) {
    const nextFile = fileTable[c]
    if (nextFile.name) targetFile.name = nextFile.name
    if (nextFile.parentId) targetFile.parentId = nextFile.parentId

    if (nextFile.type === 'diff') {
      const { addtag, deltag } = nextFile.diff
      if (targetFile.type === 'file') {
        if (addtag) {
          addtag.forEach(x => tagset.add(x))
        }
        if (deltag) {
          deltag.forEach(x => tagset.delete(x))
        }
      }
    }
  }
  if (targetFile.type === 'file') {
    targetFile.tag = [...tagset]
  }
}

/**
 * 取得したファイル情報からfileTableを構成
 */
export const buildFileTable = (files: FileCryptoInfo[]) => {
  const fileTable: FileTable = {
    root: {
      id: 'root',
      type: 'folder',
      name: 'root',
      files: [],
      parentId: null,
      history: [],
      originalFileInfo: {
        type: 'folder',
        id: 'root',
        name: 'root',
        parentId: null
      }
    }
  }
  const nextTable: {[key: string]: string | undefined} = {}
  for (const { fileInfo } of files) {
    switch (fileInfo.type) {
      case 'folder':
        fileTable[fileInfo.id] = {
          ...fileInfo,
          parentId: fileInfo.parentId ?? 'root',
          history: [],
          files: [],
          originalFileInfo: fileInfo
        }
        break
      case 'file':
        fileTable[fileInfo.id] = {
          ...fileInfo,
          parentId: fileInfo.parentId ?? 'root',
          history: [],
          originalFileInfo: fileInfo
        }
        break
      default:
        fileTable[fileInfo.id] = {
          ...fileInfo,
          parentId: fileInfo.parentId ?? 'root',
          originalFileInfo: fileInfo
        }
    }
    if (fileInfo.prevId) nextTable[fileInfo.prevId] = fileInfo.id
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
  const dirTreeItems = fileNodes.filter(x => {
    const y = descendantsTable[x]
    return y && !y.nextId
  })

  // 各dirTreeItemsについてdiffTreeを作成
  dirTreeItems.forEach((x) => {
    const childTree = descendantsTable[x]?.diffList
    if (!childTree) return
    const targetNode = fileTable[x]
    assertNonFileNodeDiff(targetNode)
    let nowWatchId: string | undefined = x
    // new -> old
    const ancestors: string[][] = []
    while (nowWatchId) {
      ancestors.push(descendantsTable[nowWatchId]?.diffList ?? [])
      nowWatchId = descendantsTable[nowWatchId]?.prevId
    }
    // new -> old
    targetNode.history =
      ancestors
        .map((x, i) => {
          if (i !== 0) x.pop()
          return x
        })
        .reverse()
        .flat()
        .reverse()
    // 子供の差分を反映 old -> new
    integrateDifference(childTree.reverse(), fileTable, targetNode)
  })

  // create dir tree
  dirTreeItems.forEach((x) => {
    assertNonFileNodeDiff(fileTable[x])
    const parentNode = fileTable[fileTable[x].parentId ?? 'root']
    assertFileNodeFolder(parentNode)
    parentNode.files.push(x)
  })
  // sort directory name
  dirTreeItems.push('root')
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
  for (const x of dirTreeItems) {
    const t = fileTable[x]
    if (t.type !== 'file') continue
    for (const tag of t.tag) {
      if (tagTree[tag]) {
        tagTree[tag].push(x)
      } else {
        tagTree[tag] = [x]
      }
    }
  }
  return { fileTable, tagTree }
}
