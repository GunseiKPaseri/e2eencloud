import React, { useState, ReactElement, useEffect } from 'react';
import * as OTPAuth from 'otpauth';
import QRcode from 'qrcode';

import { useAppDispatch, useAppSelector } from '../../../src/app/hooks';
import { addTOTPAsync, AuthState, confirmEmailAsync } from './authSlice';

const genQR = (totp: OTPAuth.TOTP) => new Promise<string>((resolve, reject) => {
  QRcode.toDataURL(totp.toString(), (err, qrcode) => {
    if(err) return reject(err);
    resolve(qrcode);
  });
});

const genTOTP = (email: string) => {
  return new OTPAuth.TOTP({
    issuer: 'E2EE',
    label: `${email}`,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret()
  });
}

const GenTwoFactorAuth: React.FC<{email: string}> = (props):ReactElement => {
  const [secretkey, setSecretKey] = useState(genTOTP(props.email));
  const [qrlink, setQRLink] = useState("");
  const [token, setToken] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const dispatch = useAppDispatch();
  
  const reloadkey = () => {
    setSecretKey(genTOTP(props.email));
  };
  const sendKey = () => {
    dispatch(addTOTPAsync({secret_key: secretkey.secret.base32, token}));
  };

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
    <button type="button" onClick={sendKey} disabled={!codeVerified}>登録</button>
  </>);
}

export const TowFactorAuth:React.FC = ():ReactElement => {
  const selector = useAppSelector<AuthState>((state) => state.auth);
  return (
    <article>
      {selector.user ? (
        (selector.user.useTowFactorAuth) ?
            <p>二段階認証を利用しています</p>
          : <>
              <p>二段階認証を利用していません。新しく追加しましょう。</p>
              <GenTwoFactorAuth email={selector.user.email} />
            </>
      ): <></>
      }
    </article>
  );
};