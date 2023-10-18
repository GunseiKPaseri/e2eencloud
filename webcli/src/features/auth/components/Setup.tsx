import { useEffect, useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { type AuthState, confirmEmailAsync } from '~/features/auth/authSlice';
import ConfirmPassword from './signupsequence/ConfirmPassword';
import PutPassword from './signupsequence/PutPassword';
import { sequence } from './signupsequence/sequence';

const SetupResult = (props: {
  state?: string;
  redirectTimer: number | null;
}) => {
  if (props.state === 'LOADING') {
    return <p>処理中です</p>;
  } else if (props.state === 'SUCCESS') {
    return (
      <p>
        成功しました。
        {props.redirectTimer === null ? (
          <>
            <Link to='/'>トップページ</Link>
            に移動してください
          </>
        ) : (
          <>
            {props.redirectTimer}
            秒後に
            <Link to='/'>トップページ</Link>
            に遷移します。
          </>
        )}
      </p>
    );
  } else {
    return <p>失敗しました</p>;
  }
};

export default function Setup() {
  const [stepState, setStepState] = useState<2 | 3 | 4>(2);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const selector = useAppSelector<AuthState>((state) => state.auth);
  const dispatch = useAppDispatch();
  const [redirectTimer, setRedirectTimer] = useState<number | null>(null);

  const expiredAt = new Date(query.get('expired_at') ?? '');
  const token = query.get('token');

  useEffect(() => {
    const timerId = setInterval(() => {
      if (redirectTimer !== null && redirectTimer > 0)
        setRedirectTimer(redirectTimer - 1);
    }, 1000);
    return () => clearInterval(timerId);
  });

  if (
    Number.isNaN(expiredAt.getTime()) ||
    token === null ||
    redirectTimer === 0
  ) {
    return <Navigate to='/' state={{ from: location }} />;
  }

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        marginTop: 8,
      }}
    >
      <Stepper activeStep={stepState} alternativeLabel>
        {sequence.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Avatar sx={{ bgcolor: 'secondary.main', m: 1 }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component='h1' variant='h5'>
        パスワード登録
      </Typography>
      <Typography component='p'>
        <Typography component='em'>{expiredAt.toLocaleString()}</Typography>
        までに登録してください
      </Typography>
      {stepState === 2 ? (
        <PutPassword
          password={password}
          onChangePassword={setPassword}
          onDecidePassword={() => setStepState(3)}
        />
      ) : stepState === 3 ? (
        <ConfirmPassword
          password={password}
          confirmPassword={confirmPassword}
          onChangeConfirmPassword={setConfirmPassword}
          onCancel={() => {
            setConfirmPassword('');
            setStepState(3);
          }}
          onDecidePassword={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            dispatch(confirmEmailAsync({ password, token }));
            setStepState(4);
            setRedirectTimer(5);
          }}
        />
      ) : (
        <SetupResult
          state={selector.confirmstate[token]}
          redirectTimer={redirectTimer}
        />
      )}
    </Box>
  );
}
