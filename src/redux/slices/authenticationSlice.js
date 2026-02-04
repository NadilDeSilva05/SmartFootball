import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

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
  [ROLES.COACH]: '/coach',
  [ROLES.PLAYER]: '/player',
  [ROLES.REFEREE]: '/referee'
}

// Derive role from email for demo (when API doesn't return role)
const getRoleFromEmail = email => {
  const lower = (email || '').toLowerCase()
  if (lower.includes('federation') || lower.includes('admin')) return ROLES.FEDERATION_ADMIN
  if (lower.includes('club')) return ROLES.CLUB_ADMIN
  if (lower.includes('coach')) return ROLES.COACH
  if (lower.includes('referee')) return ROLES.REFEREE
  return ROLES.PLAYER // default
}

export const requestSignUp = createAsyncThunk(
  'authentication/requestSignUp',
  async (
    { requestBody, handleSignUpSuccessCallback, handleSignUpFailedCallback },
    { rejectWithValue }
  ) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    try {
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/auth/sign-up`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          const err = new Error(data?.message || data?.name || data?.error || 'Registration failed')
          err.response = { data }
          handleSignUpFailedCallback?.(err)
          return rejectWithValue(err)
        }
        handleSignUpSuccessCallback?.()
        return data
      }

      // Demo mode: simulate successful registration
      await new Promise(resolve => setTimeout(resolve, 800))
      handleSignUpSuccessCallback?.()
      return { success: true }
    } catch (error) {
      handleSignUpFailedCallback?.(error)
      return rejectWithValue(error)
    }
  }
)

export const requestSignIn = createAsyncThunk(
  'authentication/requestSignIn',
  async (
    { requestBody, handleNavigationCallback, handleLoginFailCallback, isReAuthentication },
    { rejectWithValue }
  ) => {
    const email = requestBody?.emailAddress || requestBody?.email
    const password = requestBody?.password
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    try {
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/auth/sign-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailAddress: email,
            password,
            rememberMe: requestBody?.rememberMe ?? true
          })
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          const err = new Error(data?.message || data?.name || data?.error || 'Login failed')
          err.response = { data }
          handleLoginFailCallback?.(err)
          return rejectWithValue(err)
        }
        return {
          token: data?.token || data?.accessToken || 'mock-token',
          user: {
            email: data?.user?.email || email,
            role: data?.user?.role || requestBody?.role || getRoleFromEmail(email),
            ...data?.user
          }
        }
      }

      // Demo mode: simulate successful login
      await new Promise(resolve => setTimeout(resolve, 800))
      const role = requestBody?.role || getRoleFromEmail(email)
      return {
        token: `demo-token-${Date.now()}`,
        user: {
          email,
          role,
          fullName: email.split('@')[0]
        }
      }
    } catch (error) {
      handleLoginFailCallback?.(error)
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
  }
})

export const { logout } = authenticationSlice.actions
export default authenticationSlice.reducer
