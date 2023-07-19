import { v4, z } from 'tinyserver/deps.ts';
import { type DBFiles, prisma } from 'tinyserver/src/client/dbclient.ts';
import { bucket } from 'tinyserver/src/client/s3client.ts';
import { User } from './Users.ts';

const validateFileId = (x: string) => x.indexOf('-') === -1 && v4.validate(x.replace(/_/g, '-'));

const encryptionDataSchema = z.object({
  iv: z.union([z.string(), z.null()]).optional(),
  key: z.string(),
  info_key: z.string(),
  info_iv: z.string(),
});

type EncryptionData = z.infer<typeof encryptionDataSchema>;

export class File {
  readonly id: string;
  readonly encryption_data: EncryptionData;
  readonly size: bigint;
  readonly created_by: User | string;
  constructor(file: {
    id: string;
    encryption_data: EncryptionData | string;
    size: bigint | number;
    created_by: User | string;
  }) {
    this.id = file.id;
    this.encryption_data = typeof file.encryption_data === 'string'
      ? encryptionDataSchema.parse(JSON.parse(file.encryption_data))
      : file.encryption_data;
    this.size = BigInt(file.size);
    this.created_by = file.created_by;
  }

  async saveFile(file: Uint8Array) {
    await bucket.putObject(this.id, file);
  }

  toSendObj() {
    return {
      id: this.id,
      encryptedFileIVBase64: this.encryption_data.iv,
      encryptedFileKeyBase64: this.encryption_data.key,
      encryptedFileInfoBase64: this.encryption_data.info_key,
      encryptedFileInfoIVBase64: this.encryption_data.info_iv,
      encryptedSize: this.size.toString(),
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
    const encryption_data = JSON.stringify({
      iv: params.encrypted_file_iv ?? null,
      key: params.encrypted_file_key,
      info_iv: params.encrypted_file_info_iv,
      info_key: params.encrypted_file_info,
    });
    const size = BigInt(params.bin?.length ?? 0 + encryption_data.length);

    if (
      params.created_by.file_usage + Number(size) > params.created_by.max_capacity
    ) {
      return null;
    }

    const patchUserResult = await params.created_by.patchUsage(size);
    if (patchUserResult === null) return null;

    const data = {
      id: params.id,
      size: Number(size),
      created_by: params.created_by.id,
      encryption_data: encryption_data,
    };
    const created = await prisma.files.create({ data });

    const newfile = new File(created);
    if (params.bin) await newfile.saveFile(params.bin);
    return newfile;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getFileById = async (id: string) => {
  const files = await prisma.files.findUnique({
    select: {
      id: true,
      encryption_data: true,
      size: true,
      created_at: true,
      created_by: true,
      updated_at: true,
    },
    where: { id },
  });
  return files === null ? null : new File(files);
};

export const getFileInfo = async (uid: string) => {
  const files: DBFiles[] = await prisma.files.findMany({
    select: {
      id: true,
      encryption_data: true,
      size: true,
      created_at: true,
      created_by: true,
      updated_at: true,
    },
    where: {
      created_by: uid,
    },
  });
  return files.map((x) => new File(x));
};

export const deleteFiles = async (user: User, fileIDs: string[]) => {
  const targetFileIDs = fileIDs.filter((id) => v4.validate(id.replaceAll('_', '-')));

  const trueTargetFileIDs = (await prisma.files.findMany({
    select: {
      id: true,
    },
    where: {
      id: {
        in: targetFileIDs,
      },
      created_by: user.id,
    },
  })).map((file) => file.id);

  const newSize = (await prisma.files.aggregate({
    where: {
      id: {
        in: trueTargetFileIDs,
      },
    },
    _sum: {
      size: true,
    },
  }))._sum.size ?? 0n;

  const result = await prisma.files.deleteMany({
    where: {
      id: {
        in: trueTargetFileIDs,
      },
      created_by: user.id,
    },
  });

  // DeleteFile
  // 存在しないファイルは無視
  await Promise.all(
    trueTargetFileIDs
      .map((id) =>
        bucket.deleteObject(id).catch(() => {
          console.log(id, 'can\'t delete');
          return Promise.resolve();
        })
      ),
  );

  // [TODO sizeをrelationで連動させる]
  await user.patchUsage(newSize);

  return result.count;
};
