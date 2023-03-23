import React, { useEffect, useState } from 'react';

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useAppDispatch } from '~/lib/react-redux';
import { isDiffExt } from '~/features/file/utils';
import { createDiffAsync } from '~/features/file/fileSlice';

function Renamer({ id, name }: { id: string, name: string }) {
  const [newName, setNewName] = useState<string>(name);
  useEffect(() => {
    setNewName(name);
  }, [name]);
  const dispatch = useAppDispatch();
  const handleChangeName: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
