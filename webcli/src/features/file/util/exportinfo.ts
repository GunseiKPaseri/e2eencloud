import type {
  FileInfoFile,
  FileInfoFolder,
  FileNode,
  FileTable,
} from '~/features/file/file.type';
import { trimExpansion } from '~/features/file/utils';
import { ExhaustiveError } from '~/utils/assert';

type ExportFileType = Omit<FileInfoFile, 'type' | 'parentId' | 'prevId'>;

const trimFileInfo = ({
  createdAt,
  expansion,
  id,
  mime,
  name,
  sha256,
  size,
  tag,
  version,
}: FileInfoFile) => ({
  createdAt,
  expansion,
  id,
  mime,
  name,
  sha256,
  size,
  tag,
  version,
});

/**
 * filenodeinfo to export file info
 * @param target FileNode
 * @returns Export File
 */
export const exportFileInfo = (
  target: FileNode<FileInfoFile>,
): ExportFileType =>
  trimFileInfo({ ...target, expansion: trimExpansion(target.expansion) });

type ExportFolderType = {
  name: string;
  id: string;
  files: (ExportFolderType | ExportFileType)[];
};

/**
 * foldernodeinfo to export folder info
 * @param target Folder Node
 * @param fileTable
 * @returns Export Folder
 */
export const exportFolderInfo = (
  target: FileNode<FileInfoFolder>,
  fileTable: FileTable,
): ExportFolderType => ({
  files: target.files
    .map((id) => {
      const t = fileTable[id];
      if (!t || t.type === 'diff') return null;
      if (t.type === 'file') return exportFileInfo(t);
      if (t.type === 'folder') return exportFolderInfo(t, fileTable);
      throw new ExhaustiveError(t);
    })
    .filter((x): x is NonNullable<typeof x> => x !== null),
  id: target.id,
  name: target.name,
});
