import React, { useCallback, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'

import { DataGrid, GridRenderCellParams, GridRowsProp, jaJP } from '@mui/x-data-grid'

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import FolderIcon from '@mui/icons-material/Folder'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { changeActiveDir, filedownloadAsync, FileState } from './fileSlice'
import { assertNonFileNodeDiff } from './utils'
import { FileNodeFile, FileNodeFolder } from './file.type'
import { TagButton } from './TagButton'

const FileListListFolder = (props: {targetFolder: FileNodeFolder, onSelectFolder: (id: string)=>void}) => {
  const { targetFolder, onSelectFolder } = props
  return (
    <ListItem button onDoubleClick={() => onSelectFolder(props.targetFolder.id)}>
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
    <ListItem button onDoubleClick={() => onSelectFile(targetFile.id)}>
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

export const FileList = () => {
  const [viewStyle, setViewStyle] = useState<'list' | 'detaillist'>('list')

  const dispatch = useAppDispatch()
  const { fileTable, activeFileGroup } = useAppSelector<FileState>(state => state.file)

  const onSelectFolder = useCallback((id: string) => {
    dispatch(changeActiveDir({ id }))
  }, [dispatch])

  const onSelectFile = useCallback((fileId: string) => {
    dispatch(filedownloadAsync({ fileId }))
  }, [dispatch])

  return (
    <>
      <ToggleButtonGroup value={viewStyle} exclusive onChange={(e, nextView) => setViewStyle(nextView)}>
        <ToggleButton value='list'><ViewListIcon /></ToggleButton>
        <ToggleButton value='detaillist'><ViewHeadlineIcon /></ToggleButton>
      </ToggleButtonGroup>
      {
        activeFileGroup
          ? viewStyle === 'list'
            ? (
              <List>
                {
                  activeFileGroup.files.map((x) => {
                    const target = fileTable[x]
                    assertNonFileNodeDiff(target)
                    if (target.type === 'folder') {
                      return (<FileListListFolder key={target.id} targetFolder={target} onSelectFolder={onSelectFolder} />)
                    } else {
                      return (<FileListListFile key={target.id} targetFile={target} onSelectFile={onSelectFile} />)
                    }
                  })
                }
              </List>
              )
            : <div style={{ height: 300, width: '100%' }}>
                <DataGrid
                  localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                  editMode="row"
                  rows={
                    activeFileGroup.files.map<GridRowsProp[number]>(x => {
                      const target = fileTable[x]
                      assertNonFileNodeDiff(target)
                      return target.type === 'folder'
                        ? { id: target.id, name: target.name, mime: '', size: -1, tags: null }
                        : { id: target.id, name: target.name, mime: target.mime, size: target.size, tags: target.tag.join('|||') }
                    })
                  }
                  columns={[
                    { field: 'id', hide: true },
                    { field: 'name', headerName: '名前', width: 200 },
                    { field: 'mime', headerName: 'MIMEタイプ', width: 200 },
                    { field: 'size', headerName: 'ファイルサイズ', type: 'number', width: 200 },
                    {
                      field: 'tags',
                      headerName: 'タグ',
                      width: 600,
                      renderCell: (params: GridRenderCellParams<string>) =>
                        (params.value
                          ? params.value.split('|||').map(x => (<TagButton key={x} tag={x} />))
                          : <></>)
                    }
                  ]} />
              </div>
          : <></>
      }
    </>
  )
}
