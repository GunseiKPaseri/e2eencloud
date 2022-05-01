import type { Highlight, SearchQuery } from './util/search.type';

import type {
  FileDifference,
  ExpansionInfoImage,
  FileInfoFile,
  FileInfoFolder,
  FileInfoDiffFile,
  FileInfoNotFile,
  FileInfo,
  FileInfoVersions,
} from './fileinfoMigration/fileinfo';

export type{
  FileDifference,
  ExpansionInfoImage,
  FileInfoFile,
  FileInfoFolder,
  FileInfoDiffFile,
  FileInfoNotFile,
  FileInfo,
};

/**
 * サーバDBから取得した情報
 */

export type FileCryptoInfoWithBin = {
  encryptedFileIVBin: number[],
  fileKeyBin: number[],
  fileInfo: FileInfoFile,
  originalVersion: FileInfoVersions
};

export type FileCryptoInfoWithoutBin<T extends FileInfoNotFile> = {
  fileKeyBin: number[],
  fileInfo: T,
  originalVersion: FileInfoVersions
};

export type FileCryptoInfo<T extends FileInfo> =
  T extends FileInfoNotFile
    ? FileCryptoInfoWithoutBin<T>
    : FileCryptoInfoWithBin;

export interface ExpansionInfoImageLocal {
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
    };

/**
  * ディレクトリテーブル
  */
export type FileTable = { [key: string]: FileNode<FileInfo> };

export type TagGroup = { type: 'tag', files: string[], selecting: string[], tagName: string };
export type DirGroup = { type: 'dir', folderId: string, files: string[], selecting: string[], parents: string[] };
export type SearchGroup = { type: 'search', files: string[], selecting: string[], exfiles: [string, Highlight[]][], queryString: string, query: SearchQuery };

export interface GetfileinfoJSONRow {
  id: string,
  encryptedFileIVBase64?: string,
  encryptedFileKeyBase64: string,
  encryptedFileInfoBase64: string,
  encryptedFileInfoIVBase64: string,
  encryptedSize: string;
}

export type BuildFileTableAsyncResult = {
  fileTable: FileTable,
  tagTree: { [key: string]: string[] }
};

/* 容量情報 */
export interface StorageInfo {
  usage: number;
  capacity: number;
}
