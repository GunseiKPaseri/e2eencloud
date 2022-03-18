import { SearchQuery } from "./util/search"

/**
 * 差分情報
 */
export interface FileDifference{
  addtag?: string[],
  deltag?: string[]
}

/**
 * サーバに保存するファイルに関する拡張情報
 */
export interface ExpansionInfoImage{
  type: 'img',
  width: number,
  height: number,
  ahash: string,
  dhash: string,
  phash: string,
}

/**
 *  サーバDBに保存するファイルに関する情報
 */
export interface FileInfoFile {
  type: 'file',
  id: string,
  name: string,
  createdAt: number,
  sha256: string,
  mime: string,
  size: number,
  parentId: string | null,
  prevId?: string,
  tag: string[],
  expansion?: ExpansionInfoImage
}
/**
 *  サーバDBに保存するフォルダに関する情報
 */
export interface FileInfoFolder {
  type: 'folder',
  id: string,
  name: string,
  createdAt: number,
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
  createdAt: number,
  parentId: string | null,
  prevId?: string,
  diff: FileDifference
}

export type FileInfoNotFile = FileInfoFolder | FileInfoDiffFile

/**
 * サーバに保存する情報
 */
export type FileInfo = FileInfoFile | FileInfoNotFile

/**
 * サーバDBから取得した情報
 */

export type FileCryptoInfoWithBin = {
  encryptedFileIVBin: number[],
  fileKeyBin: number[],
  fileInfo: FileInfoFile,
}

export type FileCryptoInfoWithoutBin<T extends FileInfoNotFile> = {
  fileKeyBin: number[],
  fileInfo: T
}

export type FileCryptoInfo<T extends FileInfo> = T extends FileInfoNotFile ? FileCryptoInfoWithoutBin<T> : FileCryptoInfoWithBin

export interface ExpansionInfoImageLocal{
  type: 'img',
  ahashObj: number[],
  dhashObj: number[],
  phashObj: number[],
}

export type FileNode<T extends FileInfo> = T extends FileInfoFolder
  ? FileInfoFolder & {
      history: string[], // new => old
      nextId?: string,
      files: string[],
      origin: FileCryptoInfo<FileInfoFolder>
    }
  : T extends FileInfoDiffFile
    ? FileInfoDiffFile & {
        nextId?: string,
        blobURL?: string,
        origin: FileCryptoInfo<FileInfoDiffFile>
      }
    : FileInfoFile & {
      expansion?: ExpansionInfoImageLocal,
      history: string[], // new => old
      nextId?: string,
      blobURL?: string,
      previewURL?: string,
      origin: FileCryptoInfo<FileInfoFile>
    }

/**
  * ディレクトリテーブル
  */
export type FileTable = { [key: string]: FileNode<FileInfo> }

export type tagGroup = {type: 'tag', files: string[], tagName: string}
export type dirGroup = {type: 'dir', folderId: string, files: string[], parents: string[]}
export type searchGroup = {type: 'search', files: string[], queryString: string, query: SearchQuery}

export interface getfileinfoJSONRow {
  id: string,
  encryptedFileIVBase64?: string,
  encryptedFileKeyBase64: string,
  encryptedFileInfoBase64: string,
  encryptedFileInfoIVBase64: string,
  encryptedSize: string;
}

export type buildFileTableAsyncResult = { fileTable: FileTable, tagTree: { [key: string]: string[] } }
