'use client'

// React imports
import { useState } from 'react'

// Formik imports
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

// MUI imports
import { Card, CardContent, CardHeader, Button, Grid, Box, Divider, Typography } from '@mui/material'

// Common Formik components
import FormikInput from './common/formik/FormikInput'
import FormikTextField from './common/formik/FormikTextField'
import FormikSelect from './common/formik/FormikSelect'
import FormikCheckbox from './common/formik/FormikCheckbox'
import FormikSwitch from './common/formik/FormikSwitch'
import FormikRadioGroup from './common/formik/FormikRadioGroup'
import FormikDatePicker from './common/formik/FormikDatePicker'
import FormikAutocomplete from './common/formik/FormikAutocomplete'

// Validation schema
const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .required('Last name is required'),
  email: Yup.string().email('Please enter a valid email address').required('Email is required'),
  phone: Yup.string()
    .matches(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .required('Phone number is required'),
  country: Yup.string().required('Country is required'),
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  gender: Yup.string().required('Gender is required'),
  interests: Yup.array().min(1, 'Please select at least one interest'),
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the terms and conditions')
    .required('You must agree to the terms and conditions'),
  receiveNewsletter: Yup.boolean(),
  bio: Yup.string().max(500, 'Bio must not exceed 500 characters')
})

// Sample data
const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'in', label: 'India' },
  { value: 'au', label: 'Australia' }
]

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
]

const interestOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'sports', label: 'Sports' },
  { value: 'music', label: 'Music' },
  { value: 'travel', label: 'Travel' },
  { value: 'reading', label: 'Reading' },
  { value: 'cooking', label: 'Cooking' }
]

const SampleFormikForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initial form values
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    dateOfBirth: null,
    gender: '',
    interests: [],
    agreeToTerms: false,
    receiveNewsletter: false,
    bio: ''
  }

  // Form submission handler
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Form submitted with values:', values)

      // Show success message or redirect
      alert('Form submitted successfully!')

      // Reset form if needed
      resetForm()
    } catch (error) {
      console.error('Form submission error:', error)
      alert('An error occurred while submitting the form')
    } finally {
      setIsSubmitting(false)
      setSubmitting(false)
    }
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardHeader title='Sample Formik Form' subheader='Demonstrating common Formik components' />
      <CardContent>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting: formikSubmitting, values, errors, touched }) => (
            <Form>
              <Grid container spacing={3}>
                {/* Personal Information Section */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='h6' gutterBottom>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                {/* First Name */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormikInput name='firstName' label='First Name' placeholder='Enter your first name' required />
                </Grid>

                {/* Last Name */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormikInput name='lastName' label='Last Name' placeholder='Enter your last name' required />
                </Grid>

                {/* Email */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormikTextField
                    name='email'
                    label='Email Address'
                    type='email'
                    placeholder='Enter your email'
                    required
                  />
                </Grid>

                {/* Phone */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormikInput
                    name='phone'
                    label='Phone Number'
                    type='tel'
                    placeholder='Enter your phone number'
                    required
                  />
                </Grid>

                {/* Country */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormikSelect
                    name='country'
                    label='Country'
                    options={countryOptions}
                    value='value'
                    selectLabel='label'
                    required
                  />
                </Grid>

                {/* Date of Birth */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field name='dateOfBirth'>
                    {({ field, form }) => (
                      <FormikDatePicker
                        name='dateOfBirth'
                        label='Date of Birth'
                        value={field.value}
                        setFieldValue={form.setFieldValue}
                        error={form.touched.dateOfBirth && form.errors.dateOfBirth}
                        required
                      />
                    )}
                  </Field>
                </Grid>

                {/* Gender */}
                <Grid size={{ xs: 12 }}>
                  <FormikRadioGroup name='gender' dataSet={genderOptions} direction='row' />
                </Grid>

                {/* Interests */}
                <Grid size={{ xs: 12 }}>
                  <Field name='interests'>
                    {({ field, form }) => (
                      <FormikAutocomplete
                        name='interests'
                        label='Interests'
                        options={interestOptions}
                        title='label'
                        multiple
                        formik={form}
                        placeholder='Select your interests'
                      />
                    )}
                  </Field>
                </Grid>

                {/* Bio */}
                <Grid size={{ xs: 12 }}>
                  <FormikInput
                    name='bio'
                    label='Bio'
                    multiline
                    rows={4}
                    placeholder='Tell us about yourself (optional)'
                  />
                </Grid>

                {/* Preferences Section */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                    Preferences
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                {/* Newsletter Subscription */}
                <Grid size={{ xs: 12 }}>
                  <FormikSwitch name='receiveNewsletter' label='Subscribe to newsletter' />
                </Grid>

                {/* Terms and Conditions */}
                <Grid size={{ xs: 12 }}>
                  <FormikCheckbox name='agreeToTerms' label='I agree to the terms and conditions' isErrorMessage />
                </Grid>

                {/* Submit Button */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type='submit'
                      variant='contained'
                      color='primary'
                      disabled={isSubmitting || formikSubmitting}
                      sx={{ minWidth: 120 }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </Box>
                </Grid>

                {/* Debug Information (for development) */}
                {process.env.NODE_ENV === 'development' && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant='subtitle2' gutterBottom>
                        Debug Information:
                      </Typography>
                      <Typography variant='body2' component='pre'>
                        {JSON.stringify({ values, errors, touched }, null, 2)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  )
}

export default SampleFormikForm
