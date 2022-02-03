import React from 'react'
import { useAppSelector } from '../../app/hooks'
import { FileState } from './fileSlice'

export const Viewer = () => {
  const fileState = useAppSelector<FileState>((store) => store.file)

  return (<>
    {
      fileState.activeFile
        ? <>
            {fileState.activeFile.fileInfo.mime.indexOf('image/') === 0 ? <img width='100%' src={fileState.activeFile.link} /> : <></>}
            <a href={fileState.activeFile.link} download={fileState.activeFile.fileInfo.name}>
              {fileState.activeFile.fileInfo.name}
            </a>
          </>
        : <></>
    }
  </>)
}
