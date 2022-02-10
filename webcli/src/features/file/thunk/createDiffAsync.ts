import { createAsyncThunk, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { FileCryptoInfoWithoutBin } from '../file.type'
import { RootState } from '../../../app/store'
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice'
import {
  submitFileInfoWithEncryption,
  createDiff,
  assertFileInfoDiffFile, 
  assertNonWritableDraftFileNodeDiff,
  integrateDifference
} from '../utils'
import { FileState } from '../fileSlice'

type createDiffAsyncResult = {uploaded: FileCryptoInfoWithoutBin, targetId: string}

/**
 *  ファイル名を変更するReduxThunk
 */
export const createDiffAsync = createAsyncThunk<createDiffAsyncResult, Parameters<typeof createDiff>[0], {state: RootState}>(
  'file/rename',
  async (params, { getState, dispatch }) => {
    const step = 2
    dispatch(setProgress(progress(0, step)))

    const state = getState()
    const fileTable = state.file.fileTable

    const uploaded = createDiff(params, fileTable)

    const addObject = await submitFileInfoWithEncryption(uploaded)
    dispatch(setProgress(progress(1, step)))
    dispatch(deleteProgress())
    return { uploaded: addObject, targetId: params.targetId }
  }
)

export const afterCreateDiffAsyncFullfilled:
  CaseReducer<FileState, PayloadAction<createDiffAsyncResult>> = (state, action) => {
    const { uploaded, targetId } = action.payload
    const { fileInfo, fileKeyBin } = uploaded
    assertFileInfoDiffFile(fileInfo)
    // fileTableを更新
    if (!fileInfo.prevId) throw new Error('前方が指定されていません')
    state.fileTable[fileInfo.prevId].nextId = fileInfo.id
    state.fileTable[fileInfo.id] = { ...fileInfo, parentId: fileInfo.parentId, originalFileInfo: fileInfo, fileKeyBin }
    state.fileTable = { ...state.fileTable }
    // tagTreeを更新
    if (fileInfo.diff.addtag || fileInfo.diff.deltag) {
      for (const tag of fileInfo.diff.addtag ?? []) {
        if (state.tagTree[tag]) {
          state.tagTree[tag].push(targetId)
        } else {
          state.tagTree[tag] = [targetId]
        }
      }
      for (const tag of fileInfo.diff.deltag ?? []) {
        state.tagTree[tag] = state.tagTree[tag].filter(x => x !== targetId)
      }
      state.tagTree = { ...state.tagTree }
    }
    // 差分反映
    const targetNode = state.fileTable[targetId]
    assertNonWritableDraftFileNodeDiff(targetNode)
    integrateDifference([fileInfo.id], state.fileTable, targetNode)
    // historyの追加
    state.fileTable[targetId] = { ...targetNode, history: [fileInfo.id, ...targetNode.history] }
  }