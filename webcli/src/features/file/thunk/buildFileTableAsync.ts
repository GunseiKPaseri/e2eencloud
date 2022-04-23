import { createAsyncThunk, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { buildFileTableAsyncResult, getfileinfoJSONRow } from '../file.type'
import { axiosWithSession, appLocation } from '../../componentutils'
import { AxiosResponse } from 'axios'
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice'
import { buildFileTable, decryptoFileInfo } from '../utils'
import { assertFileNodeFolder } from '../filetypeAssert'
import { FileState } from '../fileSlice'

/**
 * ファイル情報を解析してディレクトリツリーを構成するReduxThunk
 */
export const buildFileTableAsync = createAsyncThunk<buildFileTableAsyncResult>(
  'file/createfiletree',
  async (_, { dispatch }) => {
    const step = 3
    dispatch(setProgress(progress(0, step)))
    // get all file info
    const rowfiles = await axiosWithSession.get<{}, AxiosResponse<getfileinfoJSONRow[]>>(
      `${appLocation}/api/user/files`,
      {
        onDownloadProgress: (progressEvent) => {
          dispatch(setProgress(progress(0, step, progressEvent.loaded / progressEvent.total)))
        }
      }
    )
    dispatch(setProgress(progress(1, step)))
    const files = await Promise.all(rowfiles.data.map(x => decryptoFileInfo(x)))
    dispatch(setProgress(progress(2, step)))

    // create filetable
    console.log(files)

    const result = buildFileTable(files)
    dispatch(deleteProgress())
    return result
  }
)

export const afterBuildFileTableAsyncFullfilled:
  CaseReducer<FileState, PayloadAction<buildFileTableAsyncResult>> = (state, action) => {
  // 生成したファイルツリーをstateに反映
  state.fileTable = action.payload.fileTable
  state.tagTree = action.payload.tagTree
  assertFileNodeFolder(action.payload.fileTable.root)
  state.activeFileGroup = { type: 'dir', folderId: 'root', files: action.payload.fileTable.root.files, selecting: [], parents: ['root'] }
}