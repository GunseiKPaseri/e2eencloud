import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AxiosResponse } from 'axios'
import { axiosWithSession, appLocation } from '../componentutils'
import { createSalt, SHA256, argon2encrypt, generateRSAKey, importRSAKey, AESCTR, getAESCTRKey, decryptAESCTR } from '../../utils/crypto'
import { byteArray2base64, base642ByteArray } from '../../utils/uint8'
import { setRSAKey } from '../../encrypt'
import { buildFileTableAsync } from '../file/fileSlice'

import { AES_AUTH_KEY_LENGTH } from '../../const'

import { setProgress, deleteProgress, progress } from '../progress/progressSlice'
import { enqueueSnackbar } from '../snackbar/snackbarSlice'
import { RootState } from '../../app/store'
import { updateUsageAsync } from '../file/thunk/updateUsageAsync'

interface UserForm {
  email: string;
  password: string;
}

interface UserState {
  email: string;
  useTowFactorAuth: boolean;
  MasterKey: number[];
}
export interface AuthState {
  user: UserState | null;
  signupStatus: 'failed' | null;
  loginStatus: 'failed' | null;
  confirmstate: 0|1;
}

const initialState: AuthState = {
  user: null,
  signupStatus: null,
  loginStatus: null,
  confirmstate: 0
}

// Thunk
// サインアップ処理
export const signupAsync = createAsyncThunk<{success: boolean}, UserForm>(
  'auth/signup',
  async (userinfo, { dispatch }) => {
    // 128 bit MasterKey
    const MasterKey = window.crypto.getRandomValues(new Uint8Array(AES_AUTH_KEY_LENGTH))
    // 128 bit Client Random Value
    const ClientRandomValue = window.crypto.getRandomValues(new Uint8Array(AES_AUTH_KEY_LENGTH))
    // 256 bit Salt
    const salt = createSalt(ClientRandomValue)
    // 256bit Derived Key
    const DerivedKey = await argon2encrypt(userinfo.password, salt)
    // 128bit Derived Encryption Key & Derived Authentication Key
    const DerivedEncryptionKey = await getAESCTRKey(DerivedKey.slice(0, AES_AUTH_KEY_LENGTH))
    const DerivedAuthenticationKey = DerivedKey.slice(AES_AUTH_KEY_LENGTH, AES_AUTH_KEY_LENGTH * 2)
    // 128bit Encrypted Master Key
    const EncryptedMasterKey = await AESCTR(MasterKey, DerivedEncryptionKey)
    const HashedAuthenticationKey = SHA256(DerivedAuthenticationKey)
    console.log(MasterKey, DerivedEncryptionKey, EncryptedMasterKey)

    const sendData = {
      email: userinfo.email,
      clientRandomValueBase64: byteArray2base64(ClientRandomValue),
      encryptedMasterKeyBase64: byteArray2base64(EncryptedMasterKey.encrypt),
      encryptedMasterKeyIVBase64: byteArray2base64(EncryptedMasterKey.iv),
      hashedAuthenticationKeyBase64: byteArray2base64(HashedAuthenticationKey)
    }

    const result = await axiosWithSession.post<
                          UserForm,
                          AxiosResponse<{success: boolean}>
                        >(
                          `${appLocation}/api/signup`,
                          sendData,
                          {
                            onUploadProgress: (progressEvent) => {
                              dispatch(setProgress(progress(0, 1, progressEvent.loaded / progressEvent.total)))
                            }
                          }
                        )

    dispatch(deleteProgress())
    return { success: result.data.success ?? false }
  }
)

// メールアドレス確認処理
export const confirmEmailAsync = createAsyncThunk<{success: boolean}, {email: string, token: string}>(
  'auth/confirm_email',
  async (usertoken, { dispatch }) => {
    const sendData = {
      email: usertoken.email,
      emailConfirmationToken: usertoken.token
    }
    const result = await axiosWithSession.post<
                          {email: string, emailConfirmationToken: string},
                          AxiosResponse<{success: boolean}>
                        >(
                          `${appLocation}/api/email_confirm`,
                          sendData,
                          {
                            onUploadProgress: (progressEvent) => {
                              dispatch(setProgress(progress(0, 1, progressEvent.loaded / progressEvent.total)))
                            }
                          }
                        )
    if (!result.data.success) {
      throw new Error('email confirm failed')
    }
    dispatch(deleteProgress())
    return { success: true }
  }
)

// TOTP追加処理
export const addTOTPAsync = createAsyncThunk<void, {secretKey: string, token: string}>(
  'auth/add_totp',
  async (secretkey, { dispatch }) => {
    await axiosWithSession.put<{secretKey: string, token: string}>(
      `${appLocation}/api/user/totp`,
      secretkey,
      {
        onUploadProgress: (progressEvent) => {
          dispatch(setProgress(progress(0, 1, progressEvent.loaded / progressEvent.total)))
        }
      }
    )
    dispatch(deleteProgress())
  }
)

// TOTP削除処理
export const deleteTOTPAsync = createAsyncThunk<void, void>(
  'auth/delete_totp',
  async (_) => {
    await axiosWithSession.delete(`${appLocation}/api/user/totp`)
  }
)

// ログイン処理
export const loginAsync = createAsyncThunk<UserState, {email: string, password: string, token: string}>(
  'auth/login',
  async (userinfo, { dispatch }) => {
    const step = 4
    dispatch(setProgress(progress(0, step)))
    const getSalt = await axiosWithSession.post<
                        {email: string},
                        AxiosResponse<{salt: string}>
                      >(
                        `${appLocation}/api/salt`,
                        { email: userinfo.email },
                        {
                          onUploadProgress: (progressEvent) => {
                            dispatch(setProgress(progress(0, step, progressEvent.loaded / progressEvent.total)))
                          }
                        }
                      )

    const salt = base642ByteArray(getSalt.data.salt)

    const DerivedKey = await argon2encrypt(userinfo.password, salt)
    dispatch(setProgress(progress(1, step)))

    const DerivedEncryptionKey = await getAESCTRKey(DerivedKey.slice(0, AES_AUTH_KEY_LENGTH))
    const DerivedAuthenticationKey = DerivedKey.slice(AES_AUTH_KEY_LENGTH, AES_AUTH_KEY_LENGTH * 2)

    const authenticationKeyBase64 = byteArray2base64(DerivedAuthenticationKey)

    // login
    let result
    try {
      result = await axiosWithSession.post<
        {email: string, authenticationKey: string, token: string},
        AxiosResponse<{
          encryptedMasterKeyBase64: string,
          encryptedMasterKeyIVBase64: string,
          useTwoFactorAuth: boolean,
          encryptedRSAPrivateKeyBase64?: string,
          encryptedRSAPrivateKeyIVBase64?: string,
          RSAPublicKeyBase64?: string,
        }>
      >(
        `${appLocation}/api/login`,
        { email: userinfo.email, authenticationKeyBase64, token: userinfo.token },
        {
          onUploadProgress: (progressEvent) => {
            dispatch(setProgress(progress(2, step, progressEvent.loaded / progressEvent.total)))
          }
        }
      )
      console.log(result.data)
    } catch (e) {
      dispatch(deleteProgress())
      dispatch(enqueueSnackbar({message: 'ログインに失敗しました', options: {variant: 'error'}}))
      throw e
    }
    const EncryptedMasterKey = base642ByteArray(result.data.encryptedMasterKeyBase64)
    console.log(result.data.encryptedMasterKeyIVBase64)

    const MasterKeyRaw = await decryptAESCTR(EncryptedMasterKey, DerivedEncryptionKey, base642ByteArray(result.data.encryptedMasterKeyIVBase64))
    console.log(MasterKeyRaw)
    const MasterKey = await getAESCTRKey(MasterKeyRaw)
    console.log(result.data)
    // encrypt key
    if (!result.data.RSAPublicKeyBase64 || !result.data.encryptedRSAPrivateKeyBase64 || !result.data.encryptedRSAPrivateKeyIVBase64) {
      // add key
      console.log(MasterKey)
      const genKey = await generateRSAKey(MasterKey)
      await axiosWithSession.put<{
                      encryptedRSAPrivateKeyBase64: string,
                      encryptedRSAPrivateKeyIVBase64: string,
                      RSAPublicKeyBase64: string
                    }>(
                      `${appLocation}/api/user/pubkey`,
                      {
                        encryptedRSAPrivateKeyBase64: genKey.encripted_private_key,
                        encryptedRSAPrivateKeyIVBase64: genKey.encripted_private_key_iv,
                        RSAPublicKeyBase64: genKey.public_key
                      },
                      {
                        onUploadProgress: (progressEvent) => {
                          dispatch(setProgress(progress(3, step, progressEvent.loaded / progressEvent.total)))
                        }
                      }
                    )
      setRSAKey({ rsaPrivateKey: genKey.privateKey, rsaPublicKey: genKey.publicKey })
    } else {
      try {
        dispatch(setProgress(progress(3, step, 0)))
        const importKey = await importRSAKey({
          masterkey: MasterKey,
          encryptedPrivateKeyBase64: result.data.encryptedRSAPrivateKeyBase64,
          encryptedPrivateKeyIVBase64: result.data.encryptedRSAPrivateKeyIVBase64,
          publicKeyBase64: result.data.RSAPublicKeyBase64
        })
        setRSAKey({ rsaPublicKey: importKey.publicKey, rsaPrivateKey: importKey.privateKey })
      } catch (e) {
        dispatch(deleteProgress())
        dispatch(enqueueSnackbar({message: '暗号鍵の復元に失敗しました', options: {variant: 'error'}}))
        throw e
      }
    }
    // file tree
    dispatch(buildFileTableAsync())

    // storage
    dispatch(updateUsageAsync())

    dispatch(deleteProgress())

    dispatch(enqueueSnackbar({message: 'ログインに成功しました', options: {variant: 'success'}}))
    return { email: userinfo.email, MasterKey: Array.from(MasterKeyRaw), useTowFactorAuth: result.data.useTwoFactorAuth }
  }
)

// ログアウト処理
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_) => {
    // logout
    await axiosWithSession.post(`${appLocation}/api/logout`)
  }
)

// パスワード変更処理
export const changePasswordAsync = createAsyncThunk<{}, {newpassword: string}, {state: RootState}>(
  'auth/changePassword',
  async (params, { getState, dispatch }) => {
    const step = 5
    dispatch(setProgress(progress(0, step)))

    const state = getState()
    const user = state.auth.user
    if(!user) throw new Error('ログインしろ')
    const MasterKey = new Uint8Array(user.MasterKey)
    
    // 128 bit Client Random Value
    const ClientRandomValue = window.crypto.getRandomValues(new Uint8Array(AES_AUTH_KEY_LENGTH))
    // 256 bit Salt
    const salt = createSalt(ClientRandomValue)
    // 256bit Derived Key
    const DerivedKey = await argon2encrypt(params.newpassword, salt)

    dispatch(setProgress(progress(1, step)))

    // 128bit Derived Encryption Key & Derived Authentication Key
    const DerivedEncryptionKey = await getAESCTRKey(DerivedKey.slice(0, AES_AUTH_KEY_LENGTH))
    const DerivedAuthenticationKey = DerivedKey.slice(AES_AUTH_KEY_LENGTH, AES_AUTH_KEY_LENGTH * 2)

    dispatch(setProgress(progress(2, step)))

    // 128bit Encrypted Master Key
    const EncryptedMasterKey = await AESCTR(MasterKey, DerivedEncryptionKey)
    const HashedAuthenticationKey = SHA256(DerivedAuthenticationKey)
    console.log(MasterKey, DerivedEncryptionKey, EncryptedMasterKey)

    dispatch(setProgress(progress(3, step)))

    const sendData = {
      clientRandomValueBase64: byteArray2base64(ClientRandomValue),
      encryptedMasterKeyBase64: byteArray2base64(EncryptedMasterKey.encrypt),
      encryptedMasterKeyIVBase64: byteArray2base64(EncryptedMasterKey.iv),
      hashedAuthenticationKeyBase64: byteArray2base64(HashedAuthenticationKey)
    }
    const result = await axiosWithSession.patch<
                          UserForm,
                          AxiosResponse<{success: boolean}>
                        >(
                          `${appLocation}/api/user/password`,
                          sendData,
                          {
                            onUploadProgress: (progressEvent) => {
                              dispatch(setProgress(progress(4, step, progressEvent.loaded / progressEvent.total)))
                            }
                          }
                        )

    dispatch(enqueueSnackbar({message: 'パスワードを変更しました', options: {variant: 'success'}}))
    dispatch(deleteProgress())
    return {}
  }
)

// Slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(confirmEmailAsync.fulfilled, (state) => {
        state.confirmstate = 1
      })
      .addCase(addTOTPAsync.fulfilled, (state) => {
        if (state.user) {
          state.user.useTowFactorAuth = true
        }
      })
      .addCase(deleteTOTPAsync.fulfilled, (state) => {
        if (state.user) {
          state.user.useTowFactorAuth = false
        }
      })
      .addCase(loginAsync.pending, (state) => {
        state.loginStatus = null
      })
      .addCase(loginAsync.rejected, (state) => {
        state.loginStatus = 'failed'
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        console.log('get', action.payload.MasterKey)
        state.user = action.payload
      })
      .addCase(logoutAsync.fulfilled, (state, action) => {
        state.user = null
      })
  }
})

export default authSlice.reducer
