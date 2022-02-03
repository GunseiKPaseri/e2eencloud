import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { FileState, createFolderAsync } from './fileSlice'

import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

export const AddFolder = () => {
  const [name, setName] = useState<string>('')
  const dispatch = useAppDispatch()
  const filegroup = useAppSelector<FileState['activeFileGroup']>((state) => state.file.activeFileGroup)
  if (filegroup?.type !== 'dir') return (<></>)
  const handleAddDir = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await dispatch(createFolderAsync({ name }))
  }

  return (
    <Box component="form" onSubmit={handleAddDir} noValidate sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        fullWidth
        name="newname"
        label="新規ファイル名"
        type="normal"
        id="token"
        value={name}
        onChange={(e) => { setName(e.target.value) }}
      />
      <Button
        type="submit"
        disabled={name === ''}
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        作成
      </Button>
    </Box>)
}
