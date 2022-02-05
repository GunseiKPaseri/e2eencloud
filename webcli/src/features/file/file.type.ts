/**
 * 差分情報
 */
export interface FileDifference{
  addtag?: string[],
  deltag?: string[]
}

/**
 *  サーバDBに保存するファイルに関する情報
 */
export interface FileInfoFile {
  type: 'file',
  id: string,
  name: string,
  sha256: string,
  mime: string,
  size: number,
  parentId: string | null,
  prevId?: string,
  tag: string[]
}
/**
 *  サーバDBに保存するフォルダに関する情報
 */
export interface FileInfoFolder {
  type: 'folder',
  id: string,
  name: string,
  parentId: string | null,
  prevId?: string,
}
/**
 *  サーバDBに保存する差分に関する情報
 */
export interface FileInfoDiffFile {
  type: 'diff',
  id: string,
  name: string,
  parentId: string | null,
  prevId?: string,
  diff: FileDifference
}

/**
 * サーバに保存する情報
 */
export type FileInfo = FileInfoFile | FileInfoFolder | FileInfoDiffFile

/**
 * 手元で管理するファイル情報
 */
export type FileNodeFile = {type: 'file', name: string, history: string[], prevId?: string, nextId?: string, parent: string | null, blobURL?: string, tag: string[]}

/**
 * 手元で管理するフォルダ情報
 */
export type FileNodeFolder = {type: 'folder', name: string, history: string[], prevId?: string, nextId?: string, parent: string | null, files: string[]}

/**
 * 手元で管理する差分情報
 */
export type FileNodeDiff = {type: 'diff', name: string, prevId?: string, nextId?: string, parent: string | null, blobURL?: string, diff: FileDifference}

/**
  * 手元で管理する情報
  */
export type FileNode = FileNodeFile | FileNodeFolder | FileNodeDiff

/**
  * ディレクトリテーブル
  */
export type FileTable = { [key: string]: FileNode }

/**
 * サーバDBから取得した情報
 */
export interface FileCryptoInfoWithBin {
  encryptedFileIV: Uint8Array,
  fileKey: CryptoKey,
  fileInfo: FileInfoFile,
  fileKeyRaw: Uint8Array
}

export interface FileCryptoInfoWithoutBin {
  fileKey: CryptoKey,
  fileInfo: FileInfoFolder | FileInfoDiffFile,
  fileKeyRaw: Uint8Array
}

export type FileCryptoInfo = FileCryptoInfoWithBin | FileCryptoInfoWithoutBin

export type tagGroup = {type: 'tag', files: string[], tagName: string}
export type dirGroup = {type: 'dir', files: string[], parents: string[]}

export interface getfileinfoJSONRow {
  id: string,
  encryptedFileIVBase64?: string,
  encryptedFileKeyBase64: string,
  encryptedFileInfoBase64: string,
  encryptedFileInfoIVBase64: string,
  encryptedSize: string;
}
