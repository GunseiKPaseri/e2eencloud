import { Router, Status, z } from 'tinyserver/deps.ts';
import { getUserById } from 'tinyserver/src/model/Users.ts';
import { addFile, deleteFiles, getFileById } from 'tinyserver/src/model/Files.ts';
import { bucket } from 'tinyserver/src/client/s3client.ts';

const router = new Router();

// ADD FILE
interface POSTFilesFormWithBin {
  id: string;
  encryptedFile: Uint8Array;
  encryptedFileIVBase64: string;
  encryptedFileKeyBase64: string;
  encryptedFileInfoBase64: string;
  encryptedFileInfoIVBase64: string;
}
interface POSTFilesFormWithoutBin {
  id: string;
  encryptedFileKeyBase64: string;
  encryptedFileInfoBase64: string;
  encryptedFileInfoIVBase64: string;
}

type POSTFilesForm = POSTFilesFormWithBin | POSTFilesFormWithoutBin;

router.post('/files', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.NoContent;

  // MultipartReader
  const body = ctx.request.body({ type: 'form-data' });
  const reader = await body.value;
  const data = await reader.read({ maxSize: 10000000 });
  let receivedFile:
    | Partial<POSTFilesFormWithBin>
    | Partial<POSTFilesFormWithoutBin> = {};
  const {
    socketid,
    id,
    encryptedFileIVBase64,
    encryptedFileInfoBase64,
    encryptedFileInfoIVBase64,
    encryptedFileKeyBase64,
  } = data.fields;

  receivedFile = {
    id,
    encryptedFileIVBase64,
    encryptedFileInfoBase64,
    encryptedFileInfoIVBase64,
    encryptedFileKeyBase64,
  };

  if (
    socketid === undefined ||
    receivedFile.id === undefined ||
    receivedFile.encryptedFileKeyBase64 === undefined ||
    receivedFile.encryptedFileInfoBase64 === undefined ||
    receivedFile.encryptedFileInfoIVBase64 === undefined
  ) {
    return ctx.throw(Status.BadRequest, 'Bad Request');
  }

  // auth socket id
  if (socketid !== user.leader_socket) {
    return ctx.throw(Status.Forbidden, `Only the Leader has access ${socketid} | ${user.leader_socket}`);
  }

  if (receivedFile.encryptedFileIVBase64) {
    // with bin
    if (!data.files) return ctx.response.status = Status.BadRequest;
    for (const x of data.files) {
      if (x.name === 'encryptedFile' && x.content) {
        receivedFile[x.name] = new Uint8Array(
          x.content.buffer,
          0,
          x.content.buffer.byteLength - 2, // remove CRLF
        );
      }
    }
    if (!receivedFile.encryptedFile) {
      return ctx.response.status = Status.BadRequest;
    }
  }

  // save file
  const x = await addFile({
    id: receivedFile.id,
    encrypted_file_iv: receivedFile.encryptedFileIVBase64,
    encrypted_file_info: receivedFile.encryptedFileInfoBase64,
    encrypted_file_info_iv: receivedFile.encryptedFileInfoIVBase64,
    encrypted_file_key: receivedFile.encryptedFileKeyBase64,
    bin: receivedFile.encryptedFile,
    created_by: user,
  });
  if (x === null) {
    return ctx.response.status = Status.BadRequest;
  }
  console.log(new Date(), 'save ', x?.id);

  return ctx.response.status = Status.NoContent;
});

const POSTDeleteFilesScheme = z.object({
  files: z.string().array(),
});

router.post('/files/delete', async (ctx) => {
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.throw(Status.Unauthorized, 'Unauthorized');

  // verify body
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = POSTDeleteFilesScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }

  const data = parsed.data;
  const deletedTarget = data.files.filter((x) => typeof x === 'string');
  const deleted = await deleteFiles(user, deletedTarget);

  ctx.response.status = Status.OK;
  ctx.response.body = { deleted };
  ctx.response.type = 'json';
});

// GET FILEINFO
router.get('/files/:fileid', async (ctx) => {
  const fileinfo = await getFileById(ctx.params.fileid);
  if (!fileinfo) return ctx.response.status = Status.NotFound;

  ctx.response.status = Status.OK;
  ctx.response.body = fileinfo.toSendObj();
  ctx.response.type = 'json';
});

router.get('/files/:fileid/bin', async (ctx) => {
  const result = await bucket.getObject(ctx.params.fileid);
  if (!result) return ctx.response.status = Status.NotFound;

  ctx.response.status = Status.OK;
  ctx.response.body = result.body;
  ctx.response.type = 'application/octet-stream';
});

export default router;
