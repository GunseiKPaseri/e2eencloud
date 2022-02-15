import Box from "@mui/material/Box"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import Stepper from "@mui/material/Stepper"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import zxcvbn from "zxcvbn"
import PasswordChecker from "./PasswordChecker"
import { PasswordField } from "./PasswordField"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import { changePasswordAsync } from "./authSlice"

const steps = [
  '新規パスワード入力',
  'パスワードの確認'
]

export const PasswordChanger = () => {
  const [stepState, setStepState] = useState<0|1>(0)
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const dispatch = useAppDispatch()

  const email = useAppSelector(state => state.auth.user?.email) ?? ''
  // 現在のパスワードをスコア化
  const res = zxcvbn(password, [email])
  const passwordScore:0|1|2|3|4 = password.length < 8 ? 0 : res.score
  
  const changePass:React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    dispatch(changePasswordAsync({newpassword: password}))
  }

  const confirm = () => {
    setStepState(1)
  }

  const cancel = () => {
    setConfirmPassword('')
    setStepState(0)
  }

  return (
  <Box>
    <Stepper activeStep={stepState} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
    <Typography component="h1" variant="h5">
      パスワード変更
    </Typography>
    <Typography component="p">パスワードは絶対忘れないようにしてください</Typography>
    <Box component="form" onSubmit={changePass} noValidate sx={{ mt: 1 }}>
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
                disabled={password !== confirmPassword}
              >
                登録
              </Button>
            </Grid>
          </Grid>
          : <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={passwordScore < 2}
            onClick={confirm}
          >
            次へ
          </Button>
        }
    </Box>
  </Box>
)
}
