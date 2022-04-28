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
import Divider from "@mui/material/Divider"

const ContextMenu: React.FC = () => {
  const menuState = useAppSelector((store) => store.contextmenu.menuState)
  const fileState = useAppSelector((state) => state.file)
  const activeFileGroup = fileState.activeFileGroup

  const dispatch = useAppDispatch()
  const handleClose = () => dispatch(closeContextmenu())

  const result: JSX.Element[] = []

  if(menuState !== null){
    if(menuState.menu.type === 'filelistitemfile'){
      const targetFile = menuState.menu.targetFile
      const isDir = menuState.menu.isDir !== false ? (activeFileGroup && activeFileGroup.type === 'dir') : false

      if(menuState.menu.selected && activeFileGroup){
        // (All Item) Add Bin or Restore From Bin
        const handleMenuAllAddBin = () => {
          for(const id of activeFileGroup.selecting){
            const bintarget = fileState.fileTable[id]
            console.log(id, bintarget)
            if(bintarget.type === 'file' && !bintarget.tag.includes('bin')){
              dispatch(createDiffAsync({ targetId: id, newTags: {addtag: ['bin']} }))
            }
          }
          dispatch(closeContextmenu())
        }
        const handleMenuAllRestoreFromBin = () => {
          for(const id of (activeFileGroup ? activeFileGroup.selecting : [])){
            const bintarget = fileState.fileTable[id]
            console.log(id, bintarget)
            if(bintarget.type === 'file' && bintarget.tag.includes('bin')){
              dispatch(createDiffAsync({ targetId: id, newTags: {deltag: ['bin']}}))
            }
          }
          dispatch(closeContextmenu())
        }
        const [haveBinItem, haveNotBinItem] = activeFileGroup.selecting.reduce((acc, value) => {
          const target = fileState.fileTable[value]
          if(target.type !== 'file' || acc[0] && acc[1]) return acc
          if(target.tag.includes('bin')) return [true, acc[1]]
          else return [acc[0], true]
        }, [false, false])
        if (haveNotBinItem) result.push(<MenuItem key='menuAllAddBin' onClick={handleMenuAllAddBin}>すべてゴミ箱に追加</MenuItem>)
        if (haveBinItem) result.push(<MenuItem key='menuAllRestoreFromBin' onClick={handleMenuAllRestoreFromBin}>すべてゴミ箱から復元</MenuItem>)
        result.push(<Divider key='anyfileDivider' />)
      }

      // Show Dir

      const handleMenuShowDir = () => {
        if(targetFile.parentId) dispatch(changeActiveFileGroupDir({ id: targetFile.parentId }))
        dispatch(closeContextmenu())
      }
      if(!isDir) result.push(<MenuItem key='menuShowDir' onClick={handleMenuShowDir}>ファイルの場所を表示</MenuItem>)

      // Show or DL

      const handleMenuDecrypto = () => {
        dispatch(filedownloadAsync({ fileId: targetFile.id }))
        dispatch(closeContextmenu())
      }
      if(targetFile.blobURL) result.push(<MenuItem key='menuDownload' component={Link} download={targetFile.name} href={targetFile.blobURL}>ダウンロード</MenuItem>)
      else result.push(<MenuItem key='menuDecrypto' onClick={handleMenuDecrypto}>ファイルを復号して表示</MenuItem>)
    
      // ADD Bin or Restore From Bin

      const handleMenuAddBin = () => {
        dispatch(createDiffAsync({ targetId: targetFile.id, newTags: [...targetFile.tag, 'bin'] }))
        dispatch(closeContextmenu())
      }
      const handleMenuRestoreFromBin = () => {
        dispatch(createDiffAsync({ targetId: targetFile.id, newTags: targetFile.tag.filter(x => x!=='bin') }))
        dispatch(closeContextmenu())
      }
      if(targetFile.tag.includes('bin')) result.push(<MenuItem key='menuRestoreFromBin' onClick={handleMenuRestoreFromBin}>ゴミ箱から復元</MenuItem>)
      else result.push(<MenuItem key='menuAddBin' onClick={handleMenuAddBin}>ゴミ箱に追加</MenuItem>)
    }
  }

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
