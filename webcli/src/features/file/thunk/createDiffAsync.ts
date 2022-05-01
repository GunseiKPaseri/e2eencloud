import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { FileCryptoInfo, FileInfoDiffFile } from '../file.type';
import type { RootState } from '../../../app/store';
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';
import {
  submitFileInfoWithEncryption,
  createDiff,
  integrateDifference,
  fileSort,
} from '../utils';
import {
  assertFileInfoDiffFile,
  assertNonWritableDraftFileNodeDiff,
  assertWritableDraftFileNodeFolder,
} from '../filetypeAssert';
import type { FileState } from '../fileSlice';
import { enqueueSnackbar } from '../../snackbar/snackbarSlice';
import { updateUsageAsync } from './updateUsageAsync';

type CreateDiffAsyncResult = { uploaded: FileCryptoInfo<FileInfoDiffFile>, targetId: string };

/**
 *  差分を作成するThunk
 */
export const createDiffAsync = createAsyncThunk<
CreateDiffAsyncResult,
Parameters<typeof createDiff>[0],
{ state: RootState }
>(
  'file/creatediff',
  async (params, { getState, dispatch }) => {
    const step = 2;
    dispatch(setProgress(progress(0, step)));

    const state = getState();
    const { fileTable } = state.file;

    let uploaded: FileInfoDiffFile;
    try {
      uploaded = createDiff(params, fileTable);
    } catch (e) {
      dispatch(deleteProgress());
      if (e instanceof Error) {
        dispatch(enqueueSnackbar({ message: e.message, options: { variant: 'error' } }));
      } else {
        dispatch(enqueueSnackbar({ message: '不明な内部エラー', options: { variant: 'error' } }));
      }
      throw e;
    }

    const addObject = await submitFileInfoWithEncryption(uploaded);
    dispatch(setProgress(progress(1, step)));
    dispatch(deleteProgress());
    // 変更を表示
    if (addObject.fileInfo.diff.addtag && addObject.fileInfo.diff.addtag.length > 0) {
      dispatch(enqueueSnackbar({ message: `『${addObject.fileInfo.diff.addtag.join('』,『')}』タグを追加しました`, options: { variant: 'success' } }));
    }
    if (addObject.fileInfo.diff.deltag && addObject.fileInfo.diff.deltag.length > 0) {
      dispatch(enqueueSnackbar({ message: `『${addObject.fileInfo.diff.deltag.join('』,『')}』タグを削除しました`, options: { variant: 'success' } }));
    }
    if (params.newName) {
      dispatch(enqueueSnackbar({ message: `名称を${params.newName}に変更しました`, options: { variant: 'success' } }));
    }
    if (params.newParentId) {
      dispatch(enqueueSnackbar({ message: 'ファイルを移動しました', options: { variant: 'success' } }));
    }
    // storage更新
    dispatch(updateUsageAsync());

    return { uploaded: addObject, targetId: params.targetId };
  },
);

export const afterCreateDiffAsyncFullfilled:
CaseReducer<FileState, PayloadAction<CreateDiffAsyncResult>> = (state, action) => {
  const { uploaded, targetId } = action.payload;
  const { fileInfo } = uploaded;
  const fileTable = { ...state.fileTable };
  assertFileInfoDiffFile(fileInfo);
  // fileTableを更新
  if (!fileInfo.prevId) throw new Error('前方が指定されていません');
  fileTable[fileInfo.prevId].nextId = fileInfo.id;
  fileTable[fileInfo.id] = { ...fileInfo, parentId: fileInfo.parentId, origin: uploaded };
  // tagTreeを更新
  if (fileInfo.diff.addtag || fileInfo.diff.deltag) {
    const tagTree = { ...state.tagTree };
    if (fileInfo.diff.addtag) {
      fileInfo.diff.addtag.forEach((tag) => {
        tagTree[tag] = [...(tagTree[tag] ?? []), targetId];
      });
    }
    if (fileInfo.diff.deltag) {
      fileInfo.diff.deltag.forEach((tag) => {
        tagTree[tag] = tagTree[tag].filter((x) => x !== targetId);
      });
    }

    state.tagTree = tagTree;

    if (state.activeFileGroup && state.activeFileGroup.type === 'tag') {
      state.activeFileGroup.files = tagTree[state.activeFileGroup.tagName] ?? [];
    }
  }

  // 差分をnodeに反映
  const targetNode = fileTable[targetId];
  assertNonWritableDraftFileNodeDiff(targetNode);
  const copied = integrateDifference([fileInfo.id], fileTable, targetNode);

  // 親が変更された場合これを更新
  const beforeParentId = targetNode.parentId ?? 'root';
  const afterParentId = copied.parentId ?? 'root';
  if (beforeParentId !== afterParentId) {
    const beforeParent = fileTable[beforeParentId];
    assertWritableDraftFileNodeFolder(beforeParent);
    const beforeParentChildren = beforeParent.files.filter((child) => child !== targetId);
    fileTable[beforeParentId] = { ...beforeParent, files: beforeParentChildren };

    const afterParent = fileTable[afterParentId];
    assertWritableDraftFileNodeFolder(afterParent);
    const afterParentChildren = fileSort([...afterParent.files, targetId], fileTable);
    fileTable[afterParentId] = { ...afterParent, files: afterParentChildren };
    if (state.activeFileGroup?.type === 'dir') {
      if (state.activeFileGroup.folderId === afterParentId) {
        state.activeFileGroup = { ...state.activeFileGroup, files: [...afterParentChildren] };
      } else if (state.activeFileGroup.folderId === beforeParentId) {
        state.activeFileGroup = { ...state.activeFileGroup, files: [...beforeParentChildren] };
      }
    }
  }
  // historyの追加
  fileTable[targetId] = { ...copied, history: [fileInfo.id, ...copied.history] };
  // テーブルの更新
  state.fileTable = fileTable;
};
