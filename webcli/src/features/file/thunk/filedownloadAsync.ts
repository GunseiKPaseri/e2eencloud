import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getEncryptedFileRaw } from '~/features/file/api';
import type { FileInfo, FileNode } from '~/features/file/file.type';
import type { FileState } from '~/features/file/fileSlice';
import { assertFileNodeFile } from '~/features/file/filetypeAssert';
import {
  expandServerData,
  getFileHash,
  listUpSimilarFile,
} from '~/features/file/utils';
import type { ExpandServerDataResult } from '~/features/file/utils';
import {
  setProgress,
  deleteProgress,
  progress,
} from '~/features/progress/progressSlice';
import { enqueueSnackbar } from '~/features/snackbar/snackbarSlice';
import type { RootState } from '~/store/store';
import { decryptAESGCM, getAESGCMKey } from '~/utils/crypto';

type FiledownloadAsyncResult = {
  fileId: string;
  local: ExpandServerDataResult;
  active: boolean;
};

/**
 * ファイルをダウンロードするThunk
 */
export const filedownloadAsync = createAsyncThunk<
  FiledownloadAsyncResult,
  { fileId: string; active: boolean },
  { state: RootState }
>('file/filedownload', async ({ fileId, active }, { getState, dispatch }) => {
  const step = 4;
  dispatch(setProgress(progress(0, step)));

  const state = getState();
  const fileObj: FileNode<FileInfo> | undefined = state.file.fileTable[fileId];

  if (!fileObj) throw new Error(`${fileId}は存在しません`);
  if (fileObj.type !== 'file')
    throw new Error('バイナリファイルが関連付いていない要素です');

  let url = fileObj.blobURL;

  if (!url) {
    const { fileKeyBin, encryptedFileIVBin } = fileObj.origin;
    dispatch(setProgress(progress(1, step)));
    const fileKey = await getAESGCMKey(Uint8Array.from(fileKeyBin));
    dispatch(setProgress(progress(2, step)));

    const encryptedFile = await getEncryptedFileRaw(fileId);
    const filebin = await decryptAESGCM(
      encryptedFile,
      fileKey,
      Uint8Array.from(encryptedFileIVBin),
    );
    dispatch(setProgress(progress(3, step)));
    const { hashStr } = await getFileHash(filebin);

    if (hashStr !== fileObj.sha256) throw new Error('hashが異なります');
    url = URL.createObjectURL(new Blob([filebin], { type: fileObj.mime }));
    dispatch(
      enqueueSnackbar({
        message: `${fileObj.name}を複号しました`,
        options: { variant: 'success' },
      }),
    );
  }

  const local = await expandServerData(fileObj, url);

  dispatch(deleteProgress());
  return { active, fileId, local };
});

export const afterFiledownloadAsyncFullfilled: CaseReducer<
  FileState,
  PayloadAction<FiledownloadAsyncResult>
> = (state, action) => {
  // 生成したblobリンク等を反映
  const { fileId, local, active } = action.payload;
  const target = state.fileTable[fileId];
  assertFileNodeFile(target);
  const nextFileNode = {
    ...target,
    blobURL: local.blobURL,
    expansion: target.expansion ?? local.expansion,
  };
  if (local.previewURL) nextFileNode.previewURL = local.previewURL;

  const newFileTable = { ...state.fileTable, [fileId]: nextFileNode };

  state.fileTable = newFileTable;

  if (active) {
    state.activeFile = {
      fileId,
      link: local.blobURL,
      similarFiles: listUpSimilarFile(nextFileNode, newFileTable),
    };
  }
};
