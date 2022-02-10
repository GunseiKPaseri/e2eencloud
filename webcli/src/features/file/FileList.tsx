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
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { changeActiveDir, filedownloadAsync, FileState, fileuploadAsync } from './fileSlice'
import { assertFileNodeFolder, assertNonFileNodeDiff } from './utils'
import { FileNodeFile, FileNodeFolder } from './file.type'
import { TagButton } from './TagButton'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import { StyledBreadcrumb, StyledBreadcrumbWithMenu } from '../../components/customed/StyledBreadcrumb'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import { Theme } from '@mui/material/styles'
import { SystemStyleObject } from '@mui/system/styleFunctionSx'

import { useDrop, useDrag } from 'react-dnd'
import { genUseDropReturn, genUseDragReturn } from './dnd'

const FileListListFolder = (props: {targetFolder: FileNodeFolder, onSelectFolder: (id: string)=>void}) => {
  const { targetFolder, onSelectFolder } = props

  const dispatch = useAppDispatch()
  
  const [{isDragging}, drag, dragPreview] = useDrag(() => genUseDragReturn(targetFolder.id))

  const [{ canDrop, isOver }, drop] = useDrop(() => genUseDropReturn(targetFolder.id, dispatch), [targetFolder.id])

  const attachRef: ((instance: HTMLDivElement | null) => void) = (el) => {
    drag(el)
    drop(el)
  }

  const customSX = useCallback<((theme: Theme) => SystemStyleObject<Theme>)>((theme) => ({
    boxSizing: 'border-box',
    border: 3,
    borderStyle: 'dashed',
    transitionDuration: '0.2s',
    ...(isOver && canDrop ? { borderColor: theme.palette.info.light } : { borderColor: 'rgba(0,0,0,0)' }),
  }), [isOver, canDrop])

  return (
    <ListItem ref={attachRef} button onDoubleClick={() => onSelectFolder(targetFolder.id)} sx={customSX}>
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
  const [{isDragging}, drag, dragPreview] = useDrag(() => genUseDragReturn(targetFile.id))

  return (
    <div
      ref={drag}>
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
    </div>
  )
}

export const FileList = () => {
  const [viewStyle, setViewStyle] = useState<'list' | 'detaillist'>('list')

  const { fileTable, activeFileGroup } = useAppSelector<FileState>(state => state.file)
  const dispatch = useAppDispatch()

  const onSelectFolder = useCallback((id: string) => {
    dispatch(changeActiveDir({ id }))
  }, [])

  const onSelectFile = useCallback((fileId: string) => {
    dispatch(filedownloadAsync({ fileId }))
  }, [])

  const [{ canDrop, isOver }, drop] = useDrop(
    () =>
      genUseDropReturn(
        activeFileGroup?.type === 'dir'
          ? activeFileGroup.parents[activeFileGroup.parents.length - 1]
          : null,
        dispatch),
    [activeFileGroup]
  )

  const customSX = useCallback<((theme: Theme) => SystemStyleObject<Theme>)>((theme) => ({
    boxSizing: 'border-box',
    border: 3,
    borderStyle: 'dashed',
    transitionDuration: '0.2s',
    ...(isOver && canDrop ? { borderColor: theme.palette.info.light } : { borderColor: 'rgba(0,0,0,0)' }),
  }), [isOver, canDrop])

  return (
    <>
      <ToggleButtonGroup value={viewStyle} exclusive onChange={(e, nextView) => setViewStyle(nextView)}>
        <ToggleButton value='list'><ViewListIcon /></ToggleButton>
        <ToggleButton value='detaillist'><ViewHeadlineIcon /></ToggleButton>
      </ToggleButtonGroup>
      {
        activeFileGroup
          ? <Breadcrumbs maxItems={3} aria-label="パンくずリスト">
              {
                activeFileGroup.type === 'dir'
                  ? [
                    <StyledBreadcrumb key='dir' icon={<FolderIcon fontSize='small' />} label='ディレクトリ' />,
                    ...activeFileGroup.parents.map(x => {
                      const target = fileTable[x]
                      assertFileNodeFolder(target)
                      return (
                      <StyledBreadcrumbWithMenu key={x} label={target.name} onClick={(e) => {
                        dispatch(changeActiveDir({ id: x }))
                      }} menuItems={target.files.filter(x => fileTable[x].type === 'folder').map(x => {
                        const subdir = fileTable[x]
                        assertFileNodeFolder(subdir)
                        return (
                          <MenuItem key={x} onClick={(e) => {
                            dispatch(changeActiveDir({ id: x }))
                          }}>
                            <ListItemIcon>
                              <FolderIcon />
                            </ListItemIcon>
                            <ListItemText>
                              {subdir.name}
                            </ListItemText>
                          </MenuItem>
                        )
                      })}/>
                      )
                    })]
                  : [
                      <StyledBreadcrumb key='tag' icon={<LocalOfferIcon fontSize='small' />} label='タグ' />,
                      <TagButton key='tag_' tag={activeFileGroup.tagName} />
                    ]
              }
          </Breadcrumbs>
          : <></>
      }
      {
        activeFileGroup
          ? viewStyle === 'list'
            ? (
              <List sx={customSX} ref={drop}>
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
            : <div style={{ height: 300, width: '100%' }} ref={drop}>
                <DataGrid sx={customSX}
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
