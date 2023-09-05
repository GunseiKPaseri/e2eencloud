import type {
  FileInfoFile,
  FileInfoFolder,
  FileNode,
  FileTable,
} from '~/features/file/file.type';
import { trimExpansion } from '~/features/file/utils';
import { ExhaustiveError } from '~/utils/assert';

type ExportFileType = Omit<FileInfoFile, 'type' | 'parentId' | 'prevId'>;

/**
 * filenodeinfo to export file info
 * @param target FileNode
 * @returns Export File
 */
export const exportFileInfo = (
  target: FileNode<FileInfoFile>,
): ExportFileType =>
  (({ id, name, createdAt, version, sha256, mime, size, tag, expansion }) => ({
    id,
    name,
    createdAt,
    version,
    sha256,
    mime,
    size,
    tag,
    expansion: trimExpansion(expansion),
  }))(target);

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
  name: target.name,
  id: target.id,
  files: target.files
    .map((id) => {
      const t = fileTable[id];
      if (!t || t.type === 'diff') return null;
      if (t.type === 'file') return exportFileInfo(t);
      if (t.type === 'folder') return exportFolderInfo(t, fileTable);
      throw new ExhaustiveError(t);
    })
    .filter((x): x is NonNullable<typeof x> => x !== null),
});
