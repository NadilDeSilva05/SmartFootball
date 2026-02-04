'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Typography, Box } from '@mui/material'

// Component Imports
import CreateLoanModal from '@/components/CreateLoanModal'

const LoanModalExample = () => {
  const [openModal, setOpenModal] = useState(false)

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  // Example client data
  const exampleClientId = '64f8a1b2c3d4e5f6a7b8c9d0'
  const exampleClientName = 'John Doe'

  return (
    <Card>
      <CardHeader title='Create Loan Modal Example' titleTypographyProps={{ variant: 'h5' }} />
      <CardContent>
        <Typography variant='body1' sx={{ mb: 3 }}>
          This example demonstrates how to use the CreateLoanModal component with Redux integration.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Features:
          </Typography>
          <ul>
            <li>✅ MUI 7 compatible Dialog component</li>
            <li>✅ Formik form with Yup validation</li>
            <li>✅ Redux integration with loanSlice</li>
            <li>✅ Currency input fields with formatting</li>
            <li>✅ Date picker components</li>
            <li>✅ Conditional field validation</li>
            <li>✅ Loading states and error handling</li>
          </ul>
        </Box>

        <Button
          variant='contained'
          size='large'
          startIcon={<i className='ri-bank-card-line' />}
          onClick={handleOpenModal}
        >
          Open Create Loan Modal
        </Button>

        {/* Create Loan Modal */}
        <CreateLoanModal
          open={openModal}
          handleClose={handleCloseModal}
          clientId={exampleClientId}
          clientName={exampleClientName}
        />
      </CardContent>
    </Card>
  )
}

export default LoanModalExample
