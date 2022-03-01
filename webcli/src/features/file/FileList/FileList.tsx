import React, { useCallback, useState } from 'react'
import ListItemText from '@mui/material/ListItemText'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'


import FolderIcon from '@mui/icons-material/Folder'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline'
import DeleteIcon from '@mui/icons-material/Delete';

import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { changeActiveDir, createDiffAsync, fileDeleteAsync, filedownloadAsync, FileState, fileuploadAsync } from '../fileSlice'
import { assertFileNodeFolder, assertNonFileNodeDiff } from '../filetypeAssert'
import { FileNode, FileInfoFile, FileInfoFolder } from '../file.type'
import { TagButton } from '../TagButton'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import { StyledBreadcrumb, StyledBreadcrumbWithMenu } from '../../../components/customed/StyledBreadcrumb'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { Theme } from '@mui/material/styles'
import { SystemStyleObject } from '@mui/system/styleFunctionSx'

import { useDrop, useDrag, DragPreviewImage } from 'react-dnd'
import { genUseDropReturn, genUseDragReturn } from '../dnd'
import { FileSimpleList } from './FileSimpleList'
import { FileGrid } from './FileGrid'
import { FileImgList } from './FileImgList'

const DIRBreadcrumb = (props: {target: FileNode<FileInfoFolder>}) => {
  const { target } = props
  const dispatch = useAppDispatch()
  const fileTable = useAppSelector((state) => state.file.fileTable)
  
  const [{ canDrop, isOver }, drop] = useDrop(
    () =>
      genUseDropReturn(
        target.id,
        dispatch),
    [target.id]
  )

  const customSX = useCallback<((theme: Theme) => SystemStyleObject<Theme>)>((theme) => ({
    boxSizing: 'border-box',
    border: 3,
    borderStyle: 'dashed',
    transitionDuration: '0.2s',
    ...(isOver && canDrop ? { borderColor: theme.palette.info.light } : { borderColor: 'rgba(0,0,0,0)' }),
  }), [isOver, canDrop])

  return (
    <StyledBreadcrumbWithMenu innerRef={drop} sx={customSX} label={target.name} onClick={(e) => {
      dispatch(changeActiveDir({ id: target.id }))
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
}

export const FileList = () => {
  const [viewStyle, setViewStyle] = useState<'list' | 'detaillist' | 'pic'>('list')

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

  const handleDeleteClick = () => {
    if(!activeFileGroup) return
    dispatch(fileDeleteAsync({targetIds: activeFileGroup.files}))
  }

  return (
    <>
      <ToggleButtonGroup value={viewStyle} exclusive onChange={(e, nextView) => setViewStyle(nextView)}>
        <ToggleButton value='list'><ViewListIcon /></ToggleButton>
        <ToggleButton value='detaillist'><ViewHeadlineIcon /></ToggleButton>
        <ToggleButton value='pic'><ViewComfyIcon /></ToggleButton>
      </ToggleButtonGroup>
      {
        activeFileGroup && activeFileGroup.type === 'tag' && activeFileGroup.tagName === 'bin'
        ? <Tooltip title='完全削除'><IconButton onClick={handleDeleteClick}><DeleteIcon /></IconButton></Tooltip> : <></>
      }
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
                      return <DIRBreadcrumb key={target.id} target={target} />
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
        viewStyle === 'list'
          ? <FileSimpleList sx={customSX} nodeRef={drop} onSelectFile={onSelectFile} onSelectFolder={onSelectFolder} />
          : viewStyle === 'detaillist'
            ? <FileGrid sx={customSX} nodeRef={drop} onSelectFile={onSelectFile} onSelectFolder={onSelectFolder} />
            : <FileImgList sx={customSX} onSelectFile={onSelectFile} onSelectFolder={onSelectFolder}/>
      }
    </>
  )
}
