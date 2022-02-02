import Dexie from 'dexie'

export interface IndexDBFiles{
  id: string,
  name: string,
  sha256: string,
  type: 'file',
  encryptedFileIV: Uint8Array,
  fileKeyRaw: Uint8Array,
  mime: string,
};

class E2EEDB extends Dexie {
  files!: Dexie.Table<IndexDBFiles, string>

  constructor () {
    super('E2EEDB')

    // Define tables and indexes
    this.version(1).stores({
      files: '&id, name, sha256, type, encryptedFileIV, fileKeyRaw, mime'
    })
  }
}

export const db = new E2EEDB()
