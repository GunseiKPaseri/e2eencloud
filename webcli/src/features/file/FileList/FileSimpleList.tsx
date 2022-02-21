import React, { useCallback, useState } from 'react'

import Avatar from '@mui/material/Avatar'
import List, { ListProps } from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Theme } from '@mui/material/styles'
import { SystemStyleObject } from '@mui/system/styleFunctionSx'

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import FolderIcon from '@mui/icons-material/Folder'

import { useDrop, useDrag, DragPreviewImage } from 'react-dnd'
import { genUseDropReturn, genUseDragReturn } from '../dnd'

import { PngIcon } from '../../../components/PngIcon'

import { useAppSelector, useAppDispatch } from "../../../app/hooks"
import { FileNode, FileInfoFile, FileInfoFolder } from '../file.type'
import { createDiffAsync, FileState } from '../fileSlice'
import { assertNonFileNodeDiff } from "../filetypeAssert"


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

const FileListListFile = (props: {targetFile: FileNode<FileInfoFile>, onSelectFile: (id: string)=>void}) => {
  const { targetFile, onSelectFile } = props
  const [{isDragging}, drag, dragPreview] = useDrag(() => genUseDragReturn(targetFile.id))
  const [anchorMenuXY, setAnchorMenuXY] = useState<{left: number, top: number}|undefined>(undefined)
  const dispatch = useAppDispatch()

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    setAnchorMenuXY(anchorMenuXY === undefined ? {left: event.clientX, top: event.clientY} : undefined)
  }
  const handleMenuDecrypto = () => {
    onSelectFile(targetFile.id)
    setAnchorMenuXY(undefined)
  }
  const handleClose = () => setAnchorMenuXY(undefined)

  const handleMenuAddBin = () => {
    dispatch(createDiffAsync({ targetId: targetFile.id, newTags: [...targetFile.tag, 'bin'] }))
  }
  const handleMenuFromBin = () => {
    dispatch(createDiffAsync({ targetId: targetFile.id, newTags: targetFile.tag.filter(x => x!=='bin') }))
  }

  return (
    <>
      { targetFile.previewURL ? <DragPreviewImage connect={dragPreview} src={targetFile.previewURL} /> : <></> }
      <div
          ref={drag}>
          <ListItem button onContextMenu={handleContextMenu} onDoubleClick={() => onSelectFile(targetFile.id)} style={{opacity: isDragging ? 0.5 : 1}}>
            <ListItemAvatar>
              <Avatar>
                {targetFile.previewURL ? <PngIcon src={targetFile.previewURL} /> : <InsertDriveFileIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={targetFile.name}
            />
          </ListItem>
          <Menu
            open={anchorMenuXY !== undefined}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={anchorMenuXY}
          >
            {
              targetFile.blobURL
                ? <MenuItem component={Link} download={targetFile.name} href={targetFile.blobURL}>ダウンロード</MenuItem>
                : <MenuItem onClick={handleMenuDecrypto}>ファイルを復号して表示</MenuItem>
            }
            {
              targetFile.tag.includes('bin')
                ? <MenuItem onClick={handleMenuFromBin}>ゴミ箱から復元</MenuItem>
                : <MenuItem onClick={handleMenuAddBin}>ゴミ箱に追加</MenuItem>
            }
          </Menu>
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
      : <></>
  )
}