import React from 'react'

import { useAppSelector, useAppDispatch } from '../../app/hooks'

import Autocomplete from '@mui/material/Autocomplete'
import { FileState, createDiffAsync } from './fileSlice'
import { assertFileNodeFile } from './utils'
import TextField from '@mui/material/TextField'

export const TagSetter = () => {
  const { activeFile, fileTable, tagTree } = useAppSelector<FileState>(state => state.file)
  const dispatch = useAppDispatch()
  if (!activeFile) return <></>

  const allTags = Object.keys(tagTree)

  const targetNode = fileTable[activeFile.fileId]
  assertFileNodeFile(targetNode)

  return (
    <Autocomplete
      multiple
      id="tags-outlined"
      options={allTags}
      getOptionLabel={(option) => option}
      value={targetNode.tag}
      filterSelectedOptions
      renderInput={(params) => (
        <TextField
          {...params}
          label="タグ"
          placeholder="追加タグ"
        />
      )}
      onChange={(_event, newTags) => {
        dispatch(createDiffAsync({ targetId: targetNode.id, newTags }))
      }}

    />
  )
}
