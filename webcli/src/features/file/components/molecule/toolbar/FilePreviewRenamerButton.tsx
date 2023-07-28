import { useEffect, useId, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';

import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import EditIcon from '@mui/icons-material/Edit';

import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { type FileState, createDiffAsync } from '~/features/file/fileSlice';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import StyledToggleButtonGroup from '~/components/atom/StyledToggleButtonGroup';
import { isDiffExt } from '~/features/file/utils';
import Alert from '@mui/material/Alert';

function FilePreviewRenamerDialog({id, name, open, onClose}: {
  id: string;
  name: string;
  open: boolean;
  onClose: ()=>void;
}) {
  const addFolderDialogId = useId()

  const [newName, setNewName] = useState<string>(name);
  useEffect(() => {
    setNewName(name);
  }, [name]);

  const dispatch = useAppDispatch();
  const filegroup = useAppSelector<FileState['activeFileGroup']>((state) => state.file.activeFileGroup);
  if (filegroup?.type !== 'dir') return null;
  const handleRename = async () => {
    await dispatch(createDiffAsync({ targetId: id, newName }));
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={addFolderDialogId}
    >
      <DialogTitle id={addFolderDialogId}>ファイル名を変更</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          name="newname"
          label="新規名称"
          type="normal"
          value={newName}
          sx={{
            width: '50vw'
          }}
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
      </DialogContent>
      <DialogActions>
        <Button
          disabled={newName === '' || newName === name}
          onClick={handleRename}
        >
          変更
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default function FilePreviewRenamerToolbarButton({id, name}: {id: string, name: string}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <StyledToggleButtonGroup size='small'>
        <ToggleButton
          onClick={handleDialogClickOpen}
          value="filenameedit"
        >
          <Tooltip title="名前の変更">
            <EditIcon />
          </Tooltip>
        </ToggleButton>
      </StyledToggleButtonGroup>
      <FilePreviewRenamerDialog id={id} name={name} open={dialogOpen} onClose={handleDialogClose} />
    </>
  );
}
