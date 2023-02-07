import { useState } from 'react';
import { Link } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import { correctEmailaddr } from '../../../util';
import PasswordField from './PasswordField';
import { type AuthState, loginAsync, logoutAsync } from '../authSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const isGoodMailAddress = correctEmailaddr.test(email);
  const dispatch = useAppDispatch();
  const selector = useAppSelector<AuthState>((state) => state.auth);
  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(loginAsync({ email, password, token }));
  };
  const logout = async () => {
    await dispatch(logoutAsync());
  };
  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        {t('auth.login', 'ログイン')}
      </Typography>
      {
        selector.user !== null
          ? (
            <>
              <Typography component="p">
                {t('auth.youalreadyloggined', { defaultValue: '既に{{email}}としてログイン済です', email: selector.user.email })}
              </Typography>
              <Button
                type="button"
                variant="outlined"
                onClick={logout}
              >
                {t('auth.logout', 'ログアウト')}
              </Button>
            </>
          )
          : <></>
      }
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
        <TextField
          margin="normal"
          fullWidth
          name="token"
          label={t('auth.twofactorauthtoken', '二要素認証トークン')}
          type="normal"
          id="token"
          value={token}
          onChange={(e) => { setToken(e.target.value); }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          {t('auth.login', 'ログイン')}
        </Button>
        {
          (selector.loginStatus
            ? (
              <Alert severity="error">
                {t('auth.loginfailed', 'ログインに失敗しました。\nメールアドレス、パスワード、二要素認証トークン（登録している場合）に誤りが無いか確認してください。')}
              </Alert>
            )
            : <></>
          )
        }
        <Grid container>
          <Grid item>
            <Link to="/signup">
              {t('auth.registifyoudonothaveanaccount', 'アカウントがなければ登録')}
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
