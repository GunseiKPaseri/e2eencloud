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
 * サーバDBに保存する共通情報
 */
interface FileInfoCommon {
  id: string,
  name: string,
  createdAt: number,
  version: 202204081414,
  parentId: string | null,
  prevId?: string,
}
/**
 *  サーバDBに保存するファイルに関する情報
 */
export interface FileInfoFile extends FileInfoCommon {
  type: 'file',
  sha256: string,
  mime: string,
  size: number,
  tag: string[],
  expansion?: ExpansionInfoImage
}
/**
 *  サーバDBに保存するフォルダに関する情報
 */
export interface FileInfoFolder extends FileInfoCommon {
  type: 'folder',
}
/**
 *  サーバDBに保存する差分に関する情報
 */
export interface FileInfoDiffFile extends FileInfoCommon {
  type: 'diff',
  diff: FileDifference
}

/**
 * サーバに保存する情報
 */
export type FileInfo = FileInfoFile | FileInfoFolder | FileInfoDiffFile;

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
