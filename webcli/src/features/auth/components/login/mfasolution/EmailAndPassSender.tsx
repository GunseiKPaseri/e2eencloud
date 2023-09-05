import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useAppDispatch } from '~/lib/react-redux';
import { loginAsync } from '~/features/auth/authSlice';
import PasswordField from '~/features/auth/components/PasswordField';
import { isEmailCorrect } from '~/utils/emailAddressCheck';

export default function EmailAndPassSender({
  state,
}: {
  state: 'pending' | 'error' | null;
}) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isGoodMailAddress = isEmailCorrect(email);
  const dispatch = useAppDispatch();
  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(loginAsync({ email, password }));
  };
  return (
    <Box component='form' onSubmit={login} noValidate sx={{ mt: 1 }}>
      <TextField
        margin='normal'
        required
        fullWidth
        id='email'
        label={t('auth.email', 'メールアドレス')}
        name='email'
        autoComplete='email'
        autoFocus
        value={email}
        error={!isGoodMailAddress}
        onChange={(e) => setEmail(e.target.value)}
      />
      <PasswordField
        id='password'
        name='password'
        label={t('auth.password', 'パスワード')}
        margin='normal'
        variant='outlined'
        fullWidth
        required
        value={password}
        autoComplete='current-password'
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        type='submit'
        fullWidth
        variant='contained'
        disabled={state === 'pending'}
        sx={{ mt: 3, mb: 2 }}
      >
        {t('auth.login', 'ログイン')}
      </Button>
      {state === 'error' ? (
        <Alert severity='error'>
          {t('auth.loginfailed', 'ログインに失敗しました。')}
        </Alert>
      ) : (
        <></>
      )}
    </Box>
  );
}
