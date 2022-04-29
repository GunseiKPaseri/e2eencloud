import client from '../dbclient.ts';
import { Query, v4, Where } from '../deps.ts';
import { bucket } from '../s3client.ts';
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
    encrypted_file_iv?: string | null;
    encrypted_file_key: string;
    encrypted_file_info: string;
    encrypted_file_info_iv: string;
    size: number;
    created_by: User | number;
  }) {
    this.id = file.id;
    this.encrypted_file_iv = file.encrypted_file_iv ?? undefined;
    this.encrypted_file_info = file.encrypted_file_info;
    this.encrypted_file_info_iv = file.encrypted_file_info_iv;
    this.encrypted_file_key = file.encrypted_file_key;
    this.size = file.size;
    this.created_by = file.created_by;
  }

  async saveFile(file: Uint8Array) {
    await bucket.putObject(this.id, file);
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
  created_by: User;
}) => {
  if (!validateFileId(params.id)) return null;
  try {
    if (
      params.created_by.file_usage + (params.bin?.length ?? 0) + params.encrypted_file_info.length >
        params.created_by.max_capacity
    ) {
      return null;
    }

    const patchUserResult = params.created_by.patchUsage((params.bin?.length ?? 0) + params.encrypted_file_info.length);
    if (patchUserResult === null) return null;

    await client.execute(
      `INSERT INTO files(
        id,
        encrypted_file_iv,
        encrypted_file_key,
        encrypted_file_info,
        encrypted_file_info_iv,
        size,
        created_by) VALUES(?, ?, ?, ?, ?, ?, ?)`,
      [
        params.id,
        params.encrypted_file_iv ?? null,
        params.encrypted_file_key,
        params.encrypted_file_info,
        params.encrypted_file_info_iv,
        params.bin?.length ?? 0,
        params.created_by.id,
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

interface ResultSelectFromFile {
  id: string;
  encrypted_file_iv: string | null;
  encrypted_file_key: string;
  encrypted_file_info: string;
  encrypted_file_info_iv: string;
  size: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export const getFileInfo = async (uid: number) => {
  const files: ResultSelectFromFile[] = await client.query(`SELECT * FROM files WHERE created_by = ?`, [uid]);
  return files.map((x) => new File(x));
};

export const deleteFiles = async (user: User, fileIDs: string[]) => {
  const targetFileIDs = fileIDs.filter((id) => v4.validate(id.replaceAll('_', '-')));

  const selectQuery = (new Query())
    .table('files')
    .where(Where.field('id').in(targetFileIDs))
    .where(Where.field('created_by').eq(user.id))
    .select('id')
    .build();
  const result: { id: string }[] = await client.query(selectQuery.trim());

  const files = result.map((x) => x.id);

  const [sumResult]: [{ 'SUM(LENGTH(encrypted_file_info))+SUM(size)': number }] = await client.query(
    `SELECT SUM(LENGTH(encrypted_file_info))+SUM(size) FROM files WHERE id in ? AND created_by = ?`,
    [files, user.id],
  );
  const deletedItemSize = sumResult['SUM(LENGTH(encrypted_file_info))+SUM(size)'];

  const fileDeleteSql = (new Query())
    .table('files')
    .where(Where.field('id').in(files))
    .delete()
    .build();
  await client.execute(fileDeleteSql.trim());

  // DeleteFile
  // 存在しないファイルは無視
  await Promise.all(
    files
      .map((id) =>
        bucket.deleteObject(id).catch(() => {
          console.log(id, 'can\'t delete');
          return Promise.resolve();
        })
      ),
  );

  await user.patchUsage(-deletedItemSize);

  return files;
};
