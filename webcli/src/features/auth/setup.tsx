import React, { useState, ReactElement } from 'react';
import { useAppDispatch, useAppSelector } from '../../../src/app/hooks';
import { AuthState, confirmEmailAsync } from './authSlice';

export const Setup: React.FC = ():ReactElement => {
  const [token, setToken] = useState("");
  const dispatch = useAppDispatch();
  const selector = useAppSelector<AuthState>((state) => state.auth);
  const confirmToken = async () => {
    if(selector.user){
      await dispatch(confirmEmailAsync({email: selector.user.email, token}));
    }
  };
  return (
    <article>
      <h2>ユーザ登録手続き</h2>
      <form>
        {selector.confirmstate === 1 ?
          <p>メールアドレスが確認されました。二要素認証を設定しましょう</p>
          :
          <form>
            <label>メール確認トークン：<input type="text" value={token} onChange={(e)=>{
              setToken(e.target.value);
            }} /></label><br />
            <button type="button" onClick={confirmToken}>確認</button>
          </form>
        }
      </form>
    </article>
  );
}