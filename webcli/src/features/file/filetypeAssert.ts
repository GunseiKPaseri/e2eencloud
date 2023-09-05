import type { WritableDraft } from 'immer/dist/internal';
import type {
  FileInfoFile,
  FileInfoFolder,
  FileInfo,
  FileNode,
  FileInfoDiffFile,
} from './file.type';

/**
 * 要素がFileNode<FileInfoDiffFile>で無いと確信
 * @param fileNode FileNode<FileInfo>
 */
export const assertNonFileNodeDiff: (
  fileNode: FileNode<FileInfo>,
) => asserts fileNode is FileNode<FileInfoFile | FileInfoFolder> = (
  fileNode,
) => {
  if (fileNode.type === 'diff') {
    throw new Error('This is Diff Object!!');
  }
};

/**
 * 要素がFileNode<FileInfoFolder>であると確信
 * @param fileNode FileNode<FileInfo>
 */
export const assertFileNodeFolder: (
  fileNode: FileNode<FileInfo>,
) => asserts fileNode is FileNode<FileInfoFolder> = (fileNode) => {
  if (fileNode.type !== 'folder') {
    throw new Error('This is not Folder Object!!');
  }
};

/**
 * 要素がFileNode<FileInfoFile>であると確信
 * @param fileNode FileNode<FileInfo>
 */
export const assertFileNodeFile: (
  fileNode: FileNode<FileInfo>,
) => asserts fileNode is FileNode<FileInfoFile> = (fileNode) => {
  if (fileNode.type !== 'file') {
    throw new Error('This is not File Object!!');
  }
};

/**
 * 要素がFileNode<FileInfoFile> | undefinedであると確信
 * @param fileNode FileNode<FileInfoFile> | undefined
 */
export const assertFileNodeFileORUndefined: (
  fileNode: FileNode<FileInfo> | undefined,
) => asserts fileNode is FileNode<FileInfoFile> | undefined = (fileNode) => {
  if (fileNode !== undefined && (!fileNode || fileNode.type !== 'file')) {
    throw new Error(
      `${JSON.stringify(fileNode)} is not File Object and undefined!!`,
    );
  }
};

/**
 * 要素がWritableDraft<FFileNode<FileInfoDiffFile>>で無いと確信
 * @param fileNode WritableDraft<FileNode<FileInfo>>
 */
export const assertNonWritableDraftFileNodeDiff: (
  fileNode: WritableDraft<FileNode<FileInfo>>,
) => asserts fileNode is
  | WritableDraft<FileNode<FileInfoFile>>
  | WritableDraft<FileNode<FileInfoFolder>> = (fileNode) => {
  if (fileNode.type === 'diff') {
    throw new Error('This is Diff Object!!');
  }
};

/**
 * 要素がWritableDraft<FileNode<FileInfoFolder>>であると確信
 * @param fileNode WritableDraft<FileNodeFolder>
 */
export const assertWritableDraftFileNodeFolder: (
  fileNode: WritableDraft<FileNode<FileInfo>>,
) => asserts fileNode is WritableDraft<FileNode<FileInfoFolder>> = (
  fileNode,
) => {
  if (fileNode.type !== 'folder') {
    throw new Error('This is not Folder Object!!');
  }
};

/**
 * 要素がFileInfoDiffFileであると確信
 * @param fileInfoDiffFile FileNodeDiffFile
 */
export const assertFileInfoDiffFile: (
  fileInfo: FileInfo,
) => asserts fileInfo is FileInfoDiffFile = (fileInfo) => {
  if (fileInfo.type !== 'diff') {
    throw new Error('This is not Diff Object!!');
  }
};
/**
 * 要素がFileInfoDiffFileであると確信
 * @param fileInfoDiffFile FileNodeDiffFile
 */
export const assertFileInfoFolder: (
  fileInfo: FileInfo,
) => asserts fileInfo is FileInfoFolder = (fileInfo) => {
  if (fileInfo.type !== 'folder') {
    throw new Error('This is not Folder!!');
  }
};
