'use client'

// MUI Imports
import Chip from '@mui/material/Chip'

// UI-only: static display, no auth
const AuthStatus = ({ variant = 'default', size = 'small' }) => (
  <Chip label='UI Demo' color='default' size={size} variant={variant} />
)

export default AuthStatus
