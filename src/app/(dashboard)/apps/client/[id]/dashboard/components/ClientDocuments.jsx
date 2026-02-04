'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Grid,
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
  Avatar,
  IconButton
} from '@mui/material'

const ClientDocuments = ({ clientId }) => {
  // Mock documents data - replace with actual API call
  const [documents] = useState([
    {
      id: 1,
      name: 'Identity Document',
      type: 'ID Card',
      size: '2.5 MB',
      uploadedAt: '2024-01-15',
      status: 'verified',
      icon: 'ri-id-card-line'
    },
    {
      id: 2,
      name: 'Proof of Address',
      type: 'Utility Bill',
      size: '1.8 MB',
      uploadedAt: '2024-01-10',
      status: 'verified',
      icon: 'ri-file-text-line'
    },
    {
      id: 3,
      name: 'Income Certificate',
      type: 'Certificate',
      size: '3.2 MB',
      uploadedAt: '2024-01-08',
      status: 'pending',
      icon: 'ri-file-certificate-line'
    },
    {
      id: 4,
      name: 'Bank Statement',
      type: 'Statement',
      size: '4.1 MB',
      uploadedAt: '2024-01-05',
      status: 'rejected',
      icon: 'ri-bank-card-line'
    }
  ])

  // Helper function to get status color
  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return 'success'
      case 'pending':
        return 'warning'
      case 'rejected':
        return 'error'
      default:
        return 'info'
    }
  }

  // Helper function to get document type color
  const getDocumentTypeColor = type => {
    switch (type?.toLowerCase()) {
      case 'id card':
        return 'primary'
      case 'utility bill':
        return 'info'
      case 'certificate':
        return 'success'
      case 'statement':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Grid container spacing={6}>
      {/* Documents Summary */}
      <Grid size={12}>
        <Card>
          <CardHeader
            title={
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography variant='h5'>Documents Summary</Typography>
                <Button variant='contained' color='primary' startIcon={<i className='ri-upload-line' />}>
                  Upload Document
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i className='ri-file-text-line text-primary' style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <Typography variant='h4' color='primary' gutterBottom>
                    {documents.length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Documents
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i className='ri-check-line text-success' style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <Typography variant='h4' color='success.main' gutterBottom>
                    {documents.filter(doc => doc.status === 'verified').length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Verified
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i className='ri-time-line text-warning' style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <Typography variant='h4' color='warning.main' gutterBottom>
                    {documents.filter(doc => doc.status === 'pending').length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Pending
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i className='ri-close-line text-error' style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <Typography variant='h4' color='error.main' gutterBottom>
                    {documents.filter(doc => doc.status === 'rejected').length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Rejected
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Documents List */}
      <Grid size={12}>
        <Card>
          <CardHeader title='Client Documents' titleTypographyProps={{ variant: 'h5' }} />
          <CardContent>
            <Grid container spacing={3}>
              {documents.map(document => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={document.id}>
                  <Paper variant='outlined' sx={{ p: 3, height: '100%' }}>
                    <Box display='flex' alignItems='center' gap={2} mb={3}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor:
                            getDocumentTypeColor(document.type) === 'primary'
                              ? 'primary.main'
                              : getDocumentTypeColor(document.type) === 'info'
                                ? 'info.main'
                                : getDocumentTypeColor(document.type) === 'success'
                                  ? 'success.main'
                                  : 'warning.main'
                        }}
                      >
                        <i className={document.icon} style={{ fontSize: '1.5rem' }} />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant='h6' fontWeight='500'>
                          {document.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {document.type}
                        </Typography>
                      </Box>
                      <Chip
                        label={document.status?.charAt(0)?.toUpperCase() + document.status?.slice(1)}
                        color={getStatusColor(document.status)}
                        size='small'
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={2}>
                      <Box display='flex' justifyContent='space-between' alignItems='center'>
                        <Typography variant='body2' color='text.secondary'>
                          Size
                        </Typography>
                        <Typography variant='body2' fontWeight='500'>
                          {document.size}
                        </Typography>
                      </Box>

                      <Box display='flex' justifyContent='space-between' alignItems='center'>
                        <Typography variant='body2' color='text.secondary'>
                          Uploaded
                        </Typography>
                        <Typography variant='body2' fontWeight='500'>
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box display='flex' gap={1} mt={2}>
                        <Button variant='outlined' size='small' startIcon={<i className='ri-eye-line' />} fullWidth>
                          View
                        </Button>
                        <Button
                          variant='outlined'
                          size='small'
                          startIcon={<i className='ri-download-line' />}
                          fullWidth
                        >
                          Download
                        </Button>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Document Categories */}
      <Grid size={12}>
        <Card>
          <CardHeader title='Required Documents' titleTypographyProps={{ variant: 'h5' }} />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <i className='ri-id-card-line text-primary' style={{ fontSize: '1.5rem' }} />
                    <Typography variant='h6'>Identity Documents</Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    Government-issued ID card, passport, or driving license
                  </Typography>
                  <Chip label='Required' color='error' size='small' />
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <i className='ri-file-text-line text-primary' style={{ fontSize: '1.5rem' }} />
                    <Typography variant='h6'>Proof of Address</Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    Utility bill, bank statement, or rental agreement
                  </Typography>
                  <Chip label='Required' color='error' size='small' />
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <i className='ri-file-certificate-line text-primary' style={{ fontSize: '1.5rem' }} />
                    <Typography variant='h6'>Income Certificate</Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    Employment letter, salary slip, or income certificate
                  </Typography>
                  <Chip label='Required' color='error' size='small' />
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <i className='ri-bank-card-line text-primary' style={{ fontSize: '1.5rem' }} />
                    <Typography variant='h6'>Bank Statement</Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    Last 3 months bank statements
                  </Typography>
                  <Chip label='Optional' color='info' size='small' />
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <i className='ri-file-damage-line text-primary' style={{ fontSize: '1.5rem' }} />
                    <Typography variant='h6'>Additional Documents</Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    Any additional supporting documents
                  </Typography>
                  <Chip label='Optional' color='info' size='small' />
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <i className='ri-upload-line text-primary' style={{ fontSize: '1.5rem' }} />
                    <Typography variant='h6'>Upload New</Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    Upload additional documents for this client
                  </Typography>
                  <Button variant='contained' startIcon={<i className='ri-upload-line' />} fullWidth>
                    Upload Document
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ClientDocuments
