import React from 'react'
import Chip from '@mui/material/Chip'
import { useAppDispatch } from '../../app/hooks'
import { changeActiveTag } from './fileSlice'

export const TagButton = (props: {tag: string}) => {
  const dispatch = useAppDispatch()
  const handleSelectTag: React.MouseEventHandler<HTMLDivElement> = (e) => {
    dispatch(changeActiveTag({ tag: props.tag }))
  }
  return (<Chip sx={{ marginRight: 1 }} label={props.tag} variant='outlined' onClick={handleSelectTag} />)
}
