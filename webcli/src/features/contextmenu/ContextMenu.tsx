import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Link from '@mui/material/Link'
import React, { useCallback, useState } from "react"
import { useAppSelector, useAppDispatch } from "../../app/hooks"
import { FileInfoFile, FileNode } from "../file/file.type"
import { changeActiveFileGroupDir, createDiffAsync, filedownloadAsync } from "../file/fileSlice"
import { closeContextmenu } from "./contextmenuSlice"
import { SignalWifiStatusbarNullSharp } from "@mui/icons-material"
import { AnyAction, Dispatch } from "redux"

const ContextMenu: React.FC = () => {
  const menuState = useAppSelector((store) => store.contextmenu.menuState)
  const activeFileGroupType = useAppSelector((state) => state.file.activeFileGroup?.type)

  const dispatch = useAppDispatch()
  const handleClose = () => dispatch(closeContextmenu())

  const result: JSX.Element[] = []

  if(menuState !== null){
    if(menuState.menu.type === 'filelistitemfile'){
      const targetFile = menuState.menu.targetFile
      const isDir = menuState.menu.isDir !== false ? (activeFileGroupType && activeFileGroupType === 'dir') : false
      const handleMenuDecrypto = () => {
        dispatch(filedownloadAsync({ fileId: targetFile.id }))
        dispatch(closeContextmenu())
      }
    
      const handleMenuShowDir = () => {
        if(targetFile.parentId) dispatch(changeActiveFileGroupDir({ id: targetFile.parentId }))
        dispatch(closeContextmenu())
      }
      const handleMenuAddBin = () => {
        dispatch(createDiffAsync({ targetId: targetFile.id, newTags: [...targetFile.tag, 'bin'] }))
        dispatch(closeContextmenu())
      }
      const handleMenuFromBin = () => {
        dispatch(createDiffAsync({ targetId: targetFile.id, newTags: targetFile.tag.filter(x => x!=='bin') }))
        dispatch(closeContextmenu())
      }
    
      if(!isDir) result.push(<MenuItem key='menuShowDir' onClick={handleMenuShowDir}>ファイルの場所を表示</MenuItem>)
    
      if(targetFile.blobURL) result.push(<MenuItem key='menuDownload' component={Link} download={targetFile.name} href={targetFile.blobURL}>ダウンロード</MenuItem>)
      else result.push(<MenuItem key='menuDecrypto' onClick={handleMenuDecrypto}>ファイルを復号して表示</MenuItem>)
    
      if(targetFile.tag.includes('bin')) result.push(<MenuItem key='menuFromBin' onClick={handleMenuFromBin}>ゴミ箱から復元</MenuItem>)
      else result.push(<MenuItem key='menuAddBin' onClick={handleMenuAddBin}>ゴミ箱に追加</MenuItem>)
    }
  }
  console.log(result)

  return (<Menu
    open={!!menuState}
    onClose={handleClose}
    anchorReference="anchorPosition"
    anchorPosition={menuState?.anchor}
  >
    {result}
  </Menu>)
}

export const ContextMenuProvider = (props: {children: React.ReactNode}) => {
  return (<div>
    {props.children}
    <ContextMenu />
  </div>)
}
