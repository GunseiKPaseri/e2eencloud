import { createAsyncThunk, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { buildFileTableAsyncResult, FileCryptoInfoWithBin } from '../file.type'
import {
  getSafeName,
  submitFileWithEncryption,
  assertWritableDraftFileNodeFolder,
  fileSort,
  getAllDependentFile,
  buildFileTable,
  assertFileNodeFolder
} from '../utils'
import { allProgress } from '../../../util'
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice'
import { RootState } from '../../../app/store'
import { FileState } from '../fileSlice'
import { enqueueSnackbar } from '../../snackbar/snackbarSlice'
import { appLocation, axiosWithSession } from '../../../features/componentutils'
import { AxiosResponse } from 'axios'

/**
 * ファイルを完全削除するReduxThunk
 */
export const fileDeleteAsync = createAsyncThunk<buildFileTableAsyncResult, {targetIds: string[]}, {state: RootState}>(
    'file/filedelete',
    async ({ targetIds }, { getState, dispatch }) => {
      const step = 1
      const state = getState()
      dispatch(setProgress(progress(0, step)))
  
      const fileTable = state.file.fileTable
  
      const deleteItems = targetIds.map(targetId => getAllDependentFile(fileTable[targetId], fileTable)).flat()

      // get all file info
      const rowfiles = await axiosWithSession.post<{files: string[]}, AxiosResponse<{deleted: string[]}>>(
        `${appLocation}/api/files/delete`,
        {files: deleteItems},
        {
          onDownloadProgress: (progressEvent) => {
            dispatch(setProgress(progress(0, step, progressEvent.loaded / progressEvent.total)))
          }
        }
      )

      console.log(rowfiles)
      const deleteItemsSet = new Set(rowfiles.data.deleted)
      const result = buildFileTable(
        Object
          .values(fileTable)
          .filter(x => !deleteItemsSet.has(x.id))
          .map(x => ({...x.origin}))
      )
      dispatch(deleteProgress())
      const itemsize = targetIds.filter(id => deleteItemsSet.has(id)).length
      dispatch(enqueueSnackbar({message: `${itemsize}件のファイルを完全に削除しました`, options: {variant: 'success'}}))

      return result
    }
  )

export const afterFileDeleteAsyncFullfilled:
  CaseReducer<FileState, PayloadAction<buildFileTableAsyncResult>> = (state, action) => {
    // 生成したファイルツリーをstateに反映
    state.fileTable = action.payload.fileTable
    state.tagTree = action.payload.tagTree
    assertFileNodeFolder(action.payload.fileTable.root)
    state.activeFile = null
    state.activeFileGroup = { type: 'dir', folderId: 'root', files: action.payload.fileTable.root.files, parents: ['root'] }
  }
