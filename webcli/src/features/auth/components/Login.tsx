import { Link } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTranslation } from 'react-i18next';
import { type AuthState, logoutAsync } from '../authSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import EmailAndPassSender from './Login/EmailAndPassSender';
import TOTPSender from './Login/TOTPSender';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selector = useAppSelector<AuthState>((state) => state.auth);
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
      {
        selector.loginStatus.step === 'EmailAndPass'
          ? <EmailAndPassSender />
          : <TOTPSender />
      }
      <Box>
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
