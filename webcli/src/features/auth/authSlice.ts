import {createAsyncThunk, createSlice, isRejectedWithValue} from '@reduxjs/toolkit';
import axios, { AxiosRequestConfig } from 'axios';

interface UserForm {
  email: string;
  password: string;
}

interface UserState {
  email: string;
  token: string;
}
export interface AuthState {
  user: UserState | undefined;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: AuthState = {
  user: undefined,
  status: 'idle',
};

// Thunk
// サインアップ処理
export const signupAsync = createAsyncThunk<{success: boolean, email: string, password: string}, UserForm>(
  'auth/signup',
  async (userinfo) => {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-type': 'application/json',
      },
    };

    console.log(userinfo);

    const result = await axios.post('http://localhost:3001/api/signup', userinfo, config);
    console.log(result);
    try {
      const result = await axios.post('http://localhost:3001/api/signup', userinfo, config);
      return {...result.data, ...userinfo};
    } catch (error: any) {
      console.log(error)
      if(!error.response) {
        throw error;
      }
      return isRejectedWithValue(error.response.data);
    }
  },
);


// Slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signupAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signupAsync.rejected, (state) => {
        state.status = 'idle';
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = {email: action.payload.email, token: action.payload.password};
      });
  }
});

export default authSlice.reducer;
