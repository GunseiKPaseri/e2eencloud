import React from 'react'
import { useDropzone } from 'react-dropzone'
import { useAppDispatch } from '../../app/hooks'
import { changeActiveDir, filedownloadAsync, fileuploadAsync } from './fileSlice'
import { FileTreeViewer } from './fileTreeViewer'
import { FileList } from './FileList'
import { Viewer } from './Viewer'
import { AddFolder } from './AddFolder'
import { DiffTree } from './DiffTree'

export const FileDropZone = () => {
  const dispatch = useAppDispatch()

  const setFolderId = (id: string) => {
    dispatch(changeActiveDir({ id }))
  }

  return (
    <article>
      <h2>ファイルツリー</h2>
      <FileTreeViewer onSelectFile={(fileId) => dispatch(filedownloadAsync({ fileId }))} onSelectFolder={(id) => setFolderId(id)} />
      <h2>ファイルリスト</h2>
      <FileList />
      <h2>フォルダ作成</h2>
      <AddFolder />
      <h2>ファイルビュー</h2>
      <Viewer />
      <h2>ファイルヒストリー</h2>
      <DiffTree />
    </article>
  )
}
