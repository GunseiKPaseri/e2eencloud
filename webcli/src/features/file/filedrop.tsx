import React from 'react'
import { useDropzone } from 'react-dropzone'
import { useAppDispatch } from '../../app/hooks'
import { changeActiveDir, filedownloadAsync, fileuploadAsync } from './fileSlice'
import { FileTreeViewer } from './fileTreeViewer'
import { FileList } from './FileList'
import { Viewer } from './Viewer'
import { AddFolder } from './AddFolder'
import { DiffTree } from './DiffTree'

const style = {
  width: 200,
  height: 150,
  border: '1px dotted #888'
}

export const FileDropZone = () => {
  const dispatch = useAppDispatch()
  // const selector = useAppSelector<FileState>((state) => state.file)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // Do something with the files
      dispatch(fileuploadAsync({ files: acceptedFiles, parentId: 'root' }))
      console.log('acceptedFiles:', acceptedFiles)
    }
  })

  const setFolderId = (id: string) => {
    dispatch(changeActiveDir({ id }))
  }

  return (
    <article>
      <h2>ファイルアップロード</h2>
      <div {...getRootProps()} style={style}>
        <input {...getInputProps()} />
          {
            isDragActive
              ? <p>Drop the files here ...</p>
              : <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
          }
      </div>
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
