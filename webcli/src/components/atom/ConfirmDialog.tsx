import { type ReactNode, useRef } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export default function ConfirmDialog({
  title,
  open,
  contents,
  handleEditConfirmYes,
  handleEditConfirmNo,
  textYes,
  textNo,
}: {
  title: string;
  open: boolean;
  handleEditConfirmYes: () => void;
  handleEditConfirmNo: () => void;
  contents: ReactNode;
  textYes: string;
  textNo: string;
}) {
  const noButtonRef = useRef<HTMLButtonElement>(null);

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleEditConfirmEntered = () => {
    // The `autoFocus` is not used because, if used, the same Enter that saves
    // the cell triggers "No". Instead, we manually focus the "No" button once
    // the dialog is fully open.
    // noButtonRef.current?.focus();
  };
  return (
    <Dialog
      maxWidth='xs'
      TransitionProps={{ onEntered: handleEditConfirmEntered }}
      open={open}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{contents}</DialogContent>
      <DialogActions>
        <Button ref={noButtonRef} onClick={handleEditConfirmNo}>
          {textNo}
        </Button>
        <Button onClick={handleEditConfirmYes}>{textYes}</Button>
      </DialogActions>
    </Dialog>
  );
}
