import type {
  FileCryptoInfoWithBin,
  FileCryptoInfoWithoutBin,
  FileDifference,
  FileInfoDiffFile,
  FileInfoFolder,
} from '../file.type';
import { latestVersion } from '../fileinfoMigration/fileinfo';

export const genFileInfoFile = (props: {
  id: string,
  name?: string,
  parentId: string | null,
  fileKeyBin?: number[],
  encryptedFileIVBin?: number[],
  prevId?: string,
  createdAt?: number,
  tag: string[],
}): FileCryptoInfoWithBin => ({
  fileKeyBin: props.fileKeyBin ?? [],
  fileInfo: {
    type: 'file',
    id: props.id,
    name: props.name ?? props.id,
    version: latestVersion,
    createdAt: props.createdAt ?? 0,
    sha256: props.id,
    mime: props.id,
    size: 0,
    parentId: props.parentId,
    prevId: props.prevId,
    tag: props.tag,
  },
  originalVersion: latestVersion,
  encryptedFileIVBin: props.encryptedFileIVBin ?? [],
});

export const genFileInfoFolder = (props: {
  id: string,
  parentId: string | null,
  createdAt?: number,
  prevId?: string,
  fileKeyBin?: number[],
  tag: string[],
}):FileCryptoInfoWithoutBin<FileInfoFolder> => ({
  fileKeyBin: props.fileKeyBin ?? [],
  fileInfo: {
    type: 'folder',
    id: props.id,
    name: props.id,
    version: latestVersion,
    createdAt: props.createdAt ?? 0,
    parentId: props.parentId,
    prevId: props.prevId,
    tag: props.tag,
  },
  originalVersion: latestVersion,
});

export const genFileInfoDiff = (props: {
  id: string,
  name?: string,
  parentId: string | null,
  createdAt?: number,
  prevId?: string,
  diff?: FileDifference,
  fileKeyBin?: number[]
}):FileCryptoInfoWithoutBin<FileInfoDiffFile> => ({
  fileKeyBin: props.fileKeyBin ?? [],
  fileInfo: {
    type: 'diff',
    id: props.id,
    name: props.name ?? props.id,
    version: latestVersion,
    createdAt: props.createdAt ?? 0,
    parentId: props.parentId,
    prevId: props.prevId,
    diff: props.diff ?? {},
  },
  originalVersion: latestVersion,
});
