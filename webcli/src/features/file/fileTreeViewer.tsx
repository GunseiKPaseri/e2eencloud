import React, { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { FileState, fileuploadAsync } from './fileSlice'

import StyledTreeItem from '../../components/customed/StyledTreeItem'

import TreeView from '@mui/lab/TreeView'

import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { useDropzone } from 'react-dropzone'
import { FileNodeFile, FileNodeFolder, FileTable } from './file.type'

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
  fileTable,
  onSelectFile,
  onSelectFolder
}: {
  target: FileNodeFolder,
  fileTable: FileTable,
  onSelectFile: (id :string) => void,
  onSelectFolder: (id: string) => void
}) => {
  const dispatch = useAppDispatch()
  // drop zone option
  const onDrop = useCallback(acceptedFiles => {
    dispatch(fileuploadAsync({ files: acceptedFiles, parentId: target.id }))
    console.log(acceptedFiles, target.id)
  }, [target.id])
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

  return (
    <div
      {...rootProps}
      style={customStyle}
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
              fileTable={fileTable}
              targetId={c}
              onSelectFile={onSelectFile}
              onSelectFolder={onSelectFolder}
            />)
        }
      </StyledTreeItem>
    </div>
  )
}

function FileTreeItem ({
  fileTable,
  targetId,
  onSelectFile,
  onSelectFolder
}: {
  fileTable: FileState['fileTable'],
  targetId: string,
  onSelectFile: (id :string) => void
  onSelectFolder: (id: string) => void
}) {
  const target = fileTable[targetId]
  if (!target || target.type === 'diff') return <></>

  return target.type === 'folder'
    ? <FileTreeItemFolder target={target} fileTable={fileTable} onSelectFile={onSelectFile} onSelectFolder={onSelectFolder} />
    : <FileTreeItemFile
        target={target}
        onDoubleClick={(e) => { onSelectFile(targetId) }}
      />
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
        targetId='root'
        onSelectFile= {onSelectFile}
        onSelectFolder= {onSelectFolder}
      />
    </TreeView>
  )
}
