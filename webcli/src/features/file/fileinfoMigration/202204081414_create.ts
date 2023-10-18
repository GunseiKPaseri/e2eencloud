import * as z from 'zod';
import schemaForType from './migrationUtil';

/**
 * 差分情報
 */
export interface FileDifference {
  addtag?: string[];
  deltag?: string[];
}

const schemaFileDifference = schemaForType<FileDifference>()(
  z
    .object({
      addtag: z.string().array(),
      deltag: z.string().array(),
    })
    .partial(),
);

/**
 * サーバに保存するファイルに関する拡張情報
 */
export interface ExpansionInfoImage {
  type: 'img';
  width: number;
  height: number;
  ahash: string;
  dhash: string;
  phash: string;
}

const schemaExpansionInfoImage = schemaForType<ExpansionInfoImage>()(
  z.object({
    ahash: z.string(),
    dhash: z.string(),
    height: z.number(),
    phash: z.string(),
    type: z.literal('img'),
    width: z.number(),
  }),
);

/**
 * サーバDBに保存する共通情報
 */
interface FileInfoCommon {
  id: string;
  name: string;
  createdAt: number;
  version: 202_204_081_414;
  parentId: string | null;
  prevId?: string;
}

const schemaFileInfoCommon = schemaForType<FileInfoCommon>()(
  z.object({
    createdAt: z.number(),
    id: z.string(),
    name: z.string(),
    parentId: z.string().nullable().default(null),
    prevId: z.string().optional(),
    version: z.literal(202_204_081_414),
  }),
);

/**
 *  サーバDBに保存するファイルに関する情報
 */
export interface FileInfoFile extends FileInfoCommon {
  type: 'file';
  sha256: string;
  mime: string;
  size: number;
  tag: string[];
  expansion?: ExpansionInfoImage;
}

const schemaFileInfoFile = schemaForType<FileInfoFile>()(
  z
    .object({
      expansion: schemaExpansionInfoImage,
      mime: z.string(),
      sha256: z.string(),
      size: z.number().min(0),
      tag: z.string().array(),
      type: z.literal('file'),
    })
    .and(schemaFileInfoCommon),
);

/**
 *  サーバDBに保存するフォルダに関する情報
 */
export interface FileInfoFolder extends FileInfoCommon {
  type: 'folder';
  tag: string[];
}

const schemaFileInfoFolder = schemaForType<FileInfoFolder>()(
  z
    .object({
      tag: z.string().array(),
      type: z.literal('folder'),
    })
    .and(schemaFileInfoCommon),
);

/**
 *  サーバDBに保存する差分に関する情報
 */
export interface FileInfoDiffFile extends FileInfoCommon {
  type: 'diff';
  diff: FileDifference;
}

const schemaFileInfoDiffFile = schemaForType<FileInfoDiffFile>()(
  z
    .object({
      diff: schemaFileDifference,
      type: z.literal('diff'),
    })
    .and(schemaFileInfoCommon),
);

/**
 * サーバに保存する情報
 */
export type FileInfo = FileInfoFile | FileInfoFolder | FileInfoDiffFile;

const schemaFileInfo = z.union([
  schemaFileInfoFile,
  schemaFileInfoFolder,
  schemaFileInfoDiffFile,
]);

/**
 * 古いバージョンも含むあらゆるFileInfo
 */
export type OldFileInfo = FileInfo;

type UpgradeFile = (
  oldfile: unknown,
) => { fileInfo: FileInfo; originalVersion: OldFileInfo['version'] } | null;

/**
 * FileInfoがversionとして適切か検証、適切ならば現在のバージョンにmigrate
 * @param x
 * @returns
 */
export const upFile: UpgradeFile = (oldfile) => {
  const t = schemaFileInfo.safeParse(oldfile);
  if (t.success) return { fileInfo: t.data, originalVersion: t.data.version };
  return null;
};
