import React, { useEffect, useState } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { renameAsync } from './fileSlice'

import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

export const Renamer = (props: {id: string, name: string}) => {
  const [name, setName] = useState<string>(props.name)
  useEffect(() => {
    setName(props.name)
  }, [props.id])
  const dispatch = useAppDispatch()
  const handleChangeName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await dispatch(renameAsync({ id: props.id, name }))
  }

  return (
    <Box component="form" onSubmit={handleChangeName} noValidate sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        fullWidth
        name="newname"
        label="新規名称"
        type="normal"
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
        変更
      </Button>
    </Box>)
}
