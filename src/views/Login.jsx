'use client'

// React Imports
import { useState } from 'react'
import { useDispatch } from 'react-redux'

// Next Imports
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { Form, Formik } from 'formik'
import * as Yup from 'yup'

// Component Imports
import Illustrations from '@components/Illustrations'
import FormikTextField from '@components/common/formik/FormikTextField'
import FormikSelectNew from '@components/common/formik/FormikSelectNew'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Redux Actions
import { requestSignIn, ROLE_REDIRECT_MAP } from '@/redux/slices/authenticationSlice'

const Login = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Vars - Football-themed illustrations
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const footballIllustration = '/images/illustrations/football-player.svg'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  // Football platform roles
  const roleOptions = [
    { value: 'federation_admin', label: 'Federation Admin' },
    { value: 'club_admin', label: 'Club Admin' },
    { value: 'coach', label: 'Coach' },
    { value: 'player', label: 'Player' },
    { value: 'referee', label: 'Referee' }
  ]

  // Form validation schema
  const validationSchema = Yup.object().shape({
    role: Yup.string().required('Role is required'),
    email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
    password: Yup.string().max(255).required('Password is required')
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSignIn = async (values, formikHelpers) => {
    const { setSubmitting, setErrors } = formikHelpers

    const requestBody = {
      emailAddress: values.email,
      password: values.password,
      role: values.role,
      rememberMe: true
    }

    const handleLoginFailCallback = error => {
      setSubmitting(false)
      let errorMessage = 'Login failed'

      try {
        const responseData = error?.response?.data
        if (responseData) {
          errorMessage =
            responseData.name ||
            responseData.message ||
            responseData.error ||
            responseData.errorMessage ||
            errorMessage
        } else if (error?.message) {
          errorMessage = error.message
        }
      } catch {
        errorMessage = 'Login failed'
      }

      setErrors({ submit: errorMessage })
    }

    try {
      const result = await dispatch(
        requestSignIn({
          requestBody,
          handleLoginFailCallback,
          isReAuthentication: false
        })
      )

      if (result.type === 'authentication/requestSignIn/rejected') {
        return
      }

      if (result.payload?.token) {
        const userRole = result.payload?.user?.role || values.role
        const redirectTo = searchParams.get('redirectTo')
        const targetUrl = redirectTo || ROLE_REDIRECT_MAP[userRole] || '/dashboard'

        await new Promise(resolve => setTimeout(resolve, 300))
        router.push(targetUrl)
      } else {
        setSubmitting(false)
        setErrors({ submit: 'Login failed. Please try again.' })
      }
    } catch (err) {
      setSubmitting(false)
      setErrors({
        submit:
          err?.response?.data?.message ||
          err?.message ||
          'Login failed. Please try again.'
      })
    }
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
            <img
              src='/images/logos/smartfootball.png'
              alt='Smart Football'
              height={28}
              className='w-auto object-contain'
            />
            <Typography variant='h4' className='font-semibold tracking-[0.15px]'>
              {themeConfig.templateName}
            </Typography>
          </div>
        </div>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>Welcome to Smart Football</Typography>
            <Typography>
              Sign in to access your football analytics dashboard. Track performance, manage teams, and gain insights.
            </Typography>
          </div>

          <Formik
            initialValues={{
              role: 'player',
              email: '',
              password: '',
              submit: null
            }}
            enableReinitialize
            validationSchema={validationSchema}
            validateOnChange
            onSubmit={handleSignIn}
          >
            {({ errors, handleSubmit, isSubmitting, touched, values }) => (
              <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
                <FormikSelectNew
                  label='Role'
                  name='role'
                  options={roleOptions}
                  value='value'
                  selectLabel='label'
                  required
                />
                <FormikTextField
                  label='Email'
                  name='email'
                  type='email'
                  required
                  placeholder='Enter your email'
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                />

                <FormikTextField
                  label='Password'
                  name='password'
                  type={isPasswordShown ? 'text' : 'password'}
                  required
                  placeholder='Enter your password'
                  error={Boolean(touched.password && errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle password visibility'
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                  <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me' />
                  <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                    Forgot password?
                  </Typography>
                </div>

                {errors.submit && (
                  <Alert severity='error' sx={{ mt: 1 }}>
                    {errors.submit}
                  </Alert>
                )}

                <Button
                  disableElevation
                  disabled={isSubmitting}
                  fullWidth
                  size='large'
                  type='submit'
                  variant='contained'
                  color='primary'
                  startIcon={isSubmitting ? <CircularProgress size={20} color='inherit' /> : null}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>

                <div className='flex justify-center items-center flex-wrap gap-2'>
                  <Typography>New on our platform?</Typography>
                  <Typography component={Link} href='/register' color='primary'>
                    Create an account
                  </Typography>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default Login
