import { Link as RouterLink } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { type AuthState, logoutAsync, selectMFASolution } from '~/features/auth/authSlice';
import SolutionSelector from './SolutionSelector';

function OtherStepGuide() {
  const { t } = useTranslation();
  const loginStatus = useAppSelector<AuthState['loginStatus']>((state) => state.auth.loginStatus);
  const dispatch = useAppDispatch();
  return (
    <Box>
      <Grid container>
        <Grid item>
          {
          loginStatus.step === 'EmailAndPass'
            ? (
              <Link
                component={RouterLink}
                to="/signup"
              >
                {t('auth.registifyoudonothaveanaccount', 'アカウントがなければ登録')}
              </Link>
            )
            : (
              loginStatus.step === 'SelectMFASolution'
                ? <></>
                : (
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => dispatch(selectMFASolution('SelectMFASolution'))}
                  >
                    他の認証手段を利用
                  </Link>
                )
            )
       }
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
        user !== null
          ? (
            <>
              <Typography component="p">
                {t('auth.youalreadyloggined', { defaultValue: '既に{{email}}としてログイン済です', email: user.email })}
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
      <SolutionSelector />
      <OtherStepGuide />
    </Box>
  );
}
