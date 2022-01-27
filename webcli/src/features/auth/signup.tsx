import React, { useState, ReactElement } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { signupAsync } from './authSlice'
import zxcvbn from 'zxcvbn'
import PasswordChecker from './PasswordChecker'
import { correctEmailaddr } from '../../util'

export const Signup:React.FC = ():ReactElement => {
  const [confirmMode, setConfirmMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const dispatch = useAppDispatch()
  // メールアドレスが適切なものか判定
  const isGoodMailAddress = correctEmailaddr.test(email)
  // 現在のパスワードをスコア化
  const res = zxcvbn(password, [email])
  const passwordScore:0|1|2|3|4 = password.length < 8 ? 0 : res.score

  // 入力が受け入れられるものなら確認画面に遷移
  const confirm = () => {
    setConfirmMode(true)
  }
  // 拒絶するときは初期画面に戻す
  const cancel = () => {
    setConfirmPassword('')
    setConfirmMode(false)
  }
  // 確認が取れたらサインアップ
  const signup:React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    await dispatch(signupAsync({ email, password }))
  }

  return (
    <article>
      <h2>サインアップ</h2>
      <p>パスワードは絶対忘れないようにしてください</p>
      <form onSubmit={signup}>
      {
        (confirmMode
          ? <>
            <label>メールアドレス：<input autoComplete="username" type="email" value={email} readOnly /></label><br />
            <label>パスワード（確認のため再入力）：<input type="password" name="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label><br/>
            <button type="submit" disabled={password !== confirmPassword}>送信</button><br/>
            <button type="button" onClick={cancel}>取り消し</button>
          </>
          : <>
            <label>メールアドレス：<input autoComplete="username" type="email" value={email} onChange={(e) => {
              setEmail(e.target.value)
            }} /></label><br />
            {!isGoodMailAddress ? <><span style={{ color: 'red' }}>正しくないメールアドレスです</span><br /></> : <></> }
            <label>パスワード：<input autoComplete='new-password' type="password" value={password} onChange={(e) => {
              setPassword(e.target.value)
            }} /></label><br />
            <PasswordChecker score={passwordScore} /><br />
            <button type="button" onClick={confirm} disabled={!isGoodMailAddress || passwordScore < 2}>確認</button>
          </>
          )
      }

      </form>
    </article>
  )
}
