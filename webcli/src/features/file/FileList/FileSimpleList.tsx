import React, { useCallback, useState } from 'react'

import Avatar from '@mui/material/Avatar'
import List, { ListProps } from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Theme } from '@mui/material/styles'
import { SystemStyleObject } from '@mui/system/styleFunctionSx'

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import FolderIcon from '@mui/icons-material/Folder'
import DeleteIcon from '@mui/icons-material/Delete'

import { useDrop, useDrag, DragPreviewImage } from 'react-dnd'
import { genUseDropReturn, genUseDragReturn } from '../dnd'

import { PngIcon } from '../../../components/PngIcon'

import { useAppSelector, useAppDispatch } from "../../../app/hooks"
import { FileNode, FileInfoFile, FileInfoFolder } from '../file.type'
import { changeActiveFileGroupDir, createDiffAsync, FileState } from '../fileSlice'
import { assertNonFileNodeDiff } from "../filetypeAssert"
import { openContextmenu } from '../../contextmenu/contextmenuSlice'
import { SearchHighLight } from './SearchHighLight'
import { Highlight, SearchQuery } from '../util/search'
import { Badge } from '@mui/material'


const FileListListFolder = (props: {targetFolder: FileNode<FileInfoFolder>, onSelectFolder: (id: string)=>void}) => {
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

const FileListListFile = (props: {targetFile: FileNode<FileInfoFile>, onSelectFile: (id: string)=>void, mark?: Highlight[]}) => {
  const { targetFile, onSelectFile, mark } = props
  const [{isDragging}, drag, dragPreview] = useDrag(() => genUseDragReturn(targetFile.id))
  const dispatch = useAppDispatch()

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    dispatch(openContextmenu({anchor: {left: event.clientX, top: event.clientY}, menu: {type: 'filelistitemfile', targetFile}}))
  }

  return (
    <>
      { targetFile.previewURL ? <DragPreviewImage connect={dragPreview} src={targetFile.previewURL} /> : <></> }
      <div ref={drag}>
        <ListItem button onContextMenu={handleContextMenu} onDoubleClick={() => onSelectFile(targetFile.id)} style={{opacity: isDragging ? 0.5 : 1}}>
          <ListItemAvatar>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right'}}
              invisible={!targetFile.tag.includes('bin')}
              badgeContent={
                <DeleteIcon />
              }
            >
              <Avatar>
                {targetFile.previewURL ? <PngIcon src={targetFile.previewURL} /> : <InsertDriveFileIcon />}
              </Avatar>
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={<SearchHighLight value={targetFile.name} search={mark ? {target: 'name', mark} : undefined} />}
          />
        </ListItem>
      </div>
    </>
  )
}


export const FileSimpleList = (props: ListProps & {nodeRef: ListProps['ref'],onSelectFolder: (id:string) => void, onSelectFile: (id: string) => void}) => {
  const { fileTable, activeFileGroup } = useAppSelector<FileState>(state => state.file)
  const { nodeRef, onSelectFile, onSelectFolder, ...listprops} = props
  return (
      activeFileGroup
      ? <List ref={nodeRef} {...listprops}>
          {
            activeFileGroup.type === 'search'
              ? activeFileGroup.exfiles.map((x) => {
                  const target = fileTable[x[0]]
                  assertNonFileNodeDiff(target)
                  if (target.type === 'folder') {
                    return (<FileListListFolder key={target.id} targetFolder={target} onSelectFolder={onSelectFolder} />)
                  } else {
                    return (<FileListListFile key={target.id} targetFile={target} onSelectFile={onSelectFile} mark={x[1]} />)
                  }
                })
              : activeFileGroup.files.map((x) => {
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
      : <></>
  )
}