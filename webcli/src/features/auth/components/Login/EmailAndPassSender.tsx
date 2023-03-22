import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import { correctEmailaddr } from '../../../../util';
import PasswordField from '../PasswordField';
import { type AuthState, loginAsync } from '../../authSlice';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';

export default function EmailAndPassSender() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isGoodMailAddress = correctEmailaddr.test(email);
  const dispatch = useAppDispatch();
  const loginStatus = useAppSelector<AuthState['loginStatus']>((state) => state.auth.loginStatus);
  if (loginStatus.step !== 'EmailAndPass') return <></>;
  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(loginAsync({ email, password }));
  };
  return (
    <Box component="form" onSubmit={login} noValidate sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label={t('auth.email', 'メールアドレス')}
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        error={!isGoodMailAddress}
        onChange={(e) => setEmail(e.target.value)}
      />
      <PasswordField
        id="password"
        name="password"
        label={t('auth.password', 'パスワード')}
        margin="normal"
        variant="outlined"
        fullWidth
        required
        value={password}
        autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loginStatus.state === 'pending'}
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
