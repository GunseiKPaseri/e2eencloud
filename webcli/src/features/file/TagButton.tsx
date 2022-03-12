import React from 'react'
import Chip from '@mui/material/Chip'
import { useAppDispatch } from '../../app/hooks'
import { changeActiveFileGroupTag } from './fileSlice'

import DeleteIcon from '@mui/icons-material/Delete';

const TAGICON: Record<string, {icon: JSX.Element, text: string}| undefined> = {
  bin: {icon: <DeleteIcon />, text: 'ゴミ箱'}
}

export const TagButton = (props: {tag: string}) => {
  const dispatch = useAppDispatch()
  const handleSelectTag: React.MouseEventHandler<HTMLDivElement> = (e) => {
    dispatch(changeActiveFileGroupTag({ tag: props.tag }))
  }
  const extag = TAGICON[props.tag]
  if(extag){
    return (<Chip sx={{ marginRight: 1 }} label={extag.text} icon={extag.icon} variant='outlined' onClick={handleSelectTag} />)
  }else{
    return (<Chip sx={{ marginRight: 1 }} label={props.tag} variant='outlined' onClick={handleSelectTag} />)
  }
}
