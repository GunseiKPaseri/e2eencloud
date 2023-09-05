import * as zip from '@zip.js/zip.js';
import type {
  FileInfoFolder,
  FileNode,
  FileTable,
} from '~/features/file/file.type';
import { assertFileNodeFolder } from '~/features/file/filetypeAssert';
import { filedownloadAsync } from '~/features/file/thunk/filedownloadAsync';
import { getFileChildren } from '~/features/file/utils';
import { store } from '~/store/store';
import { ExhaustiveError } from '~/utils/assert';
import { exportFolderInfo } from './exportinfo';

type Item = {
  blob: Blob;
  name: string;
};

const getDir = (
  root: FileNode<FileInfoFolder>,
  fileTable: FileTable,
  tree: string,
): Promise<Item>[] =>
  root.files
    .map((id): Promise<Item> | Promise<Item>[] => {
      const target = fileTable[id];
      switch (target.type) {
        case 'file':
          return fetch(target.blobURL!).then(async (res) => ({
            blob: await res.blob(),
            name: `${tree}${target.name}`,
          }));
        case 'folder':
          return getDir(target, fileTable, `${tree}${target.name}/`);
        case 'diff':
          return [];
        default:
          throw new ExhaustiveError(target);
      }
    })
    .flat();

const genZipFile = async (
  root: FileNode<FileInfoFolder>,
  fileTable: FileTable,
) => {
  // get all file
  const children = getFileChildren(root, fileTable);
  await Promise.all(
    children.map((id) =>
      store.dispatch(filedownloadAsync({ fileId: id, active: false })),
    ),
  );
  const newFileTable = store.getState().file.fileTable;
  const newRoot = newFileTable[root.id];
  assertFileNodeFolder(newRoot);

  const metadata = exportFolderInfo(newRoot, newFileTable);

  // generate zip
  const blobWriter = new zip.BlobWriter('application/zip');
  const writer = new zip.ZipWriter(blobWriter);

  const files = getDir(newRoot, newFileTable, `${newRoot.name}/`);

  await writer.add(
    `${newRoot.name}.meta.json`,
    new zip.TextReader(JSON.stringify(metadata)),
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const promisefile of files) {
    // eslint-disable-next-line no-await-in-loop
    const file = await promisefile;
    // eslint-disable-next-line no-await-in-loop
    await writer.add(file.name, new zip.BlobReader(file.blob));
  }

  await writer.close();
  return blobWriter.getData();
};

export default genZipFile;
