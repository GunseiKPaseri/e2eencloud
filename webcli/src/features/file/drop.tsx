import { ThunkDispatch } from '@reduxjs/toolkit'
import { NativeTypes } from 'react-dnd-html5-backend'
import { useDrop, DropTargetMonitor, DropTargetHookSpec, FactoryOrInstance } from 'react-dnd'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { FileState, fileuploadAsync } from './fileSlice'
import { FileNodeFile, FileNodeFolder, FileTable } from './file.type'

export const genUseDropReturn = (dirId: string | null, dispatch: ReturnType<typeof useAppDispatch>) => {
  return {
    accept: [NativeTypes.FILE],
    drop: (props: {files: File[], items: DataTransferItemList, dataTransfer: DataTransfer}, monitor: DropTargetMonitor) => {
      // avoid deep
      if(!monitor.isOver({shallow: true}) || !dirId) return
      // avoid folder
      if (props.files.length > 0 && props.files.every(x => x.type !== '')) {
        const acceptedFiles = props.files
        dispatch(fileuploadAsync({ files: acceptedFiles, parentId: dirId }))
        console.log(acceptedFiles, dirId)
      }
    },
    canDrop: (props: {files: File[], items: DataTransferItemList, dataTransfer: DataTransfer}, monitor: DropTargetMonitor) => {
      // console.log(monitor.getItem())
      return true
    },
    collect: (monitor: DropTargetMonitor) => {
      return {
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop() && dirId
      }
    }
  }
}
