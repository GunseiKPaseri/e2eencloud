import { createAsyncThunk, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { FileNode } from '../file.type'
import { decryptAESGCM, getAESGCMKey, getPreview, loadImage } from '../../../util'
import { RootState } from '../../../app/store'
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice'
import { getEncryptedFileRaw, getFileHash, assertFileNodeFile } from '../utils'
import { enqueueSnackbar } from '../../snackbar/snackbarSlice'

import { FileState } from '../fileSlice'

type filedownloadAsyncResult = {url: string, fileId: string, imageData: string|undefined}

/**
 * ファイルをダウンロードするThunk
 */
export const filedownloadAsync = createAsyncThunk<filedownloadAsyncResult, {fileId: string}, {state: RootState}>(
  'file/filedownload',
  async ({ fileId }, { getState, dispatch }) => {
    const step = 4
    dispatch(setProgress(progress(0, step)))

    const state = getState()
    const fileObj:FileNode | undefined = state.file.fileTable[fileId]

    if (!fileObj) throw new Error(`${fileId}は存在しません`)
    if (fileObj.type !== 'file') throw new Error('バイナリファイルが関連付いていない要素です')

    let url = fileObj.blobURL

    if (!url) {
      const { fileKeyBin, encryptedFileIVBin } = fileObj
      dispatch(setProgress(progress(1, step)))
      const fileKey = await getAESGCMKey(Uint8Array.from(fileKeyBin))
      dispatch(setProgress(progress(2, step)))

      const encryptedFile = await getEncryptedFileRaw(fileId)
      const filebin = await decryptAESGCM(encryptedFile, fileKey, Uint8Array.from(encryptedFileIVBin))
      dispatch(setProgress(progress(3, step)))
      const { hashStr } = await getFileHash(filebin)

      if (hashStr !== fileObj.sha256) throw new Error('hashが異なります')
      url = URL.createObjectURL(new Blob([filebin], { type: fileObj.mime }))
    }

    let imageData: string|undefined
    if (!fileObj.previewURL){
      // make preview
      const MAX_SIZE = 150
      if (fileObj.mime.indexOf('image/') === 0) {
        imageData = await getPreview(url, MAX_SIZE, 'image/png')
      }
    }

    dispatch(deleteProgress())
    dispatch(enqueueSnackbar({message: `${fileObj.name}を複号しました`, options: {variant: 'success'}}))
    return { url, fileId, imageData }
  }
)

export const afterFiledownloadAsyncFullfilled:
  CaseReducer<FileState, PayloadAction<filedownloadAsyncResult>> = (state, action) => {
    // 生成したblobリンク等を反映
    const { url, fileId, imageData } = action.payload
    state.activeFile = {
      link: url,
      fileId: fileId
    }
    const target = state.fileTable[fileId]
    assertFileNodeFile(target)
    const nextFileNode = {...target, blobURL: url}
    if(imageData) nextFileNode.previewURL = imageData
    state.fileTable = { ...state.fileTable, [fileId]: nextFileNode }
  }