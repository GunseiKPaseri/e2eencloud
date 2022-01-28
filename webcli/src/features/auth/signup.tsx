import React, { useState, ReactElement } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { signupAsync } from './authSlice'
import { PasswordField } from './PasswordField'
import zxcvbn from 'zxcvbn'
import PasswordChecker from './PasswordChecker'
import { correctEmailaddr } from '../../util'
import { Avatar, Box, Button, Typography, TextField, Grid, Stepper, Step, StepLabel } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

const steps = [
  'ユーザ情報入力',
  'パスワードの確認',
  'メールアドレス受信確認'
]

export const Signup:React.FC = ():ReactElement => {
  const [stepState, setStepState] = useState<0|1|2>(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [timer, setTimer] = useState(0) // 再送可能管理タイマー
  const [confirmPassword, setConfirmPassword] = useState('')
  const dispatch = useAppDispatch()
  // メールアドレスが適切なものか判定
  const isGoodMailAddress = correctEmailaddr.test(email)
  // 現在のパスワードをスコア化
  const res = zxcvbn(password, [email])
  const passwordScore:0|1|2|3|4 = password.length < 8 ? 0 : res.score

  const tick = () => {
    if (timer > 0) setTimer(timer - 1)
  }

  React.useEffect(() => {
    const timerId = setInterval(() => tick(), 1000)
    return () => clearInterval(timerId)
  })

  // 入力が受け入れられるものなら確認画面に遷移
  const confirm = () => {
    setStepState(1)
  }
  // 拒絶するときは初期画面に戻す
  const cancel = () => {
    setConfirmPassword('')
    setStepState(0)
  }
  // 確認が取れたらサインアップ
  const signup:React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setStepState(2)
    setTimer(30)
    await dispatch(signupAsync({ email, password }))
  }

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
    <Stepper activeStep={stepState} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
      <LockOutlinedIcon />
    </Avatar>
      <Typography component="h1" variant="h5">
        アカウント登録
      </Typography>
      <Typography component="p">パスワードは絶対忘れないようにしてください</Typography>
      <Box component="form" onSubmit={signup} noValidate sx={{ mt: 1 }}>
      {
        (stepState === 2
          ? <>
              <Typography component="p">
                <Typography component="em">{email}</Typography>にメールを送信しました。受信したメールに含まれる確認リンクにアクセスしてください。
              </Typography>
              <ul>
                <li>メールアドレスが間違っていませんか？</li>
                <li>迷惑メールに含まれていませんか？</li>
                <li>既に登録済みではありませんか？</li>
              </ul>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    type="button"
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={cancel}
                  >
                    戻る
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={timer !== 0}
                  >
                    再送信{(timer > 0 ? `(${timer})` : '')}
                  </Button>
                </Grid>
              </Grid>
            </>

          : <>
              <TextField
                margin="normal"
                disabled={stepState === 1}
                required
                fullWidth
                id="email"
                label="メールアドレス"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus={stepState === 0}
                value={email}
                error={!isGoodMailAddress}
                helperText={isGoodMailAddress ? '' : '正しくないメールアドレスです' }
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordField
                margin="normal"
                required
                fullWidth
                name="password"
                label={stepState === 1 ? 'パスワード（確認のため再入力）' : 'パスワード'}
                id="password"
                autoComplete="current-password"
                value={stepState === 1 ? confirmPassword : password}
                onChange={(e) => stepState === 1 ? setConfirmPassword(e.target.value) : setPassword(e.target.value)}
                error={stepState === 0 && passwordScore < 2}
                helperText = { stepState === 0 ? <PasswordChecker score={passwordScore} /> : '先程入力したものと同じものを入力してください' }
              />
              {
                stepState === 1
                  ? <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        type="button"
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={cancel}
                      >
                        戻る
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={password !== confirmPassword || timer !== 0}
                      >
                        登録{(timer > 0 ? `(${timer})` : '')}
                      </Button>
                    </Grid>
                  </Grid>
                  : <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={!isGoodMailAddress || passwordScore < 2}
                    onClick={confirm}
                  >
                    次へ
                  </Button>

                }
            </>
        )
      }
      </Box>
    </Box>
  )
}
