import type {
  FileCryptoInfoWithBin,
  FileCryptoInfoWithoutBin,
  FileDifference,
  FileInfoDiffFile,
  FileInfoFolder,
} from '~/features/file/file.type';
import { latestVersion } from '~/features/file/fileinfoMigration/fileinfo';

export const genFileInfoFile = (props: {
  id: string;
  name?: string;
  parentId: string | null;
  fileKeyBin?: number[];
  encryptedFileIVBin?: number[];
  prevId?: string;
  createdAt?: number;
  tag: string[];
}): FileCryptoInfoWithBin => ({
  encryptedFileIVBin: props.encryptedFileIVBin ?? [],
  fileInfo: {
    createdAt: props.createdAt ?? 0,
    id: props.id,
    mime: props.id,
    name: props.name ?? props.id,
    parentId: props.parentId,
    prevId: props.prevId,
    sha256: props.id,
    size: 0,
    tag: props.tag,
    type: 'file',
    version: latestVersion,
  },
  fileKeyBin: props.fileKeyBin ?? [],
  originalVersion: latestVersion,
});

export const genFileInfoFolder = (props: {
  id: string;
  parentId: string | null;
  createdAt?: number;
  prevId?: string;
  fileKeyBin?: number[];
  tag: string[];
}): FileCryptoInfoWithoutBin<FileInfoFolder> => ({
  fileInfo: {
    createdAt: props.createdAt ?? 0,
    id: props.id,
    name: props.id,
    parentId: props.parentId,
    prevId: props.prevId,
    tag: props.tag,
    type: 'folder',
    version: latestVersion,
  },
  fileKeyBin: props.fileKeyBin ?? [],
  originalVersion: latestVersion,
});

export const genFileInfoDiff = (props: {
  id: string;
  name?: string;
  parentId: string | null;
  createdAt?: number;
  prevId?: string;
  diff?: FileDifference;
  fileKeyBin?: number[];
}): FileCryptoInfoWithoutBin<FileInfoDiffFile> => ({
  fileInfo: {
    createdAt: props.createdAt ?? 0,
    diff: props.diff ?? {},
    id: props.id,
    name: props.name ?? props.id,
    parentId: props.parentId,
    prevId: props.prevId,
    type: 'diff',
    version: latestVersion,
  },
  fileKeyBin: props.fileKeyBin ?? [],
  originalVersion: latestVersion,
});
