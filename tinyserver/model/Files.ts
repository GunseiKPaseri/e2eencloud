import client from '../dbclient.ts';
import { v4 } from '../deps.ts';
import { User } from './Users.ts';

const validateFileId = (x: string) => x.indexOf('-') === -1 && v4.validate(x.replace(/_/g, '-'));

export class File {
  readonly id: string;
  readonly encrypted_file_iv?: string;
  readonly encrypted_file_key: string;
  readonly encrypted_file_info: string;
  readonly encrypted_file_info_iv: string;
  readonly size: number;
  readonly created_by: User | number;
  constructor(file: {
    id: string;
    encrypted_file_iv?: string;
    encrypted_file_key: string;
    encrypted_file_info: string;
    encrypted_file_info_iv: string;
    size: number;
    created_by: User | number;
  }) {
    this.id = file.id;
    this.encrypted_file_iv = file.encrypted_file_iv;
    this.encrypted_file_info = file.encrypted_file_info;
    this.encrypted_file_info_iv = file.encrypted_file_info_iv;
    this.encrypted_file_key = file.encrypted_file_key;
    this.size = file.size;
    this.created_by = file.created_by;
  }

  async saveFile(file: Uint8Array) {
    await Deno.writeFile(`${Deno.cwd()}/../webcli/dist/bin/${this.id}`, file, {
      append: true,
    });
  }

  toSendObj() {
    return {
      id: this.id,
      encryptedFileIVBase64: this.encrypted_file_iv,
      encryptedFileKeyBase64: this.encrypted_file_key,
      encryptedFileInfoBase64: this.encrypted_file_info,
      encryptedFileInfoIVBase64: this.encrypted_file_info_iv,
      encryptedSize: this.size,
    };
  }
}

export const addFile = async (params: {
  id: string;
  encrypted_file_iv?: string;
  encrypted_file_key: string;
  encrypted_file_info: string;
  encrypted_file_info_iv: string;
  bin?: Uint8Array;
  created_by: User | number;
}) => {
  if (!validateFileId(params.id)) return null;
  try {
    await client.execute(
      `INSERT INTO files(
      id,
      encrypted_file_iv,
      encrypted_file_key,
      encrypted_file_info,
      encrypted_file_info_iv,
      size,
      created_by) values(?, ?, ?, ?, ?, ?, ?)`,
      [
        params.id,
        params.encrypted_file_iv ?? null,
        params.encrypted_file_key,
        params.encrypted_file_info,
        params.encrypted_file_info_iv,
        params.bin?.length ?? 0,
        typeof params.created_by === 'number' ? params.created_by : params.created_by.id,
      ],
    );
    const newfile = new File({ ...params, size: params.bin?.length ?? 0 });
    if (params.bin) await newfile.saveFile(params.bin);
    return newfile;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getFileById = async (id: string) => {
  const files = await client.query(`SELECT * FROM files WHERE id = ?`, [id]);
  if (files.length !== 1) return null;
  return new File(files[0]);
};

export const getFileInfo = async (uid: number) => {
  const files: any[] = await client.query(`SELECT * FROM files WHERE created_by = ?`, [uid]);
  return files.map((x) => new File(x));
};
