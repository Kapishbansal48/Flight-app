import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

// Persist session token to localStorage
const saveSession = (session) => {
  if (session) localStorage.setItem('sb-session', JSON.stringify(session))
  else localStorage.removeItem('sb-session')
}

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', { email, password })
    saveSession(data.session)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed')
  }
})

export const signupUser = createAsyncThunk('auth/signup', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/signup', { email, password })
    saveSession(data.session)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Signup failed')
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout')
  saveSession(null)
})

const getInitialSession = () => {
  try {
    const raw = localStorage.getItem('sb-session')
    return raw ? JSON.parse(raw) : null
  } catch (_) { return null }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    session: getInitialSession(),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user    = payload.user
        state.session = payload.session
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload
      })
      .addCase(signupUser.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(signupUser.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user    = payload.user
        state.session = payload.session
      })
      .addCase(signupUser.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; state.session = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
