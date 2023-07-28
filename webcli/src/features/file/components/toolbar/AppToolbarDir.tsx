import React, { useId, useState } from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { type FileState, createFolderAsync } from '~/features/file/fileSlice';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

function AddFolderDialog(props: {
  open: boolean;
  onClose: ()=>void;
}) {
  const addFolderDialogId = useId()

  const [name, setName] = useState<string>('');
  const dispatch = useAppDispatch();
  const filegroup = useAppSelector<FileState['activeFileGroup']>((state) => state.file.activeFileGroup);
  if (filegroup?.type !== 'dir') return null;
  const handleAddDir = async () => {
    await dispatch(createFolderAsync({ name }));
    props.onClose();
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby={addFolderDialogId}
    >
      <DialogTitle id={addFolderDialogId}>新規ディレクトリの作成</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          fullWidth
          name="newname"
          label="新規ディレクトリ名"
          type="normal"
          value={name}
          onChange={(e) => { setName(e.target.value); }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={name === ''}
          onClick={handleAddDir}
        >
          作成
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default function AppToolberDir() {
  const anchorId = useId();
  const [anchorAddEl, setAnchorAddEl] = useState<null | HTMLElement>(null);
  const openAddMenu = Boolean(anchorAddEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorAddEl(event.currentTarget);
  }
  const handleClose = () => {
    setAnchorAddEl(null);
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <ToggleButtonGroup sx={{marginLeft: 1}}>
        <Tooltip title="新規作成">
          <ToggleButton
            onClick={handleClick}
            value="add"
            aria-label="add"
            aria-controls={openAddMenu ? anchorId : undefined}
            aria-haspopup="true"
            aria-expanded={openAddMenu ? 'true' : undefined}
          >
            <AddIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      {
        openAddMenu &&
        <Menu
          id={anchorId}
          anchorEl={anchorAddEl}
          open={openAddMenu}
          onClose={handleClose}
          elevation={0}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          }}
        >
          <MenuItem onClick={() => {
            handleDialogClickOpen();
            handleClose();
          }}>
            <CreateNewFolderIcon /> 新しいフォルダー
          </MenuItem>
        </Menu>
      }
      <AddFolderDialog open={dialogOpen} onClose={handleDialogClose} />
    </>
  );
}
