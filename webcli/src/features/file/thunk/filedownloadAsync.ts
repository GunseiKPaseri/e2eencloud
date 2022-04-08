import { createAsyncThunk, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { FileInfo, FileNode } from '../file.type'
import { decryptAESGCM, getAESGCMKey } from '../../../utils/crypto'
import { RootState } from '../../../app/store'
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice'
import { expandServerData, ExpandServerDataResult, getEncryptedFileRaw, getFileHash, listUpSimilarFile } from '../utils'
import { assertFileNodeFile } from '../filetypeAssert'
import { enqueueSnackbar } from '../../snackbar/snackbarSlice'

import { FileState } from '../fileSlice'

type filedownloadAsyncResult = {fileId: string, local: ExpandServerDataResult}

/**
 * ファイルをダウンロードするThunk
 */
export const filedownloadAsync = createAsyncThunk<filedownloadAsyncResult, {fileId: string}, {state: RootState}>(
  'file/filedownload',
  async ({ fileId }, { getState, dispatch }) => {
    const step = 4
    dispatch(setProgress(progress(0, step)))

    const state = getState()
    const fileObj:FileNode<FileInfo> | undefined = state.file.fileTable[fileId]

    if (!fileObj) throw new Error(`${fileId}は存在しません`)
    if (fileObj.type !== 'file') throw new Error('バイナリファイルが関連付いていない要素です')

    let url = fileObj.blobURL

    if (!url) {
      const { fileKeyBin, encryptedFileIVBin } = fileObj.origin
      dispatch(setProgress(progress(1, step)))
      const fileKey = await getAESGCMKey(Uint8Array.from(fileKeyBin))
      dispatch(setProgress(progress(2, step)))

      const encryptedFile = await getEncryptedFileRaw(fileId)
      const filebin = await decryptAESGCM(encryptedFile, fileKey, Uint8Array.from(encryptedFileIVBin))
      dispatch(setProgress(progress(3, step)))
      const { hashStr } = await getFileHash(filebin)

      if (hashStr !== fileObj.sha256) throw new Error('hashが異なります')
      url = URL.createObjectURL(new Blob([filebin], { type: fileObj.mime }))
      dispatch(enqueueSnackbar({message: `${fileObj.name}を複号しました`, options: {variant: 'success'}}))
    }

    const local = await expandServerData(fileObj, url)

    dispatch(deleteProgress())
    return { fileId, local }
  }
)

export const afterFiledownloadAsyncFullfilled:
  CaseReducer<FileState, PayloadAction<filedownloadAsyncResult>> = (state, action) => {
    // 生成したblobリンク等を反映
    const { fileId, local } = action.payload
    const target = state.fileTable[fileId]
    assertFileNodeFile(target)
    const nextFileNode = {...target,expansion: local.expansion, blobURL: local.blobURL}
    if(local.previewURL) nextFileNode.previewURL = local.previewURL

    const newFileTable = { ...state.fileTable, [fileId]: nextFileNode }

    state.fileTable = newFileTable

    state.activeFile = {
      link: local.blobURL,
      fileId: fileId,
      similarFiles: listUpSimilarFile(nextFileNode, newFileTable)
    }
  }