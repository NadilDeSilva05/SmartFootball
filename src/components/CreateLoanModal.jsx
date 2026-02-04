'use client'

// React Imports
import { useState } from 'react'

// Formik Imports
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

// MUI Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Grid,
  Button,
  Stack,
  Box,
  Divider
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

// Redux Imports (UI-only: no API)
import { useSelector } from 'react-redux'

// Component Imports
import FormikSelectNew from '@/components/common/formik/FormikSelectNew'
import FormikInput from '@/components/common/formik/FormikInput'
import FormikDatePicker from '@/components/common/formik/FormikDatePicker'
import MuiFormikCurrencyField from './common/formik/MuiFormikCurrencyField'

const CreateLoanModal = ({ open, handleClose, clientId, clientName }) => {
  const { isCreateLoanLoading } = useSelector(state => state.loanReducer || {})

  const loanTypes = [
    { value: 'personal', name: 'Personal Loan' },
    { value: 'business', name: 'Business Loan' },
    { value: 'education', name: 'Education Loan' },
    { value: 'agriculture', name: 'Agriculture Loan' },
    { value: 'emergency', name: 'Emergency Loan' },
    { value: 'housing', name: 'Housing Loan' },
    { value: 'group', name: 'Group Loan' },
    { value: 'topup', name: 'Top-up Loan' },
    { value: 'asset', name: 'Asset Finance' },
    { value: 'consumption', name: 'Consumption Loan' }
  ]

  const interestTypes = [
    { value: 'simple', name: 'Simple Interest' },
    { value: 'compound', name: 'Compound Interest' },
    { value: 'reducingBalance', name: 'Reducing Balance' },
    { value: 'flat', name: 'Flat Rate' },
    { value: 'noInterest', name: 'No Interest' },
    { value: 'serviceFee', name: 'Service Fee Only' }
  ]

  const repaymentFrequencies = [
    { value: 'weekly', name: 'Weekly' },
    { value: 'biweekly', name: 'Bi-weekly' },
    { value: 'monthly', name: 'Monthly' },
    { value: 'quarterly', name: 'Quarterly' }
  ]

  const initialValues = {
    client: clientId,
    loanType: '',
    amountBorrowed: '',
    interestType: '',
    interestRate: 0,
    serviceFee: 0,
    loanStartDate: null,
    loanEndDate: null,
    dueDate: null,
    repaymentFrequency: 'monthly',
    notes: ''
  }

  const validationSchema = Yup.object({
    loanType: Yup.string().required('Loan type is required'),
    amountBorrowed: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .typeError('Amount must be a number'),
    interestType: Yup.string().required('Interest type is required'),
    interestRate: Yup.number()
      .min(0, 'Interest rate cannot be negative')
      .when('interestType', {
        is: type => type !== 'noInterest' && type !== 'serviceFee',
        then: Yup.number().required('Interest rate is required')
      }),
    serviceFee: Yup.number()
      .min(0, 'Service fee cannot be negative')
      .when('interestType', {
        is: 'serviceFee',
        then: Yup.number().required('Service fee is required')
      }),
    loanStartDate: Yup.date().required('Start date is required'),
    repaymentFrequency: Yup.string().required('Repayment frequency is required')
  })

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    setSubmitting(false)
    resetForm()
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md' scroll='body'>
      <DialogTitle>
        <Typography variant='h5' component='div'>
          Create New Loan
        </Typography>
        {handleClose ? (
          <IconButton
            aria-label='close'
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme => theme.palette.grey[500]
            }}
          >
            <i className='ri-close-line' />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {formik => (
            <Form>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography variant='h6' color='primary'>
                      Client: {clientName}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                      Loan Details
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormikSelectNew
                      name='loanType'
                      label='Loan Type *'
                      options={loanTypes}
                      value='value'
                      selectLabel='name'
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <MuiFormikCurrencyField name='amountBorrowed' label='Amount Borrowed *' />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormikSelectNew
                      name='interestType'
                      label='Interest Type *'
                      options={interestTypes}
                      value='value'
                      selectLabel='name'
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormikInput
                      name='interestRate'
                      type='number'
                      label='Interest Rate (%)'
                      disabled={
                        formik.values.interestType === 'noInterest' || formik.values.interestType === 'serviceFee'
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <MuiFormikCurrencyField name='serviceFee' label='Service Fee' />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormikSelectNew
                      name='repaymentFrequency'
                      label='Repayment Frequency *'
                      options={repaymentFrequencies}
                      value='value'
                      selectLabel='name'
                      required
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                      Loan Dates
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormikDatePicker
                      name='loanStartDate'
                      label='Loan Start Date *'
                      value={formik.values.loanStartDate}
                      setFieldValue={formik.setFieldValue}
                      error={formik.errors.loanStartDate}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormikDatePicker
                      name='loanEndDate'
                      label='Loan End Date'
                      value={formik.values.loanEndDate}
                      setFieldValue={formik.setFieldValue}
                      error={formik.errors.loanEndDate}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormikDatePicker
                      name='dueDate'
                      label='First Payment Due Date'
                      value={formik.values.dueDate}
                      setFieldValue={formik.setFieldValue}
                      error={formik.errors.dueDate}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                      Additional Information
                    </Typography>
                  </Grid>

                  <Grid size={12}>
                    <FormikInput name='notes' type='text' label='Notes' multiline rows={4} />
                  </Grid>

                  <Grid size={12}>
                    <Stack direction='row' spacing={2} justifyContent='flex-end'>
                      <Button variant='outlined' onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button
                        type='submit'
                        variant='contained'
                        disabled={formik.isSubmitting || isCreateLoanLoading}
                        startIcon={(formik.isSubmitting || isCreateLoanLoading) ? <CircularProgress size={20} color='inherit' /> : null}
                      >
                        Create Loan
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

export default CreateLoanModal
