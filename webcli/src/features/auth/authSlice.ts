import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AxiosResponse } from 'axios'
import { axiosWithSession, appLocation } from '../apirequest'
import { createSalt, SHA256, argon2encrypt, byteArray2base64, base642ByteArray, generateRSAKey, importRSAKey, AESCTR, getAESCTRKey, decryptAESCTR } from '../../util'
import { setRSAKey } from '../../encrypt'
import { createFileTreeAsync } from '../file/fileSlice'

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
  status: 'idle' | 'loading' | 'failed';
  confirmstate: 0|1;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  confirmstate: 0
}

// Thunk
// サインアップ処理
export const signupAsync = createAsyncThunk<{success: boolean}, UserForm>(
  'auth/signup',
  async (userinfo) => {
    // 128 bit MasterKey
    const MasterKey = window.crypto.getRandomValues(new Uint8Array(16))
    // 128 bit Client Random Value
    const ClientRandomValue = window.crypto.getRandomValues(new Uint8Array(16))
    // 256 bit Salt
    const salt = createSalt(ClientRandomValue)
    // 256bit Derived Key
    const DerivedKey = await argon2encrypt(userinfo.password, salt)
    // 128bit Derived Encryption Key & Derived Authentication Key
    const DerivedEncryptionKey = await getAESCTRKey(DerivedKey.slice(0, 16))
    const DerivedAuthenticationKey = DerivedKey.slice(16, 32)
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

    const result = await axiosWithSession.post<UserForm, AxiosResponse<{success: boolean}>>(`${appLocation}/api/signup`, sendData)
    console.log(result)
    return { success: result.data.success ?? false }
  }
)

// メールアドレス確認処理
export const confirmEmailAsync = createAsyncThunk<{success: boolean}, {email: string, token: string}>(
  'auth/confirm_email',
  async (usertoken) => {
    const sendData = {
      email: usertoken.email,
      emailConfirmationToken: usertoken.token
    }
    const result = await axiosWithSession.post<{email: string, emailConfirmationToken: string}, AxiosResponse<{success: boolean}>>(`${appLocation}/api/email_confirm`, sendData)
    if (!result.data.success) {
      throw new Error('email confirm failed')
    }
    return { success: true }
  }
)

// TOTP追加処理
export const addTOTPAsync = createAsyncThunk<void, {secretKey: string, token: string}>(
  'auth/add_totp',
  async (secretkey) => {
    await axiosWithSession.put<{secretKey: string, token: string}>(`${appLocation}/api/user/totp`, secretkey)
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
    const getSalt = await axiosWithSession.post<
                        {email: string},
                        AxiosResponse<{salt: string}>
                      >(`${appLocation}/api/salt`, { email: userinfo.email })

    const salt = base642ByteArray(getSalt.data.salt)

    const DerivedKey = await argon2encrypt(userinfo.password, salt)

    const DerivedEncryptionKey = await getAESCTRKey(DerivedKey.slice(0, 16))
    const DerivedAuthenticationKey = DerivedKey.slice(16, 32)

    const authenticationKeyBase64 = byteArray2base64(DerivedAuthenticationKey)

    // login
    const result = await axiosWithSession.post<
                      {email: string, authenticationKey: string, token: string},
                      AxiosResponse<{
                        encryptedMasterKeyBase64: string,
                        encryptedMasterKeyIVBase64: string,
                        useTwoFactorAuth: boolean,
                        encryptedRSAPrivateKeyBase64?: string,
                        encryptedRSAPrivateKeyIVBase64?: string,
                        RSAPublicKeyBase64?: string,
                      }>
                    >(`${appLocation}/api/login`, { email: userinfo.email, authenticationKeyBase64, token: userinfo.token })
    console.log(result.data)
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
                    }>(`${appLocation}/api/user/pubkey`, {
                      encryptedRSAPrivateKeyBase64: genKey.encripted_private_key,
                      encryptedRSAPrivateKeyIVBase64: genKey.encripted_private_key_iv,
                      RSAPublicKeyBase64: genKey.public_key
                    })
      setRSAKey({ rsaPrivateKey: genKey.privateKey, rsaPublicKey: genKey.publicKey })
    } else {
      try {
        const importKey = await importRSAKey({
          masterkey: MasterKey,
          encryptedPrivateKeyBase64: result.data.encryptedRSAPrivateKeyBase64,
          encryptedPrivateKeyIVBase64: result.data.encryptedRSAPrivateKeyIVBase64,
          publicKeyBase64: result.data.RSAPublicKeyBase64
        })
        setRSAKey({ rsaPublicKey: importKey.publicKey, rsaPrivateKey: importKey.privateKey })
      } catch (e) {
        console.log(e)
        throw e
      }
    }
    // file tree
    dispatch(createFileTreeAsync())

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

// Slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signupAsync.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(signupAsync.rejected, (state) => {
        state.status = 'idle'
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.status = 'idle'
      })
      .addCase(confirmEmailAsync.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(confirmEmailAsync.rejected, (state) => {
        state.status = 'idle'
      })
      .addCase(confirmEmailAsync.fulfilled, (state) => {
        state.status = 'idle'
        state.confirmstate = 1
      })
      .addCase(addTOTPAsync.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(addTOTPAsync.rejected, (state) => {
        state.status = 'idle'
      })
      .addCase(addTOTPAsync.fulfilled, (state) => {
        state.status = 'idle'
        if (state.user) {
          state.user.useTowFactorAuth = true
        }
      })
      .addCase(deleteTOTPAsync.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteTOTPAsync.rejected, (state) => {
        state.status = 'idle'
      })
      .addCase(deleteTOTPAsync.fulfilled, (state) => {
        state.status = 'idle'
        if (state.user) {
          state.user.useTowFactorAuth = false
        }
      })
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loginAsync.rejected, (state) => {
        state.status = 'idle'
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        console.log('get', action.payload.MasterKey)
        state.user = action.payload
      })
      .addCase(logoutAsync.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.status = 'idle'
      })
      .addCase(logoutAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = null
      })
  }
})

export default authSlice.reducer
