import type { Highlight, SearchQuery } from './util/search.type';

import type {
  FileDifference,
  ExpansionInfoImage,
  FileInfoFile,
  FileInfoFolder,
  FileInfoDiffFile,
  FileInfo,
  FileInfoVersions,
} from './fileinfoMigration/fileinfo';

export type {
  FileDifference,
  ExpansionInfoImage,
  FileInfoFile,
  FileInfoFolder,
  FileInfoDiffFile,
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

export type FileCryptoInfoWithoutBin<T extends Exclude<FileInfo, FileInfoFile>> = {
  fileKeyBin: number[],
  fileInfo: T,
  originalVersion: FileInfoVersions
};

export type FileCryptoInfo<T extends FileInfo> =
  T extends Exclude<FileInfo, FileInfoFile>
    ? FileCryptoInfoWithoutBin<T>
    : FileCryptoInfoWithBin;

export interface ExpansionInfoImageLocal {
  type: 'img',
  ahashObj: number[],
  dhashObj: number[],
  phashObj: number[],
}

export type FileNode<T extends FileInfo> = {
  nextId?: string
} & (T extends FileInfoFolder
  ? FileInfoFolder & {
    history: string[], // new => old
    files: string[],
    origin: FileCryptoInfo<FileInfoFolder>
  }
  : T extends FileInfoDiffFile
    ? FileInfoDiffFile & {
      blobURL?: string,
      origin: FileCryptoInfo<FileInfoDiffFile>
    }
    : FileInfoFile & {
      expansion?: ExpansionInfoImageLocal,
      history: string[], // new => old
      blobURL?: string,
      previewURL?: string,
      origin: FileCryptoInfo<FileInfoFile>
    });

/**
  * ディレクトリテーブル
  */
export type FileTable = Record<string, FileNode<FileInfo>>;

type GroupCommon = { files: string[], selecting: string[] };

export type TagGroup = GroupCommon & { type: 'tag', tagName: string };
export type DirGroup = GroupCommon & { type: 'dir', folderId: string, parents: string[] };
export type SearchGroup = GroupCommon & { type: 'search', exfiles: [string, Highlight[]][], queryString: string, query: SearchQuery };

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
  tagTree: Record<string, string[]>
};

/* 容量情報 */
export interface StorageInfo {
  usage: number;
  capacity: number;
}
