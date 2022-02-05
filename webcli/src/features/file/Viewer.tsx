import React from 'react'
import { useAppSelector } from '../../app/hooks'
import { FileState } from './fileSlice'
import { Renamer } from './Renamer'

export const Viewer = () => {
  const activeFile = useAppSelector<FileState['activeFile']>((store) => store.file.activeFile)

  return (<>
    {
      activeFile
        ? <>
            {activeFile.fileInfo.mime.indexOf('image/') === 0 ? <img width='100%' src={activeFile.link} /> : <></>}
            <a href={activeFile.link} download={activeFile.fileInfo.name}>
              {activeFile.fileInfo.name}
            </a>
            <Renamer id={activeFile.fileInfo.id} name={activeFile.fileInfo.name} />
          </>
        : <></>
    }
  </>)
}
