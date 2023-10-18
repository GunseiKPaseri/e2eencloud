import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import {
  type AuthState,
  logoutAsync,
  selectMFASolution,
} from '~/features/auth/authSlice';
import SolutionSelector from './SolutionSelector';

function OtherStepGuide() {
  const { t } = useTranslation();
  const loginStatus = useAppSelector<AuthState['loginStatus']>(
    (state) => state.auth.loginStatus,
  );
  const dispatch = useAppDispatch();
  return (
    <Box>
      <Grid container>
        <Grid item>
          {loginStatus.step === 'EmailAndPass' ? (
            <Link component={RouterLink} to='/signup'>
              {t(
                'auth.registifyoudonothaveanaccount',
                'アカウントがなければ登録',
              )}
            </Link>
          ) : loginStatus.step === 'SelectMFASolution' ? (
            <></>
          ) : (
            <Link
              component='button'
              variant='body2'
              onClick={() => dispatch(selectMFASolution('SelectMFASolution'))}
            >
              {t('auth.auth.UseOtherAuthMethod', '他の認証手段を利用')}
            </Link>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const user = useAppSelector<AuthState['user']>((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const logout = async () => {
    await dispatch(logoutAsync());
  };
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        marginTop: 8,
      }}
    >
      <Avatar sx={{ bgcolor: 'secondary.main', m: 1 }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component='h1' variant='h5'>
        {t('auth.login', 'ログイン')}
      </Typography>
      {user === null ? (
        <></>
      ) : (
        <>
          <Typography component='p'>
            {t('auth.youalreadyloggined', {
              defaultValue: '既に{{email}}としてログイン済です',
              email: user.email,
            })}
          </Typography>
          <Button type='button' variant='outlined' onClick={logout}>
            {t('auth.logout', 'ログアウト')}
          </Button>
        </>
      )}
      <SolutionSelector />
      <OtherStepGuide />
    </Box>
  );
}
