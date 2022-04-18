import { createAsyncThunk, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { 
  FileTable,
  FileInfoFolder,
  FileCryptoInfoWithoutBin,
  FileCryptoInfo
} from '../file.type'
import { RootState } from '../../../app/store'
import {
  genUUID,
  getSafeName,
  submitFileInfoWithEncryption,
  fileSort
} from '../utils'
import {
  assertFileInfoFolder,
  assertWritableDraftFileNodeFolder
} from '../filetypeAssert'
import { FileState } from '../fileSlice'
import { enqueueSnackbar } from '../../snackbar/snackbarSlice'
import { latestVersion } from '../fileinfoMigration/fileinfo'

type createFolderAsyncResult = {uploaded: FileCryptoInfo<FileInfoFolder>, parents: string[]}

/**
 * フォルダを作成するReduxThunk
 */
export const createFolderAsync = createAsyncThunk<createFolderAsyncResult, {name: string}, {state: RootState}>(
  'file/createFolder',
  async ({ name }, { getState, dispatch }) => {
    const state = getState()
    const activeFileGroup = state.file.activeFileGroup
    if (activeFileGroup?.type !== 'dir') throw new Error('ここにアップロードできません')
    if (name === '') throw new Error('空文字は許容されません')
    const [changedFolderName] = getSafeName([name],
      activeFileGroup.files.flatMap(x => (state.file.fileTable[x].type === 'folder' ? [state.file.fileTable[x].name] : []))
    )

    const parent = activeFileGroup.parents.length === 0 ? null : activeFileGroup.parents[activeFileGroup.parents.length - 1]
    const fileInfo: FileInfoFolder = {
      id: genUUID(),
      name: changedFolderName,
      version: latestVersion,
      createdAt: Date.now(),
      type: 'folder',
      parentId: parent
    }
    const addFolder = await submitFileInfoWithEncryption(fileInfo)

    dispatch(enqueueSnackbar({message: `${changedFolderName}ディレクトリを作成しました`, options: {variant: 'success'}}))
    return { uploaded: addFolder, parents: activeFileGroup.parents }
  }
)

export const afterCreateFolderAsyncFullfilled:
  CaseReducer<FileState, PayloadAction<createFolderAsyncResult>> = (state, action) => {
    const { uploaded, parents } = action.payload
    const { fileInfo } = uploaded
    // 作成したフォルダをstateに反映
    const parent:string =
      parents.length === 0
        ? 'root'
        : parents[parents.length - 1]
    // add table
    assertFileInfoFolder(fileInfo)
    const newFileTable:FileTable = {
      [fileInfo.id]: { ...fileInfo, files: [], history: [fileInfo.id], origin: uploaded },
      ...state.fileTable
    }
    // add parent
    const parentNode = state.fileTable[parent]
    assertWritableDraftFileNodeFolder(parentNode)
    const newFiles = [...parentNode.files, fileInfo.id]
    const sortedNewFiles = fileSort(newFiles, newFileTable)
    newFileTable[parent] = { ...parentNode, files: sortedNewFiles }
    // set fileTable
    state.fileTable = { ...newFileTable }
    // add activeGroup
    state.activeFileGroup = { type: 'dir', folderId: parent, files: sortedNewFiles, parents }
  }
