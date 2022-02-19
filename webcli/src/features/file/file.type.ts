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
  createdAt: number,
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
/*
export type FileCryptoInfoDiff = {
  fileKeyBin: number[],
  fileInfo: FileInfoDiffFile,
}
export type FileCryptoInfoFolder = {
  fileKeyBin: number[],
  fileInfo: FileInfoFolder,
}*/

//export type FileCryptoInfoWithoutBin = FileCryptoInfoDiff | FileCryptoInfoFolder

//export type FileCryptoInfo = FileCryptoInfoWithBin | FileCryptoInfoWithoutBin

export type FileCryptoInfo<T extends FileInfo> = T extends FileInfoNotFile ? FileCryptoInfoWithoutBin<T> : FileCryptoInfoWithBin

/**
 * 手元で管理するファイル情報
 */
// export type FileNodeFile = FileInfoFile & {
//   history: string[], // new => old
//   nextId?: string,
//   blobURL?: string,
//   previewURL?: string,
//   origin: FileCryptoInfoWithBin
// }

// /**
//  * 手元で管理するフォルダ情報
//  */
// export type FileNodeFolder = FileInfoFolder & {
//   history: string[], // new => old
//   nextId?: string,
//   files: string[],
//   origin: FileCryptoInfoFolder
// }

// /**
//  * 手元で管理する差分情報
//  */
// export type FileNodeDiff = FileInfoDiffFile & {
//   nextId?: string,
//   blobURL?: string,
//   origin: FileCryptoInfoDiff
// }

/**
  * 手元で管理する情報
  */
// export type FileNode = FileNodeFile | FileNodeFolder | FileNodeDiff

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

export interface getfileinfoJSONRow {
  id: string,
  encryptedFileIVBase64?: string,
  encryptedFileKeyBase64: string,
  encryptedFileInfoBase64: string,
  encryptedFileInfoIVBase64: string,
  encryptedSize: string;
}

export type buildFileTableAsyncResult = { fileTable: FileTable, tagTree: { [key: string]: string[] } }
