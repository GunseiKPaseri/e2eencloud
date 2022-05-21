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
  tag: string[],
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

type UpgradeFile = (oldfile: Partial<OldFileInfo>, blob?: { blob: Blob, beforeVersion: OldFileInfo['version'] }) => { fileInfo: FileInfo, originalVersion: OldFileInfo['version'] };

const defaultFileInfoCommon: FileInfoCommon = {
  id: 'unknownfile',
  name: 'unknown',
  createdAt: 0,
  version: 202204081414,
  parentId: null,
};

const defaultFileInfoFile: FileInfoFile = {
  ...defaultFileInfoCommon,
  type: 'file',
  sha256: '',
  mime: 'application/octet-stream',
  size: 0,
  tag: [],
};

const defaultFileInfoFolder: FileInfoFolder = {
  ...defaultFileInfoCommon,
  type: 'folder',
  tag: [],
};

const defaultFileInfoDiffFile: FileInfoDiffFile = {
  ...defaultFileInfoCommon,
  type: 'diff',
  diff: {},
};

const buildFileInfoFile = (file: Partial<FileInfoFile>):FileInfoFile => ({
  type: 'file',
  id: typeof file.id === 'string' ? file.id : defaultFileInfoFile.id,
  name: typeof file.name === 'string' ? file.name : defaultFileInfoFile.name,
  createdAt: typeof file.createdAt === 'number' ? file.createdAt : defaultFileInfoFile.createdAt,
  version: typeof file.version === 'number' ? file.version : defaultFileInfoFile.version,
  parentId: typeof file.parentId === 'string' ? file.parentId : defaultFileInfoFile.parentId,
  sha256: typeof file.sha256 === 'string' ? file.sha256 : defaultFileInfoFile.sha256,
  mime: typeof file.mime === 'string' ? file.mime : defaultFileInfoFile.mime,
  size: typeof file.size === 'number' ? file.size : defaultFileInfoFile.size,
  tag: Array.isArray(file.tag) ? file.tag.filter((x) => typeof x === 'string') : defaultFileInfoFile.tag,
});

const buildFileInfoFolder = (file: Partial<FileInfoFolder>):FileInfoFolder => ({
  type: 'folder',
  id: typeof file.id === 'string' ? file.id : defaultFileInfoFolder.id,
  name: typeof file.name === 'string' ? file.name : defaultFileInfoFolder.name,
  createdAt: typeof file.createdAt === 'number' ? file.createdAt : defaultFileInfoFolder.createdAt,
  version: typeof file.version === 'number' ? file.version : defaultFileInfoFolder.version,
  parentId: typeof file.parentId === 'string' ? file.parentId : defaultFileInfoFolder.parentId,
  tag: Array.isArray(file.tag) ? file.tag.filter((x) => typeof x === 'string') : defaultFileInfoFolder.tag,
});

const buildDiff = (diff: Partial<FileDifference>):FileDifference => ({
  addtag: Array.isArray(diff.addtag) ? diff.addtag.filter((x) => typeof x === 'string') : undefined,
  deltag: Array.isArray(diff.deltag) ? diff.deltag.filter((x) => typeof x === 'string') : undefined,
});

const buildFileInfoDiffFile = (file: Partial<FileInfoDiffFile>):FileInfoDiffFile => ({
  type: 'diff',
  id: typeof file.id === 'string' ? file.id : defaultFileInfoDiffFile.id,
  name: typeof file.name === 'string' ? file.name : defaultFileInfoDiffFile.name,
  createdAt: typeof file.createdAt === 'number' ? file.createdAt : defaultFileInfoDiffFile.createdAt,
  version: typeof file.version === 'number' ? file.version : defaultFileInfoDiffFile.version,
  parentId: typeof file.parentId === 'string' ? file.parentId : defaultFileInfoDiffFile.parentId,
  diff: typeof file.diff === 'object' ? buildDiff(file.diff) : defaultFileInfoDiffFile.diff,
});

/**
 * FileInfoのversionを202204081414まで上げる
 * @param x
 * @returns
 */
export const upFile:UpgradeFile = (oldfile, blob) => {
  if (typeof oldfile !== 'object' || !(
    oldfile.type === 'file'
    || oldfile.type === 'folder'
    || oldfile.type === 'diff')
  ) {
    return ({
      fileInfo: blob ? defaultFileInfoFile : defaultFileInfoFolder,
      originalVersion: 202204081414,
    });
  }
  const fileInfo = (
    oldfile.type === 'file'
      ? buildFileInfoFile(oldfile)
      : oldfile.type === 'folder'
        ? buildFileInfoFolder(oldfile)
        : oldfile.type === 'diff'
          ? buildFileInfoDiffFile(oldfile)
          : defaultFileInfoFolder
  );
  return { fileInfo, originalVersion: fileInfo.version };
};
