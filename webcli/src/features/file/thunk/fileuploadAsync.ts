import { createAsyncThunk, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { FileCryptoInfoWithBin } from '../file.type'
import {
  getSafeName,
  submitFileWithEncryption,
  fileSort
} from '../utils'
import {
  assertWritableDraftFileNodeFolder
} from '../filetypeAssert'
import { allProgress } from '../../../utils/progressPromise'
import { setProgress, deleteProgress } from '../../progress/progressSlice'
import { RootState } from '../../../app/store'
import { FileState } from '../fileSlice'
import { enqueueSnackbar } from '../../snackbar/snackbarSlice'

type fileuploadAsyncResult = {uploaded: FileCryptoInfoWithBin[], parentId: string}

/**
 * ファイルをアップロードするReduxThunk
 */
export const fileuploadAsync = createAsyncThunk<fileuploadAsyncResult, {files: File[], parentId: string}, {state: RootState}>(
    'file/fileupload',
    async ({ files, parentId }, { getState, dispatch }) => {
      const state = getState()
  
      const fileTable = state.file.fileTable
  
      const parent = fileTable[parentId]
      if (!parent || parent.type !== 'folder'){
        dispatch(enqueueSnackbar({message: 'ここにアップロードできません', options: {variant: 'error'}}))
        throw new Error('ここにアップロードできません')
      }
      const changedNameFile = getSafeName(
        files.map(x => x.name),
        parent.files.flatMap(x => (fileTable[x].type === 'file' ? [fileTable[x].name] : []))
      )
  
      const loadedfile = await allProgress(
        files.map((x, i) => submitFileWithEncryption(x, changedNameFile[i], parentId)),
        (resolved, all) => {
          dispatch(setProgress({ progress: resolved / (all + 1), progressBuffer: all / (all + 1) }))
        })
      dispatch(deleteProgress())
      dispatch(enqueueSnackbar({message: `${files.length}件のファイルをアップロードしました`, options: {variant: 'success'}}))
  
      return { uploaded: loadedfile, parentId }
    }
  )

export const afterFileuploadAsyncFullfilled:
  CaseReducer<FileState, PayloadAction<fileuploadAsyncResult>> = (state, action) => {
    // アップロードしたファイルをstateに反映
    const { uploaded, parentId } = action.payload
    // add table
    const newFileTable = {
      ...state.fileTable,
      ...Object.fromEntries(
        uploaded.map(({ fileInfo, fileKeyBin, encryptedFileIVBin }) => ([
          fileInfo.id,
          { ...fileInfo, history: [fileInfo.id], origin: {fileInfo, fileKeyBin, encryptedFileIVBin} }
        ]))
      )
    }
    const parentNode = newFileTable[parentId]
    assertWritableDraftFileNodeFolder(parentNode)
    parentNode.files =
      [
        ...parentNode.files,
        ...uploaded.map(x => x.fileInfo.id)
      ]
    // renew activeGroup
    if (state.activeFileGroup && state.activeFileGroup.type === 'dir' && state.activeFileGroup.parents[state.activeFileGroup.parents.length - 1] === parentId) {
      state.activeFileGroup = { ...state.activeFileGroup, files: fileSort([...state.activeFileGroup.files, ...uploaded.map(x => x.fileInfo.id)], newFileTable) }
    }
    state.fileTable = newFileTable
  }
