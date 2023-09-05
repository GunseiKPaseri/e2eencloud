import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  FileTable,
  FileInfoFolder,
  FileCryptoInfo,
} from '~/features/file/file.type';
import type { FileState } from '~/features/file/fileSlice';
import { latestVersion } from '~/features/file/fileinfoMigration/fileinfo';
import {
  assertFileInfoFolder,
  assertWritableDraftFileNodeFolder,
} from '~/features/file/filetypeAssert';
import {
  genUUID,
  getSafeName,
  submitFileInfoWithEncryption,
  fileSort,
} from '~/features/file/utils';
import { enqueueSnackbar } from '~/features/snackbar/snackbarSlice';
import type { RootState } from '~/store/store';
import { updateUsageAsync } from './updateUsageAsync';

type CreateFolderAsyncResult = {
  uploaded: FileCryptoInfo<FileInfoFolder>;
  parents: string[];
};

/**
 * フォルダを作成するReduxThunk
 */
export const createFolderAsync = createAsyncThunk<
  CreateFolderAsyncResult,
  { name: string },
  { state: RootState }
>('file/createFolder', async ({ name }, { getState, dispatch }) => {
  const state = getState();
  const { activeFileGroup } = state.file;
  if (activeFileGroup?.type !== 'dir')
    throw new Error('ここにアップロードできません');
  if (name === '') throw new Error('空文字は許容されません');
  const [changedFolderName] = getSafeName(
    [name],
    activeFileGroup.files.flatMap((x) =>
      state.file.fileTable[x].type === 'folder'
        ? [state.file.fileTable[x].name]
        : [],
    ),
  );

  const parent =
    activeFileGroup.parents.length === 0
      ? null
      : activeFileGroup.parents[activeFileGroup.parents.length - 1];
  const fileInfo: FileInfoFolder = {
    id: genUUID(),
    name: changedFolderName,
    version: latestVersion,
    createdAt: Date.now(),
    type: 'folder',
    parentId: parent,
    tag: [],
  };
  const addFolder = await submitFileInfoWithEncryption(fileInfo);

  dispatch(
    enqueueSnackbar({
      message: `${changedFolderName}ディレクトリを作成しました`,
      options: { variant: 'success' },
    }),
  );
  // storage更新
  await dispatch(updateUsageAsync());

  return { uploaded: addFolder, parents: activeFileGroup.parents };
});

export const afterCreateFolderAsyncFullfilled: CaseReducer<
  FileState,
  PayloadAction<CreateFolderAsyncResult>
> = (state, action) => {
  const { uploaded, parents } = action.payload;
  const { fileInfo } = uploaded;
  // 作成したフォルダをstateに反映
  const parent: string =
    parents.length === 0 ? 'root' : parents[parents.length - 1];
  // add table
  assertFileInfoFolder(fileInfo);
  const newFileTable: FileTable = {
    [fileInfo.id]: {
      ...fileInfo,
      files: [],
      history: [fileInfo.id],
      origin: uploaded,
    },
    ...state.fileTable,
  };
  // add parent
  const parentNode = state.fileTable[parent];
  assertWritableDraftFileNodeFolder(parentNode);
  const newFiles = [...parentNode.files, fileInfo.id];
  const sortedNewFiles = fileSort(newFiles, newFileTable);
  newFileTable[parent] = { ...parentNode, files: sortedNewFiles };
  // set fileTable
  state.fileTable = { ...newFileTable };
  // add activeGroup
  state.activeFileGroup = {
    type: 'dir',
    folderId: parent,
    files: sortedNewFiles,
    selecting: [],
    parents,
  };
};
