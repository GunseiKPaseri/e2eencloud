/**
 * 差分情報
 */
export interface FileDifference {
  addtag?: string[],
  deltag?: string[]
}

/**
 * サーバに保存するファイルに関する拡張情報
 */
export interface ExpansionInfoImage {
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
  version: 202204081414,
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
  version: 202204081414,
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
  version: 202204081414,
  parentId: string | null,
  prevId?: string,
  diff: FileDifference
}

export type FileInfoNotFile = FileInfoFolder | FileInfoDiffFile;

/**
 * サーバに保存する情報
 */
export type FileInfo = FileInfoFile | FileInfoNotFile;

/**
 * 古いバージョンも含むあらゆるFileInfo
 */
export type OldFileInfo = FileInfo;

type UpgradeFile = (oldfile: OldFileInfo, blob?: { blob: Blob, beforeVersion: OldFileInfo['version'] }) => { fileInfo: FileInfo, originalVersion: OldFileInfo['version'] };

/**
 * FileInfoのversionを202204081414まで上げる
 * @param x
 * @returns
 */
export const upFile:UpgradeFile = (oldfile) => (
  { fileInfo: oldfile, originalVersion: oldfile.version }
);
