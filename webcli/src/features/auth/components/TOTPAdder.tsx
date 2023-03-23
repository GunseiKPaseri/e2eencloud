import { useState, useEffect } from 'react';
import * as OTPAuth from 'otpauth';
import QRcode from 'qrcode';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CopyableField from '../../../components/atom/CopyableField';
import { useAppDispatch, useAppSelector } from '../../../lib/react-redux';
import { addTOTPAsync, type AuthState } from '../authSlice';

const genQR = (totp: OTPAuth.TOTP) => new Promise<string>((resolve, reject) => {
  QRcode.toDataURL(totp.toString(), (err, qrcode) => {
    if (err) return reject(err);
    return resolve(qrcode);
  });
});

const genTOTP = (email: string) => new OTPAuth.TOTP({
  issuer: 'E2EEncloud',
  label: `${email}`,
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  secret: new OTPAuth.Secret(),
});

export default function TOTPAdder({ onSuccess }: { onSuccess: () => void }) {
  const user = useAppSelector<AuthState['user']>((state) => state.auth.user);
  if (user === null) return <></>;
  const [secretkey, setSecretKey] = useState(genTOTP(user.email));
  const [qrlink, setQRLink] = useState('');
  const [token, setToken] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const dispatch = useAppDispatch();

  const reloadkey = () => {
    setSecretKey(genTOTP(user.email));
  };
  const sendKey = async () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    await dispatch(addTOTPAsync({ secretKey: secretkey.secret.base32, token }));
    onSuccess();
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const qr = await genQR(secretkey);
      setQRLink(qr);
    })();
    return () => {
      setQRLink('');
    };
  }, [secretkey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCodeVerified(secretkey.validate({ token, window: 0 }) !== null);
    }, 100);
    return () => clearInterval(interval);
  }, [secretkey, token]);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5">TOTP</Typography>
        <img alt="TOTP用QRコード" src={qrlink} />
      </Grid>
      <Grid item xs={12}>
        <CopyableField fullWidth readOnly size="small" value={secretkey.toString()} />
      </Grid>
      <Grid item xs={8}>
        <TextField
          fullWidth
          autoComplete="one-time-code"
          size="small"
          label="表示されたトークン"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </Grid>
      <Grid item xs={4}>
        <Button
          fullWidth
          variant="outlined"
          onClick={reloadkey}
          disabled={qrlink === ''}
        >
          再生成
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          fullWidth
          variant="contained"
          onClick={sendKey}
          disabled={!codeVerified}
        >
          登録
        </Button>
      </Grid>
    </Grid>
  );
}
