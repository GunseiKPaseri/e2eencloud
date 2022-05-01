import React, { useState } from 'react';

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { type FileState, createFolderAsync } from '../fileSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';

export function AddFolder() {
  const [name, setName] = useState<string>('');
  const dispatch = useAppDispatch();
  const filegroup = useAppSelector<FileState['activeFileGroup']>((state) => state.file.activeFileGroup);
  if (filegroup?.type !== 'dir') return null;
  const handleAddDir = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(createFolderAsync({ name }));
  };

  return (
    <Box component="form" onSubmit={handleAddDir} noValidate sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        fullWidth
        name="newname"
        label="新規ディレクトリ名"
        type="normal"
        value={name}
        onChange={(e) => { setName(e.target.value); }}
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
    </Box>
  );
}

export default AddFolder;
