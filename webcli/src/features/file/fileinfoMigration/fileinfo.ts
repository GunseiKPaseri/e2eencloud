import type {
  FileDifference,
  ExpansionInfoImage,
  FileInfoFile,
  FileInfoFolder,
  FileInfoDiffFile,
  FileInfo,
  OldFileInfo,
} from './202204081414_create';
import { upFile } from './202204081414_create';

export const latestVersion = 202204081414;

export type {
  FileDifference,
  ExpansionInfoImage,
  FileInfoFile,
  FileInfoFolder,
  FileInfoDiffFile,
  FileInfo,
};

export type FileInfoVersions = OldFileInfo['version'];

export const fileInfoMigrate = (plainFileInfo: string) =>
  upFile(JSON.parse(plainFileInfo) as FileInfo);

export const fileInfoWithBlobMigrate = (fileInfo: FileInfo) => upFile(fileInfo);
