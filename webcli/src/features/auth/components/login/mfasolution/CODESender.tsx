import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '~/lib/react-redux';
import { mfacodeLoginAsync } from '~/features/auth/authSlice';
import { bs58CheckDecodeWithoutErr } from '~/utils/bs58check';

export default function CODESender({
  state,
}: {
  state: 'error' | 'pending' | null;
}) {
  const { t } = useTranslation();
  const [mfacode, setMFACode] = useState('');
  const error = bs58CheckDecodeWithoutErr(mfacode) === null;
  const dispatch = useAppDispatch();
  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(mfacodeLoginAsync({ mfacode }));
  };
  return (
    <Box component='form' onSubmit={login} noValidate sx={{ mt: 1 }}>
      <TextField
        autoComplete='one-time-code'
        margin='normal'
        fullWidth
        name='token'
        label={t('auth.DisposableCode', '使い捨てコード')}
        type='normal'
        id='token'
        value={mfacode}
        onChange={(e) => {
          setMFACode(e.target.value);
        }}
        error={error}
      />
      <Button
        type='submit'
        fullWidth
        disabled={state === 'pending' || error}
        variant='contained'
        sx={{ mb: 2, mt: 3 }}
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
