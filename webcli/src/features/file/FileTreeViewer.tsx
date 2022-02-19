import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { FileState } from './fileSlice'

import StyledTreeItem from '../../components/customed/StyledTreeItem'

import TreeView from '@mui/lab/TreeView'

import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { FileNodeFile, FileNodeFolder, FileTable } from './file.type'
import { Theme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { SystemStyleObject } from '@mui/system/styleFunctionSx'

import { useDrop } from 'react-dnd'

import { genUseDropReturn } from './dnd'
import { changeActiveDir, filedownloadAsync } from './fileSlice'

const FileTreeItemFile = ({ target, onDoubleClick }: {target: FileNodeFile, onDoubleClick: React.MouseEventHandler<HTMLLIElement>}) => {
  return (
    <StyledTreeItem
      key={target.id}
      nodeId={target.id}
      labelText={target.name}
      onDoubleClick={onDoubleClick}
      endIcon={<InsertDriveFileIcon />}
    >
    </StyledTreeItem>
  )
}

const FileTreeItemFolder = ({
  target,
  onSelectFile,
  onSelectFolder
}: {
  target: FileNodeFolder,
  onSelectFile: (id :string) => void,
  onSelectFolder: (id: string) => void
}) => {
  const dispatch = useAppDispatch()

  const [{ canDrop, isOver }, drop] = useDrop(() => genUseDropReturn(target.id , dispatch), [target.id])

  const customStyle = useCallback<((theme: Theme) => SystemStyleObject<Theme>)>((theme) => ({
    boxSizing: 'border-box',
    border: 3,
    borderStyle: 'dashed',
    transitionDuration: '0.2s',
    ...(isOver && canDrop ? { borderColor: theme.palette.info.light } : { borderColor: 'rgba(0,0,0,0)' }),
  }), [isOver, canDrop])

  return (
    <Box
      ref={drop}
      sx={customStyle}
    >
      <StyledTreeItem
        nodeId={target.id}
        labelText={target.name}
        endIcon={<FolderIcon />}
        onClick={(e) => { onSelectFolder(target.id) }}
      >
        {
          target.files.map(c =>
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            <FileTreeItem
              key={c}
              targetId={c}
              onSelectFile={onSelectFile}
              onSelectFolder={onSelectFolder}
            />)
        }
      </StyledTreeItem>
    </Box>
  )
}

function FileTreeItem ({
  targetId,
  onSelectFile,
  onSelectFolder
}: {
  targetId: string,
  onSelectFile: (id :string) => void
  onSelectFolder: (id: string) => void
}) {
  const fileTable = useAppSelector<FileState['fileTable']>((store) => store.file.fileTable)
  const target = fileTable[targetId]
  if (!target || target.type === 'diff') return <></>

  return target.type === 'folder'
    ? <FileTreeItemFolder target={target} onSelectFile={onSelectFile} onSelectFolder={onSelectFolder} />
    : <FileTreeItemFile
        target={target}
        onDoubleClick={(e) => { onSelectFile(targetId) }}
      />
}

export const FileTreeViewer = () => {
  const dispatch = useAppDispatch()

  const onSelectFile = (fileId: string) => dispatch(filedownloadAsync({ fileId }))
  const onSelectFolder = (id: string) => dispatch(changeActiveDir({ id }))

  return (
    <TreeView
      defaultExpandIcon={<FolderIcon />}
      defaultCollapseIcon={<FolderOpenIcon />}
      defaultEndIcon={<InsertDriveFileIcon />}
    >
      <FileTreeItem
        targetId='root'
        onSelectFile= {onSelectFile}
        onSelectFolder= {onSelectFolder}
      />
    </TreeView>
  )
}
