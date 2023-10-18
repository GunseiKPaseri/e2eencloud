import type {
  
  
  
  
  
  FileInfo,
  OldFileInfo,
} from './202204081414_create';
import { upFile } from './202204081414_create';

export const latestVersion = 202_204_081_414;



export type FileInfoVersions = OldFileInfo['version'];

export const fileInfoMigrate = (plainFileInfo: string) =>
  upFile(JSON.parse(plainFileInfo) as FileInfo);

export const fileInfoWithBlobMigrate = (fileInfo: FileInfo) => upFile(fileInfo);

export {type FileDifference, type ExpansionInfoImage, type FileInfoFile, type FileInfoFolder, type FileInfoDiffFile, type FileInfo} from './202204081414_create';