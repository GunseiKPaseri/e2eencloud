import { createAsyncThunk, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { FileCryptoInfoWithoutBin } from '../file.type'
import { RootState } from '../../../app/store'
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice'
import {
  submitFileInfoWithEncryption,
  createDiff,
  assertFileInfoDiffFile, 
  assertNonWritableDraftFileNodeDiff,
  assertWritableDraftFileNodeFolder,
  integrateDifference,
  fileSort
} from '../utils'
import { FileState } from '../fileSlice'
import { enqueueSnackbar } from '../../snackbar/snackbarSlice'

type createDiffAsyncResult = {uploaded: FileCryptoInfoWithoutBin, targetId: string}

/**
 *  差分を作成するThunk
 */
export const createDiffAsync = createAsyncThunk<createDiffAsyncResult, Parameters<typeof createDiff>[0], {state: RootState}>(
  'file/creatediff',
  async (params, { getState, dispatch }) => {
    const step = 2
    dispatch(setProgress(progress(0, step)))

    const state = getState()
    const fileTable = state.file.fileTable

    let uploaded
    try{
      uploaded = createDiff(params, fileTable)
    } catch (e) {
      dispatch(deleteProgress())
      if(e instanceof Error) {
        dispatch(enqueueSnackbar({message: e.message, options: {variant: 'error'}}))
      } else {
        dispatch(enqueueSnackbar({message: '不明な内部エラー', options: {variant: 'error'}}))
      }
      throw e
    }

    const addObject = await submitFileInfoWithEncryption(uploaded)
    dispatch(setProgress(progress(1, step)))
    dispatch(deleteProgress())
    dispatch(enqueueSnackbar({message: '変更を反映しました', options: {variant: 'success'}}))
    return { uploaded: addObject, targetId: params.targetId }
  }
)

export const afterCreateDiffAsyncFullfilled:
  CaseReducer<FileState, PayloadAction<createDiffAsyncResult>> = (state, action) => {
    const { uploaded, targetId } = action.payload
    const { fileInfo, fileKeyBin } = uploaded
    const fileTable = {...state.fileTable}
    assertFileInfoDiffFile(fileInfo)
    // fileTableを更新
    if (!fileInfo.prevId) throw new Error('前方が指定されていません')
    fileTable[fileInfo.prevId].nextId = fileInfo.id
    fileTable[fileInfo.id] = { ...fileInfo, parentId: fileInfo.parentId, origin: {fileInfo, fileKeyBin} }
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

    // 差分をnodeに反映
    const targetNode = fileTable[targetId]
    assertNonWritableDraftFileNodeDiff(targetNode)
    const copied = integrateDifference([fileInfo.id], fileTable, targetNode)

    // 親が変更された場合これを更新
    const beforeParentId = targetNode.parentId ?? 'root'
    const afterParentId = copied.parentId ?? 'root'
    if (beforeParentId !== afterParentId) {
      const beforeParent = fileTable[beforeParentId]
      assertWritableDraftFileNodeFolder(beforeParent)
      const beforeParentChildren = beforeParent.files.filter(child => child !== targetId)
      fileTable[beforeParentId] = {...beforeParent, files: beforeParentChildren}
      
      const afterParent = fileTable[afterParentId]
      assertWritableDraftFileNodeFolder(afterParent)
      const afterParentChildren = fileSort([...afterParent.files, targetId], fileTable)
      fileTable[afterParentId] = {...afterParent, files: afterParentChildren}
      if(state.activeFileGroup?.type === 'dir'){
        if (state.activeFileGroup.folderId === afterParentId){
          state.activeFileGroup = {...state.activeFileGroup, files: [...afterParentChildren]}
        }else if(state.activeFileGroup.folderId === beforeParentId) {
          state.activeFileGroup = {...state.activeFileGroup, files: [...beforeParentChildren]}
        }
      }
    }
    // historyの追加
    fileTable[targetId] = { ...copied, history: [fileInfo.id, ...copied.history] }
    // テーブルの更新
    state.fileTable = fileTable
  }