import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { signupAsync } from '../authSlice';
import { useAppDispatch } from '../../../lib/react-redux';
import PutEmail from './signupsequence/PutEmail';
import SendedEmail from './signupsequence/SendedEmail';
import { sequence } from './signupsequence/sequence';

export default function Signup() {
  const [stepState, setStepState] = useState<0 | 1>(0);
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(0); // 再送可能管理タイマー
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timerId = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(timerId);
  });

  // 確認が取れたらサインアップ
  const sendMail = () => {
    setStepState(1);
    setTimer(30); // 30秒間メールを送信不能に
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(signupAsync({ email }));
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
      <Stepper activeStep={stepState} alternativeLabel>
        {sequence.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        メールアドレス受信確認
      </Typography>
      <Typography component="p">受信可能なメールアドレスを選択してください。</Typography>
      {(stepState === 0
        ? (
          <PutEmail
            timer={timer}
            email={email}
            onChangeEmail={setEmail}
            onConfirm={sendMail}
          />
        )
        : (
          <SendedEmail
            timer={timer}
            email={email}
            onCancel={() => setStepState(0)}
            onResend={sendMail}
          />
        )
        )}
    </Box>
  );
}
