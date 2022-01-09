import React, { useState, ReactElement } from 'react';
import { useAppDispatch, useAppSelector } from '../../../src/app/hooks';
import { AuthState, loginAsync } from './authSlice';

export const Setup: React.FC = ():ReactElement => {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const dispatch = useAppDispatch();
  const selector = useAppSelector<AuthState>((state) => state.auth);
  const login = async () => {
    await dispatch(loginAsync({email, password, token}));
  };
  return (
    <article>
      <h2>ログイン</h2>
      {selector.user !== null ?
        <>
          <p>{selector.user.email}としてログイン済み</p>
        </>
        :
        <form>
          <label>メールアドレス：<input type="text" value={email} onChange={(e)=>setEmail(e.target.value)}/></label><br />
          <label>パスワード：<input type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} /></label><br />
          <label>2要素認証トークン：<input type="text" value={token} onChange={(e)=>{setToken(e.target.value)}} /></label><br />
          <button type="button" onClick={login}>ログイン</button>
        </form>
      }
    </article>
  );
}