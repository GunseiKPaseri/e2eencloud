import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import { type AuthState, totpLoginAsync } from '../../authSlice';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';

export default function TOTPSender() {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const dispatch = useAppDispatch();
  const loginStatus = useAppSelector<AuthState['loginStatus']>((state) => state.auth.loginStatus);
  if (loginStatus.step !== 'TOTP') return <></>;
  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(totpLoginAsync({ token }));
  };
  return (
    <Box component="form" onSubmit={login} noValidate sx={{ mt: 1 }}>
      <TextField
        autoComplete="one-time-code"
        margin="normal"
        fullWidth
        name="token"
        label={t('auth.totptoken', 'TOTPトークン')}
        type="normal"
        id="token"
        value={token}
        onChange={(e) => { setToken(e.target.value); }}
      />
      <Button
        type="submit"
        fullWidth
        disabled={loginStatus.state === 'pending'}
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        {t('auth.login', 'ログイン')}
      </Button>
      {
        (loginStatus.state === 'error'
          ? (
            <Alert severity="error">
              {t('auth.loginfailed', 'ログインに失敗しました。')}
            </Alert>
          )
          : <></>
        )
      }
    </Box>
  );
}
