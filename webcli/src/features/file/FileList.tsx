import React, { useCallback, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import FolderIcon from '@mui/icons-material/Folder'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { changeActiveDir, filedownloadAsync, FileState } from './fileSlice'
import { assertNonFileNodeDiff } from './utils'
import { FileNodeFile, FileNodeFolder } from './file.type'

const FileListListFolder = (props: {targetFolder: FileNodeFolder, onSelectFolder: (id: string)=>void}) => {
  const { targetFolder, onSelectFolder } = props
  return (
    <ListItem onDoubleClick={() => onSelectFolder(props.targetFolder.id)} style={{ cursor: 'pointer' }}>
      <ListItemAvatar>
        <Avatar>
          <FolderIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={targetFolder.name}
      />
    </ListItem>
  )
}

const FileListListFile = (props: {targetFile: FileNodeFile, onSelectFile: (id: string)=>void}) => {
  const { targetFile, onSelectFile } = props
  return (
    <ListItem onDoubleClick={() => onSelectFile(targetFile.id)} style={{ cursor: 'pointer' }}>
      <ListItemAvatar>
        <Avatar>
          <InsertDriveFileIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={targetFile.name}
      />
    </ListItem>
  )
}

const FileListList = () => {
  const dispatch = useAppDispatch()
  const fileState = useAppSelector<FileState>(state => state.file)

  const onSelectFolder = useCallback((id: string) => {
    dispatch(changeActiveDir({ id }))
  }, [dispatch])

  const onSelectFile = useCallback((fileId: string) => {
    dispatch(filedownloadAsync({ fileId }))
  }, [dispatch])

  return (
    <List>
      {
        fileState.activeFileGroup
          ? fileState.activeFileGroup.files.map((x) => {
            const target = fileState.fileTable[x]
            assertNonFileNodeDiff(target)
            if (target.type === 'folder') {
              return (<FileListListFolder key={target.id} targetFolder={target} onSelectFolder={onSelectFolder} />)
            } else {
              return (<FileListListFile key={target.id} targetFile={target} onSelectFile={onSelectFile} />)
            }
          })
          : <></>
      }
    </List>
  )
}

export const FileList = () => {
  const [viewStyle, setViewStyle] = useState<'list' | 'detaillist'>('list')

  return (
    <>
      <ToggleButtonGroup value={viewStyle} exclusive onChange={(e, nextView) => setViewStyle(nextView)}>
        <ToggleButton value='list'><ViewListIcon /></ToggleButton>
        <ToggleButton value='detaillist'><ViewHeadlineIcon /></ToggleButton>
      </ToggleButtonGroup>
      {viewStyle === 'list' ? <FileListList /> : <></>}
    </>
  )
}
