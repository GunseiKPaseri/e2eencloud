import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAppDispatch } from '../../app/hooks'
import { filedownloadAsync, fileuploadAsync } from './fileSlice'
import { FileTreeViewer } from './fileTreeViewer'
import { Viewer } from './Viewer'
import { AddFolder } from './addFolder'

const style = {
  width: 200,
  height: 150,
  border: '1px dotted #888'
}

export const FileDropZone = () => {
  const dispatch = useAppDispatch()
  // const selector = useAppSelector<FileState>((state) => state.file)

  const [fileId, setFileId] = useState('')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // Do something with the files
      dispatch(fileuploadAsync({ files: acceptedFiles }))
      console.log('acceptedFiles:', acceptedFiles)
    }
  })
  const download = () => {
    dispatch(filedownloadAsync({ fileId }))
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
      <h2>ファイルダウンロード</h2>
      <FileTreeViewer onSelect={(id) => setFileId(id)} />
      <div>
        <input value={fileId} onChange={(e) => setFileId(e.target.value)}/>
        <button type="button" onClick={download}>ダウンロード</button>
        <Viewer />
      </div>
      <h2>フォルダ作成</h2>
      <AddFolder />
    </article>
  )
}
