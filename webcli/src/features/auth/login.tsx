import React, { useState, ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { AuthState, loginAsync, logoutAsync } from './authSlice'
import { TowFactorAuth } from './twofactorauth'
import { correctEmailaddr } from '../../util'
import { Avatar, Box, Button, Typography, TextField, Grid } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

export const Login: React.FC = ():ReactElement => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const isGoodMailAddress = correctEmailaddr.test(email)
  const dispatch = useAppDispatch()
  const selector = useAppSelector<AuthState>((state) => state.auth)
  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await dispatch(loginAsync({ email, password, token }))
  }
  const logout = async () => {
    await dispatch(logoutAsync())
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
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        ログイン
      </Typography>
      {
        selector.user !== null
          ? <>
            <Typography component="p">既に{selector.user.email}としてログイン済みです</Typography>
            <TowFactorAuth />
            <Button type="button"
              variant="outlined"
              onClick={logout}>
                ログアウト
            </Button>
          </>
          : <></>
      }
      <Box component="form" onSubmit={login} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="メールアドレス"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          error={!isGoodMailAddress}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="パスワード"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => { setPassword(e.target.value) }}
        />
        <TextField
          margin="normal"
          fullWidth
          name="token"
          label="2要素認証トークン"
          type="normal"
          id="token"
          value={token}
          onChange={(e) => { setToken(e.target.value) }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          ログイン
        </Button>
        <Grid container>
          <Grid item>
            <Link to="/signup">
              {'アカウントが無ければ登録'}
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
