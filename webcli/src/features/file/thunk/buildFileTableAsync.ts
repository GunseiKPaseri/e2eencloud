import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import type { BuildFileTableAsyncResult, GetfileinfoJSONRow } from '../file.type';
import { axiosWithSession } from '../../../lib/axios';
import { appLocation } from '../../../const';
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';
import { buildFileTable, decryptoFileInfo } from '../utils';
import { assertFileNodeFolder } from '../filetypeAssert';
import type { FileState } from '../fileSlice';

/**
 * ファイル情報を解析してディレクトリツリーを構成するReduxThunk
 */
export const buildFileTableAsync = createAsyncThunk<BuildFileTableAsyncResult>(
  'file/createfiletree',
  async (_, { dispatch }) => {
    const step = 3;
    dispatch(setProgress(progress(0, step)));
    // get all file info
    const rowfiles = await axiosWithSession.get<
    Record<string, never>, AxiosResponse<GetfileinfoJSONRow[]>>(
      `${appLocation}/api/my/files`,
      {
        onDownloadProgress: (progressEvent) => {
          dispatch(setProgress(progress(0, step, progressEvent)));
        },
      },
    );
    dispatch(setProgress(progress(1, step)));
    const files = await Promise.all(rowfiles.data.map((x) => decryptoFileInfo(x)));
    dispatch(setProgress(progress(2, step)));

    // create filetable
    // console.log(files);

    const result = buildFileTable(files);
    dispatch(deleteProgress());
    return result;
  },
);

export const afterBuildFileTableAsyncFullfilled:
CaseReducer<FileState, PayloadAction<BuildFileTableAsyncResult>> = (state, action) => {
  // 生成したファイルツリーをstateに反映
  state.fileTable = action.payload.fileTable;
  state.tagTree = action.payload.tagTree;
  const rootOrigin = action.payload.fileTable.root;
  assertFileNodeFolder(rootOrigin);
  state.activeFileGroup = {
    type: 'dir', folderId: 'root', files: rootOrigin.files, selecting: [], parents: ['root'],
  };
};
