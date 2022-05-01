import {
  upFile,
  FileDifference,
  ExpansionInfoImage,
  FileInfoFile,
  FileInfoFolder,
  FileInfoDiffFile,
  FileInfoNotFile,
  FileInfo,
  OldFileInfo,
} from './202204081414_create';

export const latestVersion = 202204081414;

export type{
  FileDifference,
  ExpansionInfoImage,
  FileInfoFile,
  FileInfoFolder,
  FileInfoDiffFile,
  FileInfoNotFile,
  FileInfo,
};

export type FileInfoVersions = OldFileInfo['version'];

export const fileInfoMigrate = (plainFileInfo: string) => (
  upFile(JSON.parse(plainFileInfo) as FileInfo)
);

export const fileInfoWithBlobMigrate = (
  fileInfo: FileInfo,
  blob: { blob: Blob, beforeVersion: FileInfoVersions },
) => upFile(fileInfo, blob);
