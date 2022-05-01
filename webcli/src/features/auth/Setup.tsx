import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { AuthState, confirmEmailAsync } from './authSlice';

export default function Setup() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const dispatch = useAppDispatch();
  const selector = useAppSelector<AuthState>((state) => state.auth);
  const confirmToken = async () => {
    await dispatch(confirmEmailAsync({ email, token }));
  };
  return (
    <article>
      <h2>ユーザ登録手続き</h2>
      {selector.confirmstate === 1
        ? (
          <p>メールアドレスが確認されました。</p>
        )
        : (
          <form>
            <label>
              メールアドレス：
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <br />
            <label>
              メール確認トークン：
              <input
                type="text"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                }}
              />
            </label>
            <br />
            <button type="button" onClick={confirmToken}>確認</button>
          </form>
        )}
    </article>
  );
}
