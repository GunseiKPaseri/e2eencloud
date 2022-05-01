import { useState, useEffect } from 'react';
import * as OTPAuth from 'otpauth';
import QRcode from 'qrcode';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addTOTPAsync, AuthState, deleteTOTPAsync } from './authSlice';

const genQR = (totp: OTPAuth.TOTP) => new Promise<string>((resolve, reject) => {
  QRcode.toDataURL(totp.toString(), (err, qrcode) => {
    if (err) return reject(err);
    return resolve(qrcode);
  });
});

const genTOTP = (email: string) => new OTPAuth.TOTP({
  issuer: 'E2EE',
  label: `${email}`,
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  secret: new OTPAuth.Secret(),
});

function GenTwoFactorAuth({ email }: { email: string }) {
  const [secretkey, setSecretKey] = useState(genTOTP(email));
  const [qrlink, setQRLink] = useState('');
  const [token, setToken] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const dispatch = useAppDispatch();

  const reloadkey = () => {
    setSecretKey(genTOTP(email));
  };
  const sendKey = () => {
    dispatch(addTOTPAsync({ secretKey: secretkey.secret.base32, token }));
  };

  useEffect(() => {
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
    }, 500);
    return () => clearInterval(interval);
  }, [secretkey, token]);
  return (
    <>
      <img alt="二段階認証用QRコード" src={qrlink} />
      <br />
      <input value={secretkey.toString()} readOnly />
      <br />
      <label>
        表示されたトークン
        <input autoComplete="one-time-code" value={token} onChange={(e) => setToken(e.target.value)} />
      </label>
      <br />
      <button type="button" onClick={reloadkey} disabled={qrlink === ''}>再生成</button>
      <button type="button" onClick={sendKey} disabled={!codeVerified}>登録</button>
    </>
  );
}

export default function TowFactorAuth() {
  const selector = useAppSelector<AuthState>((state) => state.auth);
  const dispatch = useAppDispatch();
  const deleteKey = () => {
    dispatch(deleteTOTPAsync());
  };
  return (
    <article>
      {
        selector.user
          && (
            (selector.user.useTowFactorAuth)
              ? (
                <>
                  <p>二要素認証を利用しています</p>
                  <button type="button" onClick={deleteKey}>二要素認証を停止</button>
                </>
              )
              : (
                <>
                  <p>二要素認証を利用していません。新しく追加しましょう。</p>
                  <GenTwoFactorAuth email={selector.user.email} />
                </>
              )
          )
        }
    </article>
  );
}
