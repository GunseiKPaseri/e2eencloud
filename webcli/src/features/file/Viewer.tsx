import React from 'react'
import { useAppSelector } from '../../app/hooks'
import { FileNode, FileNodeFile } from './file.type'
import { FileState } from './fileSlice'
import { Renamer } from './Renamer'

/**
 * 要素がFileNodeFile | undefinedであると確信
 * @param fileNode FileNodeFile | undefined
 */
export const assertFileNodeFileORUndefined:
  (fileNode:FileNode | undefined) => asserts fileNode is FileNodeFile | undefined =
  (fileNode) => {
    if ((fileNode !== undefined) && (!fileNode || fileNode.type !== 'file')) {
      throw new Error(`${fileNode} is not File Object and undefined!!`)
    }
  }

export const Viewer = () => {
  const fileState = useAppSelector<FileState>((store) => store.file)
  const activeFile = fileState.activeFile
  const activeNode = activeFile ? fileState.fileTable[activeFile.fileId] : undefined
  assertFileNodeFileORUndefined(activeNode)
  return (<>{
    activeNode && activeFile
      ? <>
          {activeNode.mime.indexOf('image/') === 0 ? <img width='100%' src={activeFile.link} /> : <></>}
          <a href={activeFile.link} download={activeNode.name}>
            {activeNode.name}
          </a>
          <Renamer id={activeNode.id} name={activeNode.name} />
        </>
      : <></>
  }
  </>)
}
