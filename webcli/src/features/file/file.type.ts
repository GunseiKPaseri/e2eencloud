import { Highlight, SearchQuery } from "./util/search"

import {
  FileDifference,
  ExpansionInfoImage,
  FileInfoFile,
  FileInfoFolder,
  FileInfoDiffFile,
  FileInfoNotFile,
  FileInfo,
  FileInfoVersions
} from './fileinfoMigration/fileinfo'

export type{
  FileDifference,
  ExpansionInfoImage,
  FileInfoFile,
  FileInfoFolder,
  FileInfoDiffFile,
  FileInfoNotFile,
  FileInfo
}

/**
 * サーバDBから取得した情報
 */

export type FileCryptoInfoWithBin = {
  encryptedFileIVBin: number[],
  fileKeyBin: number[],
  fileInfo: FileInfoFile,
  originalVersion: FileInfoVersions
}

export type FileCryptoInfoWithoutBin<T extends FileInfoNotFile> = {
  fileKeyBin: number[],
  fileInfo: T,
  originalVersion: FileInfoVersions
}

export type FileCryptoInfo<T extends FileInfo> =
  T extends FileInfoNotFile
    ? FileCryptoInfoWithoutBin<T>
    : FileCryptoInfoWithBin

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
export type searchGroup = {type: 'search', files: string[], exfiles: [string, Highlight[]][], queryString: string, query: SearchQuery}

export interface getfileinfoJSONRow {
  id: string,
  encryptedFileIVBase64?: string,
  encryptedFileKeyBase64: string,
  encryptedFileInfoBase64: string,
  encryptedFileInfoIVBase64: string,
  encryptedSize: string;
}

export type buildFileTableAsyncResult = { fileTable: FileTable, tagTree: { [key: string]: string[] } }

/* 容量情報 */
export interface StorageInfo {
  usage: number;
  capacity: number;
}