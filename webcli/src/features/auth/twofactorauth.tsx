import React, { useState, ReactElement, useEffect } from 'react';
import * as OTPAuth from 'otpauth';
import QRcode from 'qrcode';

import { useAppDispatch, useAppSelector } from '../../../src/app/hooks';
import { AuthState, confirmEmailAsync } from './authSlice';

const genQR = (totp: OTPAuth.TOTP) => new Promise<string>((resolve, reject) => {
  QRcode.toDataURL(totp.toString(), (err, qrcode) => {
    if(err) return reject(err);
    resolve(qrcode);
  });
});

const genTOTP = () => {
  return new OTPAuth.TOTP({
    issuer: 'E2EE',
    label: 'E2EE<hoge>',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret()
  });
}

const GenTwoFactorAuth: React.FC = ():ReactElement => {
  const [secretkey, setSecretKey] = useState(genTOTP());
  const [qrlink, setQRLink] = useState("");
  const [token, setToken] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  
  const reloadkey = () => {
    setSecretKey(genTOTP());
  }

  useEffect(() => {
    (async () => {
      const qr = await genQR(secretkey);
      setQRLink(qr);
    })();
    return ()=>{
      setQRLink("");
    }
  }, [secretkey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCodeVerified(secretkey.validate({token, window: 0}) !== null);
    }, 1000);
    return () => clearInterval(interval);
  }, [secretkey, token]);
  return (<>
    <img src={qrlink} /><br />
    <input value={secretkey.toString()} readOnly/><br />
    <label>一時キー<input autoComplete="one-time-code" value={token} onChange={(e) => setToken(e.target.value)} /></label><br />
    <button type="button" onClick={reloadkey} disabled={qrlink===""}>再生成</button>
    <button type="button" onClick={reloadkey} disabled={!codeVerified}>登録</button>
  </>);
}

export const TowFactorAuth:React.FC = ():ReactElement => {
  const selector = useAppSelector<AuthState>((state) => state.auth);
  return (
    <article>
      {(selector.user?.useTowFactorAuth) ?
        <p>二段階認証を利用しています</p>
      : <>
          <p>二段階認証を利用していません。新しく追加しましょう。</p>
          <GenTwoFactorAuth />
        </>
      }
    </article>
  );
};