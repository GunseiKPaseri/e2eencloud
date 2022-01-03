import React, { useState, ReactElement } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { signupAsync } from './authSlice';

export const Signup:React.FC = ():ReactElement => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const signup = async () => {
    await dispatch(signupAsync({email, password}));
  };

  return (
    <article>
      <h2>サインアップ</h2>
      <p>パスワードは絶対忘れないようにしてください</p>
      <form>
        <label>ユーザ名：<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} /></label>
        <label>パスワード：<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
        <button onClick={signup}>送信</button>
      </form>
    </article>
  )
}