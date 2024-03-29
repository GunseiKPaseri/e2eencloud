import Dexie from 'dexie';

export interface IndexDBFilesFile {
  type: 'file',
  id: string,
  name: string,
  sha256: string,
  mime: string,
  size: number,
  parentId: string | null,
  prevId?: string,
  tag: string[],
  encryptedFileIV: Uint8Array,
  fileKeyRaw: Uint8Array
}

export interface IndexDBFilesFolder {
  type: 'folder' | 'diff',
  id: string,
  name: string,
  parentId: string | null,
  prevId?: string,
  fileKeyRaw: Uint8Array
}

export type IndexDBFiles = IndexDBFilesFile | IndexDBFilesFolder;

class E2EEDB extends Dexie {
  files!: Dexie.Table<IndexDBFiles, string>;

  constructor() {
    super('E2EEDB');

    // Define tables and indexes
    this.version(1).stores({
      files: '&id, name, sha256, type, encryptedFileIV, fileKeyRaw, mime, size, prevId, parentId, tag',
    });
  }
}

export const db = new E2EEDB();
