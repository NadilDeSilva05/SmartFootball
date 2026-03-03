import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase-client'

// Football analytics platform roles
export const ROLES = {
  FEDERATION_ADMIN: 'federation_admin',
  CLUB_ADMIN: 'club_admin',
  COACH: 'coach',
  PLAYER: 'player',
  REFEREE: 'referee'
}

// Role-based redirect URLs
export const ROLE_REDIRECT_MAP = {
  [ROLES.FEDERATION_ADMIN]: '/federation',
  [ROLES.CLUB_ADMIN]: '/club',
  [ROLES.COACH]: '/coach/live-dashboard',
  [ROLES.PLAYER]: '/player',
  [ROLES.REFEREE]: '/referee/qr-scanner'
}

const normalizeRole = role => {
  const value = String(role || '').trim().toLowerCase()
  if (!value) return null
  if (value === 'federation_admin' || value === 'federation-admin' || value === 'federation admin') return ROLES.FEDERATION_ADMIN
  if (value === 'club_admin' || value === 'club-admin' || value === 'club admin' || value === 'clubadmin') return ROLES.CLUB_ADMIN
  if (value === 'coach') return ROLES.COACH
  if (value === 'player') return ROLES.PLAYER
  if (value === 'referee') return ROLES.REFEREE
  return value
}

export const requestSignIn = createAsyncThunk(
  'authentication/requestSignIn',
  async (
    { requestBody, handleLoginFailCallback },
    { rejectWithValue }
  ) => {
    const email = requestBody?.emailAddress || requestBody?.email
    const password = requestBody?.password

    try {
      const auth = getFirebaseAuth()
      if (!auth) {
        const err = new Error('Firebase Auth not configured')
        handleLoginFailCallback?.(err)
        return rejectWithValue(err)
      }

      const userCred = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCred.user.getIdToken()
      const tokenResult = await userCred.user.getIdTokenResult()
      const role = normalizeRole(tokenResult.claims?.role || tokenResult.claims?.accountRole)

      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const profile = res.ok ? await res.json() : {}

      const profileRole = normalizeRole(profile.role || profile.accountRole)
      return {
        token,
        user: {
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          fullName: profile.fullName || userCred.user.displayName || email?.split('@')[0] || '',
          role: profileRole || role || ROLES.PLAYER,
          accountRole: profileRole || role || ROLES.PLAYER,
          clubId: profile.clubId || tokenResult.claims?.clubId || null
        }
      }
    } catch (error) {
      let message = 'Login failed'
      if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password') {
        message = 'Invalid email or password'
      } else if (error?.code === 'auth/user-not-found') {
        message = 'No account found with this email'
      } else if (error?.message) {
        message = error.message
      }
      const err = new Error(message)
      err.code = error?.code
      handleLoginFailCallback?.(err)
      return rejectWithValue(err)
    }
  }
)

export const requestSignUpFederationAdmin = createAsyncThunk(
  'authentication/requestSignUpFederationAdmin',
  async (
    { requestBody, handleSuccessCallback, handleFailedCallback },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/auth/register-federation-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: requestBody.email,
          password: requestBody.password,
          fullName: [requestBody.firstName, requestBody.lastName].filter(Boolean).join(' ').trim() || requestBody.email?.split('@')[0],
          securityCode: requestBody.securityCode
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const err = new Error(data?.error || 'Registration failed')
        err.response = { data }
        handleFailedCallback?.(err)
        return rejectWithValue(err)
      }
      handleSuccessCallback?.()
      return data
    } catch (error) {
      handleFailedCallback?.(error)
      return rejectWithValue(error)
    }
  }
)

export const requestSignUp = createAsyncThunk(
  'authentication/requestSignUp',
  async (
    { requestBody, handleSuccessCallback, handleFailedCallback },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: requestBody.email,
          password: requestBody.password,
          fullName: [requestBody.firstName, requestBody.lastName].filter(Boolean).join(' ').trim() || requestBody.email?.split('@')[0],
          role: requestBody.role || ROLES.PLAYER
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const err = new Error(data?.error || 'Registration failed')
        err.response = { data }
        handleFailedCallback?.(err)
        return rejectWithValue(err)
      }
      handleSuccessCallback?.()
      return data
    } catch (error) {
      handleFailedCallback?.(error)
      return rejectWithValue(error)
    }
  }
)

const initialState = {
  loginData: {
    token: null,
    user: {}
  },
  isSignInLoading: false,
  isSignUpLoading: false
}

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    logout: state => {
      state.loginData = { token: null, user: {} }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(requestSignIn.pending, state => {
        state.isSignInLoading = true
      })
      .addCase(requestSignIn.fulfilled, (state, action) => {
        state.isSignInLoading = false
        state.loginData = {
          token: action.payload?.token,
          user: action.payload?.user || {}
        }
      })
      .addCase(requestSignIn.rejected, state => {
        state.isSignInLoading = false
      })
      .addCase(requestSignUp.pending, state => {
        state.isSignUpLoading = true
      })
      .addCase(requestSignUp.fulfilled, state => {
        state.isSignUpLoading = false
      })
      .addCase(requestSignUp.rejected, state => {
        state.isSignUpLoading = false
      })
      .addCase(requestSignUpFederationAdmin.pending, state => {
        state.isSignUpLoading = true
      })
      .addCase(requestSignUpFederationAdmin.fulfilled, state => {
        state.isSignUpLoading = false
      })
      .addCase(requestSignUpFederationAdmin.rejected, state => {
        state.isSignUpLoading = false
      })
  }
})

export const { logout } = authenticationSlice.actions
export default authenticationSlice.reducer
