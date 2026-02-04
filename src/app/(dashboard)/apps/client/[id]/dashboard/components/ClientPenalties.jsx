'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Chip,
  TablePagination,
  CircularProgress,
  Alert
} from '@mui/material'

// Third-party Imports
import classnames from 'classnames'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const ClientPenalties = ({ penalties = [], isLoading = false, error = null }) => {
  // Use real data if available, otherwise fallback to hardcoded data
  const penaltiesData = penalties

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getCategoryColor = category => {
    switch (category?.toLowerCase()) {
      case 'minor':
        return 'warning'
      case 'major':
        return 'error'
      case 'critical':
        return 'error'
      default:
        return 'info'
    }
  }

  const getPenaltyTypeColor = penaltyType => {
    switch (penaltyType?.toLowerCase()) {
      case 'rule_violation':
        return 'error'
      case 'late_payment':
        return 'warning'
      case 'attendance':
        return 'info'
      default:
        return 'primary'
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
            <CircularProgress size={40} />
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error' sx={{ mb: 2 }}>
            Failed to load penalties: {error?.message || 'Unknown error'}. Please try again.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Divider />

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Penalty Name</th>
              <th>Penalty Code</th>
              <th>Penalty Type</th>
              <th>Category</th>
              <th>Calculation Type</th>
              <th>Base Amount</th>
            </tr>
          </thead>
          <tbody>
            {penaltiesData.length === 0 ? (
              <tr>
                <td colSpan={7} className='text-center'>
                  No penalty records found
                </td>
              </tr>
            ) : (
              penaltiesData.map((row, index) => (
                <tr key={row._id}>
                  <td>{index + 1}</td>
                  <td>{row.penaltyName}</td>
                  <td>
                    <Chip label={row.penaltyCode} color='primary' variant='outlined' size='small' />
                  </td>
                  <td>
                    <Chip
                      label={row.penaltyType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      color={getPenaltyTypeColor(row.penaltyType)}
                      variant='outlined'
                      size='small'
                    />
                  </td>
                  <td>
                    <Chip
                      label={row.category?.charAt(0)?.toUpperCase() + row.category?.slice(1)}
                      color={getCategoryColor(row.category)}
                      variant='outlined'
                      size='small'
                    />
                  </td>
                  <td>
                    <Chip
                      label={row.calculationType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      color='info'
                      variant='outlined'
                      size='small'
                    />
                  </td>
                  <td>
                    <Chip label={`LKR ${row.baseAmount}`} color='success' variant='outlined' size='small' />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        className='border-bs'
        count={penaltiesData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' }
        }}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  )
}

export default ClientPenalties
