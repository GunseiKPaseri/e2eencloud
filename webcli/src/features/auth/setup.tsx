import React, { useState, ReactElement } from 'react';
import { useAppDispatch, useAppSelector } from '../../../src/app/hooks';
import { AuthState, confirmEmailAsync } from './authSlice';
import { TowFactorAuth } from './twofactorauth';

export const Setup: React.FC = ():ReactElement => {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const dispatch = useAppDispatch();
  const selector = useAppSelector<AuthState>((state) => state.auth);
  const confirmToken = async () => {
    await dispatch(confirmEmailAsync({email, token}));
  };
  return (
    <article>
      <h2>ユーザ登録手続き</h2>
      {selector.confirmstate === 1 ?
        <>
          <p>メールアドレスが確認されました。</p>
          <TowFactorAuth />
        </>
        :
        <form>
          <label>メールアドレス：<input type="text" value={email} onChange={(e)=>setEmail(e.target.value)} /></label><br />
          <label>メール確認トークン：<input type="text" value={token} onChange={(e)=>{
            setToken(e.target.value);
          }} /></label><br />
          <button type="button" onClick={confirmToken}>確認</button>
        </form>
      }
    </article>
  );
}