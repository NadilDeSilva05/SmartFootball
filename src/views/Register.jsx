'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// Component Imports
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

import { requestSignUpFederationAdmin } from '@/redux/slices/authenticationSlice'
import { notifyError, notifySuccess } from '@/utils/toast'

const Register = ({ mode }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const isSignUpLoading = useSelector(state => state?.authenticationReducer?.isSignUpLoading)

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    securityCode: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState({})

  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const footballIllustration = '/images/illustrations/small-child-football-player.svg'
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email?.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formData.securityCode?.trim()) newErrors.securityCode = 'Security code is required'
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUpSuccess = () => {
    notifySuccess('Account created successfully. You can now sign in.')
    router.push('/login')
  }

  const handleSignUpFailed = error => {
    notifyError(error, 'Registration failed. Please try again.')
    setErrors(prev => ({
      ...prev,
      submit: error?.response?.data?.error || error?.message || 'Registration failed. Please try again.'
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    setErrors(prev => ({ ...prev, submit: '' }))

    await dispatch(
      requestSignUpFederationAdmin({
        requestBody: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          securityCode: formData.securityCode
        },
        handleSuccessCallback: handleSignUpSuccess,
        handleFailedCallback: handleSignUpFailed
      })
    )
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className='flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden overflow-hidden'
        style={{
          background: 'linear-gradient(135deg, rgba(0, 128, 0, 0.08) 0%, rgba(0, 100, 0, 0.04) 50%, transparent 100%)'
        }}
      >
        <div className='plb-12 pis-12 relative z-10'>
          <img
            src={footballIllustration}
            alt='Football illustration'
            className='max-bs-[500px] max-is-full bs-auto drop-shadow-lg'
          />
        </div>
        <Illustrations
          image1={{ src: '/images/illustrations/football-goal.svg', className: 'absolute inline-start-4 block-end-4 opacity-40', height: 160 }}
          image2={{ src: '/images/illustrations/football%20cheering.svg', className: 'absolute inline-end-4 block-end-8 opacity-30', height: 120 }}
          maskImg={{ src: authBackground }}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px] border-is border-solid border-default'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <div className='flex justify-center items-center gap-3 mbe-6'>
            <img src='/images/logos/smartfootball.png' alt='Smart Football' height={28} className='w-auto object-contain' />
            <Typography variant='h4' className='font-semibold tracking-[0.15px]'>
              {themeConfig.templateName}
            </Typography>
          </div>
        </div>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>Federation Admin Registration</Typography>
            <Typography className='mbe-1'>
              Create your federation admin account. A security code is required.
            </Typography>
          </div>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <TextField
              autoFocus
              fullWidth
              label='First Name'
              value={formData.firstName}
              onChange={e => handleInputChange('firstName', e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
            <TextField
              fullWidth
              label='Last Name'
              value={formData.lastName}
              onChange={e => handleInputChange('lastName', e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
            <TextField
              fullWidth
              label='Email'
              type='email'
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              fullWidth
              label='Password'
              type={isPasswordShown ? 'text' : 'password'}
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                      <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label='Security Code'
              type='password'
              value={formData.securityCode}
              onChange={e => handleInputChange('securityCode', e.target.value)}
              error={!!errors.securityCode}
              helperText={errors.securityCode || 'Contact your federation for the registration security code.'}
              placeholder='Enter the security code'
            />

            <FormControlLabel
              control={
                <Checkbox checked={formData.agreeToTerms} onChange={e => handleInputChange('agreeToTerms', e.target.checked)} />
              }
              label={
                <>
                  <span>I agree to </span>
                  <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                    privacy policy & terms
                  </Link>
                </>
              }
            />
            {errors.agreeToTerms && (
              <Typography variant='caption' color='error'>{errors.agreeToTerms}</Typography>
            )}

            {errors.submit && (
              <Alert severity='error' sx={{ mt: 1 }}>{errors.submit}</Alert>
            )}

            <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={isSignUpLoading}
              startIcon={isSignUpLoading ? <CircularProgress size={20} /> : null}
            >
              {isSignUpLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Already have an account?</Typography>
              <Typography component={Link} href='/login' color='primary'>
                Sign in instead
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
