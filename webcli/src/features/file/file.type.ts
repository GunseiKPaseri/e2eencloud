
/**
 * ノード要素
 */
export type FileObject = {type: 'file', name: string, diff: string[], prevId?: string, nextId?: string, parent: string | null, blobURL?: string}
/**
 * ノード要素
 */
export type FolderObject = {type: 'folder', name: string, diff: string[], prevId?: string, nextId?: string, parent: string | null, files: string[]}

/**
 * ノード要素
 */
export type DiffObject = {type: 'diff', name: string, prevId?: string, nextId?: string, parent: string | null, blobURL?: string}
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

export type FileInfo = FileInfoFile | FileInfoFolder

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

export type FileInfoWithCrypto = FileInfoFileWithCrypto | FileInfoFolderWithCrypto

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
