import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { removeMFACode, type AuthState } from '~/features/auth/authSlice';

export default function MFACodeDialog() {
  const mfacode = useAppSelector<AuthState['mfacode']>((selector) => selector.auth.mfacode);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(removeMFACode());
  };

  return (
    <Dialog onClose={handleClose} open={mfacode !== null}>
      <DialogTitle>緊急用コード</DialogTitle>
      <Typography>以下のコードを必ず印刷または保存してください．多要素認証に利用する端末を紛失・破損した際に利用します．再表示はできません．</Typography>
      <TextField
        value={mfacode === null ? '' : mfacode.join('\n')}
        InputProps={{
          readOnly: true,
        }}
        multiline
      />
    </Dialog>
  );
}
