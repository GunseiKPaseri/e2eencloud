import React from 'react'
import { useAppSelector } from '../../app/hooks'
import { FileState } from './fileSlice'

import StyledTreeItem from '../../components/customed/StyledTreeItem'

import TreeView from '@mui/lab/TreeView'

import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

const FileTree = ({
  fileTable,
  target,
  onSelectFile,
  onSelectFolder
}: {
  fileTable: FileState['fileTable'],
  target: string,
  onSelectFile: (id :string) => void
  onSelectFolder: (id: string) => void
}) => {
  const t = fileTable[target]
  if (!t) return null
  return t.type === 'folder'
    ? <StyledTreeItem
        nodeId={target}
        labelText={t.name}
        endIcon={<FolderIcon />}
        onClick={(e) => { onSelectFolder(target) }}
      >
        {
          t.files.map(c =>
            <FileTree
              key={c}
              fileTable={fileTable}
              target={c}
              onSelectFile={onSelectFile}
              onSelectFolder={onSelectFolder}
            />)
        }
      </StyledTreeItem>
    : <StyledTreeItem
        key={target}
        nodeId={target}
        labelText={t.name}
        endIcon={<InsertDriveFileIcon />}
        onDoubleClick={(e) => { onSelectFile(target) }}
      >
      </StyledTreeItem>
}

export const FileTreeViewer = ({ onSelectFile, onSelectFolder }: {onSelectFile: (id :string)=>void, onSelectFolder: (id :string)=>void}) => {
  const fileTable = useAppSelector<FileState['fileTable']>((store) => store.file.fileTable)

  return (
    <TreeView
      defaultExpandIcon={<FolderIcon />}
      defaultCollapseIcon={<FolderOpenIcon />}
      defaultEndIcon={<InsertDriveFileIcon />}
    >
      <FileTree
        fileTable={fileTable}
        target='root'
        onSelectFile= {onSelectFile}
        onSelectFolder= {onSelectFolder}
      />
    </TreeView>
  )
}
