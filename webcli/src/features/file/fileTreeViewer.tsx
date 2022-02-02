import React from 'react'
import { useAppSelector } from '../../app/hooks'
import { FileTree } from './fileSlice'

import StyledTreeItem from '../../components/customed/StyledTreeItem'

import TreeView from '@mui/lab/TreeView'

import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

const renderTree = ({ tree, onSelect }: {tree: FileTree, onSelect: (id :string)=>void}) => {
  console.log(tree)
  return tree.map((x) =>
    <StyledTreeItem
      key={x.id}
      nodeId={x.id}
      labelText={x.name}
      labelIcon={x.type === 'folder' ? FolderIcon : InsertDriveFileIcon }
      onClick={(e) => { e.preventDefault(); onSelect(x.id) }}
    >
      {x.type === 'folder'
        ? renderTree({ tree: x.files, onSelect })
        : null}
    </StyledTreeItem>
  )
}

export const FileTreeViewer = ({ onSelect }: {onSelect: (id :string)=>void}) => {
  const filetree = useAppSelector((store) => store.file.filetree)

  return (
    <TreeView>
      {renderTree({ tree: filetree, onSelect })}
    </TreeView>
  )
}
