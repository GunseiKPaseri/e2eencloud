/**
 * 差分情報
 */
export interface FileDifference{
  addtag?: string[],
  deltag?: string[]
}

/**
 * ノード要素
 */
export type FileObject = {type: 'file', name: string, history: string[], prevId?: string, nextId?: string, parent: string | null, blobURL?: string, tag: string[]}

/**
 * ノード要素
 */
export type FolderObject = {type: 'folder', name: string, history: string[], prevId?: string, nextId?: string, parent: string | null, files: string[]}

/**
 * ノード要素
 */
export type DiffObject = {type: 'diff', name: string, prevId?: string, nextId?: string, parent: string | null, blobURL?: string, diff: FileDifference}

/**
 * ノード要素
 */
export type FileNode = FileObject | FolderObject | DiffObject

/**
 * ディレクトリテーブル
 */
export type FileTable = { [key: string]: FileNode }

/**
 *  サーバDBに保存するファイル情報
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
export interface FileInfoFolder {
  type: 'folder',
  id: string,
  name: string,
  parentId: string | null,
  prevId?: string,
}
export interface FileInfoDiffFile {
  type: 'diff',
  id: string,
  name: string,
  parentId: string | null,
  prevId?: string,
  diff: FileDifference
}

export type FileInfo = FileInfoFile | FileInfoFolder | FileInfoDiffFile

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
