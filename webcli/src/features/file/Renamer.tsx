import React, { useEffect, useState } from 'react';

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { createDiffAsync } from './fileSlice';
import { useAppDispatch } from '../../app/hooks';
import { isDiffExt } from './utils';

function Renamer({ id, name }: { id: string, name: string }) {
  const [newName, setNewName] = useState<string>(name);
  useEffect(() => {
    setNewName(name);
  }, [name]);
  const dispatch = useAppDispatch();
  const handleChangeName: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    dispatch(createDiffAsync({ targetId: id, newName }));
  };

  return (
    <Box component="form" onSubmit={handleChangeName} noValidate sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        fullWidth
        name="newname"
        label="新規名称"
        type="normal"
        value={newName}
        onChange={(e) => { setNewName(e.target.value); }}
      />
      {
        isDiffExt(name, newName)
          && (
            <Alert severity="warning">
              拡張子が変化しています
            </Alert>
          )
      }
      <Button
        type="submit"
        disabled={newName === '' || newName === name}
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        変更
      </Button>
    </Box>
  );
}

export default Renamer;
