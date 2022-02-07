import React, { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { FileState, fileuploadAsync } from './fileSlice'

import StyledTreeItem from '../../components/customed/StyledTreeItem'

import TreeView from '@mui/lab/TreeView'

import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { useDropzone } from 'react-dropzone'

const FileTreeItem = ({
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

  const dispatch = useAppDispatch()
  // drop zone option
  const onDrop = useCallback(acceptedFiles => {
    dispatch(fileuploadAsync({ files: acceptedFiles, parentId: t.id }))
    console.log(acceptedFiles, t.id)
  }, [t.id])
  const {
    getRootProps,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({
    noDragEventsBubbling: true,
    noClick: true,
    onDrop
  })
  const rootProps = getRootProps()
  const customStyle = useMemo<Partial<React.CSSProperties>>(() => ({
    ...(isFocused ? { background: '#eeeeee' } : {}),
    ...(isDragAccept ? { background: '#eeffee' } : {}),
    ...(isDragReject ? { background: '#ffeeee' } : {})
  }), [isFocused, isDragAccept, isDragReject])

  return t.type === 'folder'
    ? <div
        {...rootProps}
        style={customStyle}
      >
        <StyledTreeItem
          nodeId={target}
          labelText={t.name}
          endIcon={<FolderIcon />}
          onClick={(e) => { onSelectFolder(target) }}
        >
          {
            t.files.map(c =>
              <FileTreeItem
                key={c}
                fileTable={fileTable}
                target={c}
                onSelectFile={onSelectFile}
                onSelectFolder={onSelectFolder}
              />)
          }
        </StyledTreeItem>
    </div>
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
      <FileTreeItem
        fileTable={fileTable}
        target='root'
        onSelectFile= {onSelectFile}
        onSelectFolder= {onSelectFolder}
      />
    </TreeView>
  )
}
