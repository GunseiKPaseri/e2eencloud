import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  FileCryptoInfoWithBin,
  FileInfo,
  FileNode,
} from '~/features/file/file.type';
import type { FileState } from '~/features/file/fileSlice';
import {
  assertFileNodeFile,
  assertWritableDraftFileNodeFolder,
} from '~/features/file/filetypeAssert';
import type { ExpandServerDataResult } from '~/features/file/utils';
import {
  getSafeName,
  submitFileWithEncryption,
  fileSort,
  listUpSimilarFile,
} from '~/features/file/utils';
import { setProgress, deleteProgress } from '~/features/progress/progressSlice';
import { enqueueSnackbar } from '~/features/snackbar/snackbarSlice';
import type { RootState } from '~/store/store';
import allProgress from '~/utils/allProgress';
import { updateUsageAsync } from './updateUsageAsync';

type FileuploadAsyncResult = {
  uploaded: { server: FileCryptoInfoWithBin; local: ExpandServerDataResult }[];
  parentId: string;
};

/**
 * ファイルをアップロードするReduxThunk
 */
export const fileuploadAsync = createAsyncThunk<
  FileuploadAsyncResult,
  { files: File[]; parentId: string },
  { state: RootState }
>('file/fileupload', async ({ files, parentId }, { getState, dispatch }) => {
  const state = getState();

  const { fileTable } = state.file;

  const parent = fileTable[parentId];
  if (!parent || parent.type !== 'folder') {
    dispatch(
      enqueueSnackbar({
        message: 'ここにアップロードできません',
        options: { variant: 'error' },
      }),
    );
    throw new Error('ここにアップロードできません');
  }
  const changedNameFile = getSafeName(
    files.map((x) => x.name),
    parent.files.flatMap((x) =>
      fileTable[x].type === 'file' ? [fileTable[x].name] : [],
    ),
  );

  let rejectedCnt = 0;
  const loadedfile = await allProgress(
    files.map((x, i) =>
      submitFileWithEncryption(x, changedNameFile[i], parentId),
    ),
    (resolved, rejected, all) => {
      // console.log(new Date(), resolved, rejected, all);
      rejectedCnt = rejected;
      dispatch(
        setProgress({
          progress: (resolved + rejected) / (all + 1),
          progressBuffer: all / (all + 1),
        }),
      );
    },
  );
  // console.log(loadedfile);
  dispatch(deleteProgress());
  if (files.length - rejectedCnt !== 0) {
    dispatch(
      enqueueSnackbar({
        message: `${
          files.length - rejectedCnt
        }件のファイルをアップロードしました`,
        options: { variant: 'success' },
      }),
    );
  }
  if (rejectedCnt !== 0) {
    dispatch(
      enqueueSnackbar({
        message: `${rejectedCnt}件のファイルのアップロードに失敗しました`,
        options: { variant: 'error' },
      }),
    );
  }
  // storage更新
  await dispatch(updateUsageAsync());

  return {
    parentId,
    uploaded: loadedfile.flatMap((x) => (x === null ? [] : [x])),
  };
});

export const afterFileuploadAsyncFullfilled: CaseReducer<
  FileState,
  PayloadAction<FileuploadAsyncResult>
> = (state, action) => {
  // アップロードしたファイルをstateに反映
  const { uploaded, parentId } = action.payload;
  // add table
  const newFileTable = {
    ...state.fileTable,
    ...Object.fromEntries(
      uploaded.map((item) => {
        const { fileInfo, fileKeyBin, encryptedFileIVBin, originalVersion } =
          item.server;
        const { blobURL, previewURL, expansion } = item.local;
        const fileObj: FileNode<FileInfo> = {
          ...fileInfo,
          blobURL,
          expansion,
          history: [fileInfo.id],
          origin: {
            encryptedFileIVBin,
            fileInfo,
            fileKeyBin,
            originalVersion,
          },
          previewURL,
        };
        return [fileInfo.id, fileObj];
      }),
    ),
  };
  const parentNode = newFileTable[parentId];
  assertWritableDraftFileNodeFolder(parentNode);
  parentNode.files = [
    ...parentNode.files,
    ...uploaded.map((x) => x.server.fileInfo.id),
  ];
  // renew activeGroup
  if (
    state.activeFileGroup &&
    state.activeFileGroup.type === 'dir' &&
    state.activeFileGroup.parents.at(-1) ===
      parentId
  ) {
    state.activeFileGroup = {
      ...state.activeFileGroup,
      files: fileSort(
        [
          ...state.activeFileGroup.files,
          ...uploaded.map((x) => x.server.fileInfo.id),
        ],
        newFileTable,
      ),
    };
  }
  state.fileTable = newFileTable;
  if (state.activeFile) {
    const target = newFileTable[state.activeFile.fileId];
    assertFileNodeFile(target);
    state.activeFile = {
      ...state.activeFile,
      similarFiles: listUpSimilarFile(target, newFileTable),
    };
  }
};
