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
  FileInfoDiffFile,
  FileDifference,
  buildFileTableAsyncResult,
  FileInfoNotFile
} from './file.type'

import { decryptByRSA, encryptByRSA } from '../../encrypt'
import { getAESGCMKey, AESGCM, string2ByteArray, byteArray2base64, base642ByteArray, decryptAESGCM, byteArray2string, assertArrayNumber } from '../../util'
import { axiosWithSession, appLocation } from '../componentutils'
import FormData from 'form-data'
import { AxiosResponse } from 'axios'

import { v4 } from 'uuid'
import { AES_FILE_KEY_LENGTH } from '../../const'
import { WritableDraft } from 'immer/dist/internal'

/**
 * 要素がFileNodeDiffで無いと確信
 * @param fileNode FileNodeFile | FileNodeFolder
 */
export const assertNonFileNodeDiff:
  (fileNode:FileNode<FileInfo>) => asserts fileNode is FileNode<FileInfoFile | FileInfoFolder> =
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
  (fileNode:FileNode<FileInfo>) => asserts fileNode is FileNode<FileInfoFolder> =
  (fileNode) => {
    if (fileNode.type !== 'folder') {
      throw new Error('This is not Folder Object!!')
    }
  }

/**
 * 要素がFileNodeFileであると確信
 * @param fileNode FileNodeFile
 */
export const assertFileNodeFile:
  (fileNode:FileNode<FileInfo>) => asserts fileNode is FileNode<FileInfoFile> =
  (fileNode) => {
    if (fileNode.type !== 'file') {
      throw new Error('This is not File Object!!')
    }
  }

/**
 * 要素がWritableDraft<FileNodeDiff>で無いと確信
 * @param fileNode WritableDraft<WileObject> | WritableDraft<FileNodeFolder>
 */
export const assertNonWritableDraftFileNodeDiff:
  (fileNode:WritableDraft<FileNode<FileInfo>>) => asserts fileNode is WritableDraft<FileNode<FileInfoFile>> | WritableDraft<FileNode<FileInfoFolder>> =
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
  (fileNode:WritableDraft<FileNode<FileInfo>>) => asserts fileNode is WritableDraft<FileNode<FileInfoFolder>> =
  (fileNode) => {
    if (fileNode.type !== 'folder') {
      throw new Error('This is not Folder Object!!')
    }
  }

/**
 * 要素がFileInfoDiffFileであると確信
 * @param fileInfoDiffFile FileNodeDiffFile
 */
export const assertFileInfoDiffFile:
  (fileInfo:FileInfo) => asserts fileInfo is FileInfoDiffFile =
  (fileInfo) => {
    if (fileInfo.type !== 'diff') {
      throw new Error('This is not Diff Object!!')
    }
  }
/**
 * 要素がFileInfoDiffFileであると確信
 * @param fileInfoDiffFile FileNodeDiffFile
 */
export const assertFileInfoFolder:
  (fileInfo:FileInfo) => asserts fileInfo is FileInfoFolder =
  (fileInfo) => {
    if (fileInfo.type !== 'folder') {
      throw new Error('This is not Folder!!')
    }
  }

/**
 * 生成
 */
export const genUUID = () => v4().replace(/-/g, '_')

/**
 * 拡張子が変化しているかを確認する
 */
export const isDiffExt = (a: string, b: string) => {
  const aidx = a.lastIndexOf('.')
  const bidx = b.lastIndexOf('.')
  const exta = aidx === -1 ? '' : a.slice(aidx)
  const extb = bidx === -1 ? '' : b.slice(bidx)
  return exta !== extb
}

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
export const submitFileInfoWithEncryption = async <T extends FileInfoNotFile>(fileInfo: T): Promise<FileCryptoInfoWithoutBin<T>> => {
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

  return { fileKeyBin: Array.from(fileKeyRaw), fileInfo }
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
    createdAt: Date.now(),
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
  const encryptedFileIVBin = Array.from(encryptedFileIV)
  const fileKeyBin = Array.from(fileKeyRaw)

  return { encryptedFileIVBin, fileKeyBin, fileInfo }
}

/**
 * 取得したファイル情報を複合
 */
export const decryptoFileInfo = async (fileinforaw: getfileinfoJSONRow): Promise<FileCryptoInfo<FileInfo>> => {
  const encryptedFileKey = base642ByteArray(fileinforaw.encryptedFileKeyBase64)
  const encryptedFileInfo = base642ByteArray(fileinforaw.encryptedFileInfoBase64)
  const encryptedFileInfoIV = base642ByteArray(fileinforaw.encryptedFileInfoIVBase64)

  const fileKeyRaw = new Uint8Array(await decryptByRSA(encryptedFileKey))

  const fileKey = await getAESGCMKey(fileKeyRaw)
  const fileKeyBin = Array.from(fileKeyRaw)
  const fileInfo:FileInfo = JSON.parse(byteArray2string(await decryptAESGCM(encryptedFileInfo, fileKey, encryptedFileInfoIV)))
  if (fileInfo.type === 'file') {
    if (!fileinforaw.encryptedFileIVBase64) throw new Error('取得情報が矛盾しています。fileにも関わらずencryptedFileIVが含まれていません')
    const encryptedFileIV = base642ByteArray(fileinforaw.encryptedFileIVBase64)
    const encryptedFileIVBin = Array.from(encryptedFileIV)
    return { encryptedFileIVBin, fileKeyBin, fileInfo }
  }
  if (fileInfo.type === 'folder') return { fileKeyBin, fileInfo }
  return { fileKeyBin, fileInfo }
}

/**
 * 対象ファイルの生データを取得
 */
export const getEncryptedFileRaw = async (fileId: string) => {
  const encryptedFileRowDL = await axiosWithSession.get<{}, AxiosResponse<ArrayBuffer>>(`${appLocation}/bin/${fileId}`, { responseType: 'arraybuffer' })
  return encryptedFileRowDL.data
}

/**
 * 差分をオブジェクトに反映したものを返す
 */
export const integrateDifference = <T extends FileNode<FileInfoFile | FileInfoFolder>>(diffs: string[], fileTable: FileTable, targetFile: T):T => {
  const copiedTargetFile = {...targetFile}
  const tagset = new Set<string>((copiedTargetFile.type === 'file' ? copiedTargetFile.tag : []))
  for (const c of diffs) {
    const nextFile = fileTable[c]
    copiedTargetFile.name = nextFile.name
    copiedTargetFile.parentId = nextFile.parentId ?? 'root'

    if (nextFile.type === 'diff') {
      const { addtag, deltag } = nextFile.diff
      if (copiedTargetFile.type === 'file') {
        if (addtag) {
          addtag.forEach(x => tagset.add(x))
        }
        if (deltag) {
          deltag.forEach(x => tagset.delete(x))
        }
      }
    }
  }
  if (copiedTargetFile.type === 'file') {
    copiedTargetFile.tag = [...tagset]
  }
  return copiedTargetFile
}

/**
 * ファイルの親を取得
 */
export const getFileParentsList = (firstId: string, fileTable: FileTable) => {
  const parents: string[] = []
  let id: string | null = firstId
  while (id) {
    parents.push(id)
    const parentNode: FileNode<FileInfo> = fileTable[id]
    assertFileNodeFolder(parentNode)
    id = parentNode.parentId
  }
  return parents.reverse()
}

/**
 * 与えられたファイルIdをファイル名でソート
 */
export const fileSort = (filelist: string[], fileTable: FileTable) => {
  return filelist.sort((a, b) => {
    const ta = fileTable[a]
    const tb = fileTable[b]
    if (ta.type === 'folder' && tb.type === 'file') return -1
    if (ta.type === 'file' && tb.type === 'folder') return 1
    return fileTable[a].name.localeCompare(fileTable[b].name, 'ja')
  })
}

/**
 * 取得したファイル情報からfileTableを構成
 */
export const buildFileTable = (files: FileCryptoInfo<FileInfo>[]):buildFileTableAsyncResult => {
  const fileTable: FileTable = {
    root: {
      id: 'root',
      type: 'folder',
      name: 'root',
      createdAt: 0,
      files: [],
      parentId: null,
      history: [],
      origin:{
        fileInfo: {
          type: 'folder',
          createdAt: 0,
          id: 'root',
          name: 'root',
          parentId: null
        },
        fileKeyBin: []
      }
    }
  }
  const nextTable: {[key: string]: string | undefined} = {}
  for (const fileInfoWithEnc of files) {
    const { fileInfo, fileKeyBin } = fileInfoWithEnc
    switch (fileInfo.type) {
      case 'folder':
        fileTable[fileInfo.id] = {
          ...fileInfo,
          parentId: fileInfo.parentId ?? 'root',
          history: [],
          files: [],
          origin: {fileInfo, fileKeyBin}
        }
        break
      case 'file': {
        const fileInfoWithEncx: {[entry: string]: unknown} = fileInfoWithEnc
        const fileInfoWithEncMustHaveBin: {encryptedFileIVBin?: unknown} = fileInfoWithEncx
        const { encryptedFileIVBin } = fileInfoWithEncMustHaveBin
        assertArrayNumber(encryptedFileIVBin)
        fileTable[fileInfo.id] = {
          ...fileInfo,
          parentId: fileInfo.parentId ?? 'root',
          history: [],
          origin: {fileInfo, fileKeyBin, encryptedFileIVBin}
        }
        break
      }
      default:
        fileTable[fileInfo.id] = {
          ...fileInfo,
          parentId: fileInfo.parentId ?? 'root',
          origin: {fileInfo, fileKeyBin},
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
      let nowWatchObject: FileNode<FileInfo> | undefined
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
    // 子供の差分をfileTableに反映 old -> new
    fileTable[targetNode.id] = integrateDifference(childTree, fileTable, targetNode)
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
      t.files = fileSort(t.files, fileTable)
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

/**
 * 新しい名前を検証
 */
const checkRename = (newName: string, prevNode: FileNode<FileInfoFile | FileInfoFolder>, fileTable: FileTable, parent?: string) => {
  if (prevNode.id === 'root' || prevNode.parentId === null) throw new Error('rootの名称は変更できません')
  if (newName === '') throw new Error('空文字は許容されません')
  const parentNode = fileTable[parent ?? prevNode.parentId]
  assertFileNodeFolder(parentNode)
  // 同名のフォルダ・同名のファイルを作らないように
  const [changedName] = getSafeName([newName],
    parentNode.files.flatMap(x => (fileTable[x].type === prevNode.type ? [fileTable[x].name] : []))
  )
  return changedName
}

/**
 * 差分情報を作成
 */
export const createDiff = (props: {targetId: string, newName?: string, newTags?: string[], newParentId?:string}, fileTable: FileTable):FileInfoDiffFile => {
  const { targetId, newName, newTags, newParentId } = props
  const targetNode = fileTable[targetId]
  if (!targetNode) throw new Error('存在しないファイルです')
  if (!(targetNode.type === 'file' || targetNode.type === 'folder')) throw new Error('適用要素が実体を持っていません')

  const diff: FileDifference = {}

  // 親の変更
  if(newParentId){
    if(newParentId === targetNode.parentId) throw new Error('親が同じです')
    const newParent = fileTable[newParentId]
    if(!newParent) throw new Error('存在しない親です')
    if(newParent.type !== 'folder') throw new Error('親に出来ない要素です')
    if(targetNode.type === 'folder'){
      const parents = getFileParentsList(newParentId, fileTable)
      console.log(targetNode, newParentId, parents)
      // 新しく追加する場所が今の要素の子要素であってはならない（フォルダの場合）
      if(parents.includes(targetNode.id)) throw new Error('子要素に移動することは出来ません')
    }
  }
  const parent = newParentId ?? targetNode.parentId ?? 'root'

  // rename
  const name = newName && newName !== targetNode.name ? checkRename(newName, targetNode, fileTable, parent) : targetNode.name
  if (targetNode.history.length === 0) throw new Error('過去のファイルは変更できません')
  const prevId = targetNode.history[0]

  // tag変更
  if (targetNode.type === 'file' && newTags) {
    const oldTags = targetNode.tag
    diff.deltag = oldTags.filter(x => !newTags.includes(x))
    diff.addtag = newTags.filter(x => !oldTags.includes(x))
  }

  return {
    id: genUUID(),
    name: name,
    createdAt: Date.now(),
    type: 'diff',
    parentId: parent === 'root' ? null : parent,
    prevId,
    diff
  }
}

/**
 * 対象を削除した時同時に削除するノードの一覧を取得
 */
export const getAllDependentFile = (target: FileNode<FileInfo>, fileTable: FileTable) => {
  let result = [target.id]
  if(target.type === 'folder'){
    // 以下に存在する全てのファイル
    target.files.map((x) => {
      return getAllDependentFile(fileTable[x], fileTable)
    }).flat()
  }
  // 変更履歴全て
  for(let t=target.prevId; t; t=fileTable[t].prevId){
    result.push(t)
  }
  for(let t=target.nextId; t; t=fileTable[t].nextId){
    result.push(t)
  }
  return result
}
