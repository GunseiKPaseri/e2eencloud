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
  FileInfoNotFile,
  ExpansionInfoImage
} from './file.type'
import {
  assertFileNodeFile,
  assertFileNodeFolder,
  assertNonFileNodeDiff
} from './filetypeAssert'

import { decryptByRSA, encryptByRSA } from '../../encrypt'
import { assertArrayNumber } from '../../utils/assert'
import { string2ByteArray, byteArray2base64, base642ByteArray, byteArray2string } from '../../utils/uint8'
import { getAESGCMKey, AESGCM,  decryptAESGCM } from '../../utils/crypto'
import { axiosWithSession, appLocation } from '../componentutils'
import FormData from 'form-data'
import { AxiosResponse } from 'axios'

import { v4 } from 'uuid'
import { AES_FILE_KEY_LENGTH } from '../../const'
import { getPreview } from '../../utils/img'
import { fileInfoMigrate, latestVersion } from './fileinfoMigration/fileinfo'

import BrowserJimpImgClass from 'imghash-js/dist/esm/ImgClass/BrowserJimpImgClass'
import ImgHash from 'imghash-js/dist/esm/ImgHash'
import ahash from 'imghash-js/dist/esm/ahash'
import dhash from 'imghash-js/dist/esm/dhash'
import phash from 'imghash-js/dist/esm/phash'

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
 * 容量値を分かりやすい値に落としこむ
 * @param byte 数値(byte)
 * @returns 
 */
export const explainByte = (byte: number)=>{
  if(byte < 1000) return `${byte}B`
  const kb = Math.ceil(byte/100)/10
  if(kb < 1000) return `${kb}KB`
  const mb = Math.ceil(kb/100)/10
  if(mb < 1000) return `${mb}MB`
  const gb = Math.ceil(mb/100)/10
  return `${gb}GB`
}

/**
 * ファイル拡張情報の生成
 */
export const genExpansion = async (fileInfo: FileInfoFile, blobURL: string): Promise<{expansion: FileInfoFile['expansion'], expansionLocal: FileNode<FileInfoFile>['expansion']} | undefined> => {
  if(fileInfo.mime.indexOf("image/") === 0 ){
    // image
    const img = await (new BrowserJimpImgClass()).init(blobURL)
    console.log(img)
    const imghashs = {ahashObj: ahash(img.clone()), dhashObj: dhash(img.clone()), phashObj: phash(img.clone())}
    const expansion: FileInfoFile['expansion'] = {
      type: 'img',
      width: img.raw().bitmap.width,
      height: img.raw().bitmap.height,
      ahash: imghashs.ahashObj.hex,
      dhash: imghashs.dhashObj.hex,
      phash: imghashs.phashObj.hex
    }
    return {
      expansion: expansion,
      expansionLocal: {
        ...expansion,
        ahashObj: imghashs.ahashObj.byte,
        dhashObj: imghashs.dhashObj.byte,
        phashObj: imghashs.phashObj.byte
      }
    }
  }
  return undefined
}


/**
 * ローカル用に取得する情報
 */
export type ExpandServerDataResult = {blobURL: string, previewURL: string | undefined, expansion: FileNode<FileInfoFile>['expansion']}

/**
 * サーバ情報をローカル用に展開
 */
export const expandServerData = async (fileObj: FileNode<FileInfoFile>, blobURL: string, exists?: {expansion: FileNode<FileInfoFile>['expansion']}):Promise<ExpandServerDataResult> => {
  let previewURL:string | undefined
  let expansion:FileNode<FileInfoFile>['expansion'] = exists?.expansion
  if (fileObj.mime.indexOf('image/') === 0) {
    // make preview
    const MAX_SIZE = 150
    previewURL = await getPreview(blobURL, MAX_SIZE, 'image/png')
    const expansionOrigin = fileObj.origin.fileInfo.expansion
    if(!expansion && expansionOrigin && expansionOrigin.type === 'img'){
      expansion = {
        ...expansionOrigin,
        ahashObj: (new ImgHash('ahash', expansionOrigin.ahash, 'hex')).byte,
        dhashObj: (new ImgHash('dhash', expansionOrigin.dhash, 'hex')).byte,
        phashObj: (new ImgHash('phash', expansionOrigin.phash, 'hex')).byte,
      }
    }
  }

  return {blobURL, previewURL, expansion}
}

/**
 * ファイル情報のみをサーバに保存
 */
export const submitFileInfoWithEncryption = async <T extends FileInfoNotFile>(fileInfo: T): Promise<FileCryptoInfoWithoutBin<T>> => {
  // genkey
  const fileKeyRaw = crypto.getRandomValues(new Uint8Array(AES_FILE_KEY_LENGTH))
  // readfile,getHash | getKey
  const encryptedFileKeyAsync = encryptByRSA(fileKeyRaw)
  const fileKey = getAESGCMKey(fileKeyRaw)

  const fileInfoArray = string2ByteArray(JSON.stringify(fileInfo))
  // encrypt
  const encryptedFileInfo = await AESGCM(fileInfoArray, await fileKey)

  const encryptedFileInfoBase64 = byteArray2base64(new Uint8Array(encryptedFileInfo.encrypt))
  const encryptedFileInfoIVBase64 = byteArray2base64(encryptedFileInfo.iv)

  const encryptedFileKeyBase64 = byteArray2base64(new Uint8Array(await encryptedFileKeyAsync))

  // send encryptedfile, send encryptedfileinfo, encryptedfilekey iv,iv
  const fileSendData = new FormData()
  fileSendData.append('id', fileInfo.id)
  fileSendData.append('encryptedFileInfoBase64', encryptedFileInfoBase64)
  fileSendData.append('encryptedFileInfoIVBase64', encryptedFileInfoIVBase64)
  fileSendData.append('encryptedFileKeyBase64', encryptedFileKeyBase64)
  await axiosWithSession.post(`${appLocation}/api/files`, fileSendData)

  return { fileKeyBin: Array.from(fileKeyRaw), fileInfo, originalVersion: fileInfo.version }
}
/**
 * ファイルをenryptoしてサーバに保存
 */
export const submitFileWithEncryption
  = async (x: File, name: string, parentId: string | null):
    Promise<{server: FileCryptoInfoWithBin, local: ExpandServerDataResult}> => {
  // gen unique name
  const uuid = genUUID()

  // blob
  const blobURL = URL.createObjectURL(x)

  const fileKeyRaw = crypto.getRandomValues(new Uint8Array(AES_FILE_KEY_LENGTH))
  // readfile,getHash | getKey
  const fileKeyAsync = getAESGCMKey(fileKeyRaw)
  const { bin, hashStr } = await readfile(x).then((bin) => getFileHash(bin))

  const fileInfo:FileInfoFile = {
    id: uuid,
    name: name,
    createdAt: Date.now(),
    version: latestVersion,
    sha256: hashStr,
    mime: x.type,
    type: 'file',
    size: bin.byteLength,
    parentId: parentId ?? 'root',
    tag: []
  }
  const expansion = await genExpansion(fileInfo, blobURL)
  console.log(fileInfo, expansion)
  if(expansion) fileInfo.expansion = expansion.expansion

  const fileKey = await fileKeyAsync
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

  const fileObj: FileNode<FileInfoFile> = {
    ...fileInfo,
    expansion: undefined,
    history: [fileInfo.id],
    origin: {
      fileInfo,
      fileKeyBin,
      encryptedFileIVBin,
      originalVersion: fileInfo.version
    },
    blobURL
  }

  const local = await expandServerData(fileObj, blobURL, {expansion: expansion?.expansionLocal})

  return {server: { encryptedFileIVBin, fileKeyBin, fileInfo, originalVersion: fileInfo.version }, local}
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
  const {fileInfo, originalVersion} = fileInfoMigrate(byteArray2string(await decryptAESGCM(encryptedFileInfo, fileKey, encryptedFileInfoIV)))
  if (fileInfo.type === 'file') {
    if (!fileinforaw.encryptedFileIVBase64) throw new Error('取得情報が矛盾しています。fileにも関わらずencryptedFileIVが含まれていません')
    const encryptedFileIV = base642ByteArray(fileinforaw.encryptedFileIVBase64)
    const encryptedFileIVBin = Array.from(encryptedFileIV)
    return { encryptedFileIVBin, fileKeyBin, fileInfo, originalVersion }
  }
  if (fileInfo.type === 'folder') return { fileKeyBin, fileInfo, originalVersion }
  return { fileKeyBin, fileInfo, originalVersion }
}

/**
 * 対象ファイルの生データを取得
 */
export const getEncryptedFileRaw = async (fileId: string) => {
  const encryptedFileRowDL = await axiosWithSession.get<{}, AxiosResponse<ArrayBuffer>>(`${appLocation}/api/files/${fileId}/bin`, { responseType: 'arraybuffer' })
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
      version: latestVersion,
      files: [],
      parentId: null,
      history: [],
      origin:{
        fileInfo: {
          type: 'folder',
          createdAt: 0,
          version: latestVersion,
          id: 'root',
          name: 'root',
          parentId: null
        },
        fileKeyBin: [],
        originalVersion: latestVersion,
      }
    }
  }
  const nextTable: {[key: string]: string | undefined} = {}
  for (const fileInfoWithEnc of files) {
    const { fileInfo, fileKeyBin, originalVersion } = fileInfoWithEnc
    switch (fileInfo.type) {
      case 'folder':
        fileTable[fileInfo.id] = {
          ...fileInfo,
          parentId: fileInfo.parentId ?? 'root',
          history: [],
          files: [],
          origin: {fileInfo, fileKeyBin, originalVersion}
        }
        break
      case 'file': {
        const fileInfoWithEncx: {[entry: string]: unknown} = fileInfoWithEnc
        const fileInfoWithEncMustHaveBin: {encryptedFileIVBin?: unknown} = fileInfoWithEncx
        const { encryptedFileIVBin } = fileInfoWithEncMustHaveBin
        assertArrayNumber(encryptedFileIVBin)
        fileTable[fileInfo.id] = {
          ...fileInfo,
          expansion: undefined,
          parentId: fileInfo.parentId ?? 'root',
          history: [],
          origin: {fileInfo, fileKeyBin, encryptedFileIVBin, originalVersion}
        }
        break
      }
      default:
        fileTable[fileInfo.id] = {
          ...fileInfo,
          parentId: fileInfo.parentId ?? 'root',
          origin: {fileInfo, fileKeyBin, originalVersion},
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
export const createDiff = (props: {targetId: string, newName?: string, newTags?: string[] | {addtag?: string[], deltag?: string[]}, newParentId?:string}, fileTable: FileTable):FileInfoDiffFile => {
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
    let deltag: string[] = []
    let addtag: string[] = []
    if(Array.isArray(newTags)){
      const newTagSet = new Set(newTags)
      deltag = oldTags.filter(x => !newTagSet.has(x))
      addtag = [...newTagSet].filter(x => !oldTags.includes(x))
    } else {
      const newDeltag = new Set(newTags.deltag)
      const newAddtag = new Set(newTags.addtag)
      deltag = oldTags.filter(x => newDeltag.has(x) && !newAddtag.has(x))
      addtag = [...newAddtag].filter(x => !oldTags.includes(x) && !newDeltag.has(x))
    }
    diff.deltag = deltag.length > 0 ? deltag : undefined
    diff.addtag = addtag.length > 0 ? addtag : undefined
  }

  return {
    id: genUUID(),
    name: name,
    createdAt: Date.now(),
    version: latestVersion,
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

/**
 * 類似ファイルを取得
 */
export const listUpSimilarFile = (target: FileNode<FileInfoFile>, fileTable: FileTable, num: number = 15) => {
  const similarFiles: [number, string][] = []
  console.log(target.expansion)
  const imgHashMode = target.expansion && target.expansion.type === 'img' ? new ImgHash('phash', target.expansion.phashObj) : null
  for(const x of Object.values(fileTable)){
    // 探索対象は相異なる最新のファイル実体のみ
    console.log(x)
    if(x.type !== 'file' || x.history.length === 0 || x.id === target.id) continue;
    console.log(x.id, imgHashMode)
    if(imgHashMode){
      if(x.expansion && x.expansion.type === 'img'){
        // imghash
        const score = imgHashMode.degreeOfSimilarity(new ImgHash('phash', x.expansion.phashObj))
        console.log(score)
        if( score > 0.6){
          similarFiles.push([score, x.id])
        }
      }
    }else{
      // hash
      if(target.sha256 === x.sha256) similarFiles.push([1, x.id])
    }
  }
  similarFiles.sort((a,b) => b[0] - a[0])
  console.log(similarFiles)
  return similarFiles.slice(0, num).map(x => x[1])
}
