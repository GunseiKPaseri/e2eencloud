import React from 'react'
import { useAppSelector } from '../../app/hooks'
import { FileState } from './fileSlice'

import StyledTreeItem from '../../components/customed/StyledTreeItem'

import TreeView from '@mui/lab/TreeView'

import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

const FileTree = ({ fileTable, target, onSelect }: {fileTable: FileState['fileTable'], target: string, onSelect: (id :string)=>void}) => {
  const t = fileTable[target]
  if (!t) return null
  return t.type === 'folder'
    ? <StyledTreeItem
        nodeId={target}
        labelText={t.name}
        labelIcon={FolderIcon}
      >
        {t.files.map(c => <FileTree key={c} fileTable={fileTable} target={c} onSelect= {onSelect} />)}
      </StyledTreeItem>
    : <StyledTreeItem
        key={target}
        nodeId={target}
        labelText={t.name}
        labelIcon={InsertDriveFileIcon}
        onClick={(e) => { e.preventDefault(); onSelect(target) }}
      >
      </StyledTreeItem>
}

export const FileTreeViewer = ({ onSelect }: {onSelect: (id :string)=>void}) => {
  const fileTable = useAppSelector<FileState['fileTable']>((store) => store.file.fileTable)

  return (
    <TreeView>
      <FileTree fileTable={fileTable} target='root' onSelect= {onSelect} />
    </TreeView>
  )
}
