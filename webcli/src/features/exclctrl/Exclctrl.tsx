import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert } from '@mui/material';
import Button from '@mui/material/Button';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import type { AuthState } from '../auth/authSlice';
import { requestExclCtrl } from './requestExclCtrl';

export default function Exclctrl() {
  const exclctrl = useAppSelector((store) => store.exclctrl);
  const user = useAppSelector<AuthState['user']>((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const handleClick = () => {
    requestExclCtrl(dispatch);
  };
  return user === null || exclctrl.usable ? (
    <></>
  ) : (
    <Alert
      severity='error'
      icon={<LockOutlinedIcon fontSize='inherit' />}
      action={
        <Button
          type='button'
          color='inherit'
          size='small'
          onClick={handleClick}
        >
          操作権を要求
        </Button>
      }
    >
      サーバにアップロード作業ができるのは同時に一つのタブのみです。
    </Alert>
  );
}
