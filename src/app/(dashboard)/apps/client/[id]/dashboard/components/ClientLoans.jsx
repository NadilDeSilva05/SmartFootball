'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  LinearProgress,
  Alert
} from '@mui/material'

const ClientLoans = ({ loans, isLoading, onOpenLoanModal, error = null }) => {
  // Helper function to calculate payment progress
  const calculateProgress = (paidAmount, totalAmount) => {
    if (!totalAmount || totalAmount === 0) return 0
    return Math.round((paidAmount / totalAmount) * 100)
  }

  // Helper function to get status color
  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success'
      case 'defaulted':
        return 'error'
      case 'overdue':
        return 'warning'
      default:
        return 'info'
    }
  }

  // Show error state
  if (error) {
    return (
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Alert severity='error' sx={{ mb: 2 }}>
                Failed to load loans: {error?.message || 'Unknown error'}. Please try again.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Loans Summary */}
      <Grid size={12}>
        <Card>
          <CardHeader
            title={
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography variant='h5'>Loans Summary</Typography>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<i className='ri-add-line' />}
                  onClick={onOpenLoanModal}
                >
                  New Loan
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i
                    className='ri-money-dollar-circle-line text-primary'
                    style={{ fontSize: '2rem', marginBottom: '0.5rem' }}
                  />
                  <Typography variant='h4' color='primary' gutterBottom>
                    {loans?.length || 0}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Loans
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i className='ri-bank-card-line text-success' style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <Typography variant='h4' color='success.main' gutterBottom>
                    ${loans?.reduce((sum, loan) => sum + (loan.amountBorrowed || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Borrowed
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i className='ri-check-line text-info' style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <Typography variant='h4' color='info.main' gutterBottom>
                    ${loans?.reduce((sum, loan) => sum + (loan.paidAmount || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Paid
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i className='ri-time-line text-warning' style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <Typography variant='h4' color='warning.main' gutterBottom>
                    {loans?.filter(loan => loan.paymentStatus === 'overdue').length || 0}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Overdue Loans
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Loans List */}
      <Grid size={12}>
        <Card>
          <CardHeader title='Active Loans' titleTypographyProps={{ variant: 'h5' }} />
          <CardContent>
            {isLoading ? (
              <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
                <CircularProgress size={40} />
              </Box>
            ) : loans && loans.length > 0 ? (
              <Grid container spacing={3}>
                {loans.map(loan => {
                  const progress = calculateProgress(loan.paidAmount || 0, loan.amountBorrowed || 0)

                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={loan._id}>
                      <Paper variant='outlined' sx={{ p: 3, height: '100%' }}>
                        <Box display='flex' alignItems='center' gap={2} mb={3}>
                          <i className='ri-money-dollar-circle-line text-primary' style={{ fontSize: '1.5rem' }} />
                          <Box flex={1}>
                            <Typography variant='h6' fontWeight='500'>
                              {loan.loanType?.charAt(0)?.toUpperCase() + loan.loanType?.slice(1)} Loan
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              ID: {loan._id?.slice(-8)}
                            </Typography>
                          </Box>
                          <Chip
                            label={loan.paymentStatus?.charAt(0)?.toUpperCase() + loan.paymentStatus?.slice(1)}
                            color={getStatusColor(loan.paymentStatus)}
                            size='small'
                          />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={2}>
                          <Box>
                            <Typography variant='body2' color='text.secondary' gutterBottom>
                              Amount Borrowed
                            </Typography>
                            <Typography variant='h5' color='primary' fontWeight='500'>
                              ${loan.amountBorrowed?.toLocaleString() || '0'}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant='body2' color='text.secondary' gutterBottom>
                              Interest Rate
                            </Typography>
                            <Typography variant='body1' fontWeight='500'>
                              {loan.interestType === 'noInterest' ? 'No Interest' : `${loan.interestRate}%`}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant='body2' color='text.secondary' gutterBottom>
                              Payment Progress
                            </Typography>
                            <Box display='flex' alignItems='center' gap={2} mb={1}>
                              <LinearProgress
                                variant='determinate'
                                value={progress}
                                sx={{ flex: 1, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant='body2' fontWeight='500'>
                                {progress}%
                              </Typography>
                            </Box>
                            <Typography variant='body2' color='text.secondary'>
                              ${loan.paidAmount?.toLocaleString() || '0'} of $
                              {loan.amountBorrowed?.toLocaleString() || '0'}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant='body2' color='text.secondary' gutterBottom>
                              Start Date
                            </Typography>
                            <Typography variant='body1'>
                              {loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </Box>

                          {loan.loanEndDate && (
                            <Box>
                              <Typography variant='body2' color='text.secondary' gutterBottom>
                                End Date
                              </Typography>
                              <Typography variant='body1'>{new Date(loan.loanEndDate).toLocaleDateString()}</Typography>
                            </Box>
                          )}

                          <Box display='flex' gap={1} mt={2}>
                            <Button variant='outlined' size='small' startIcon={<i className='ri-eye-line' />} fullWidth>
                              View Details
                            </Button>
                            <Button
                              variant='outlined'
                              size='small'
                              startIcon={<i className='ri-edit-line' />}
                              fullWidth
                            >
                              Edit
                            </Button>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>
            ) : (
              <Box textAlign='center' py={6}>
                <i
                  className='ri-money-dollar-circle-line'
                  style={{ fontSize: '4rem', color: '#ccc', marginBottom: '1rem' }}
                />
                <Typography variant='h6' color='text.secondary' gutterBottom>
                  No loans found for this client
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  Click the &quot;New Loan&quot; button to create a loan for this client.
                </Typography>
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onOpenLoanModal}>
                  Create First Loan
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Payment History */}
      {loans && loans.length > 0 && (
        <Grid size={12}>
          <Card>
            <CardHeader title='Payment History' titleTypographyProps={{ variant: 'h5' }} />
            <CardContent>
              <Stack spacing={2}>
                {loans.map(loan => (
                  <Paper key={loan._id} variant='outlined' sx={{ p: 3 }}>
                    <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
                      <Box>
                        <Typography variant='h6' fontWeight='500'>
                          {loan.loanType?.charAt(0)?.toUpperCase() + loan.loanType?.slice(1)} Loan
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Started: {loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                      <Chip
                        label={loan.paymentStatus?.charAt(0)?.toUpperCase() + loan.paymentStatus?.slice(1)}
                        color={getStatusColor(loan.paymentStatus)}
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Amount Borrowed
                        </Typography>
                        <Typography variant='h6' color='primary'>
                          ${loan.amountBorrowed?.toLocaleString() || '0'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Amount Paid
                        </Typography>
                        <Typography variant='h6' color='success.main'>
                          ${loan.paidAmount?.toLocaleString() || '0'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Remaining
                        </Typography>
                        <Typography variant='h6' color='warning.main'>
                          ${((loan.amountBorrowed || 0) - (loan.paidAmount || 0)).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default ClientLoans
