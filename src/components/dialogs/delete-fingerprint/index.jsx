'use client'

// React Imports
import { useState, useEffect, useCallback, useRef } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { handleModals } from '@/redux'

const DeleteFingerprintModal = ({ open, setOpen, data }) => {
  console.log('delete fingerprint data', data)
  // States
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const eventSourceRef = useRef(null)
  const closeTimeoutRef = useRef(null)

  const dispatch = useDispatch()
  
  // Get fingerprintDevice from authenticationReducer
  const fingerprintDevice = useSelector(
    state => state?.authenticationReducer?.loginData?.user?.fingerprintDevice
  )
  const userDeviceCode = fingerprintDevice?.deviceCode || null

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleClose = useCallback(() => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    
    setOpen(false)
    setSelectedDevice('')
    setError('')
    setSuccess(false)
    setIsLoading(false)
    setIsSubmitting(false)
    setIsConnected(false)

    // Clean up SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [setOpen])

  // Connect to SSE for device updates
  const connectToSseProxy = useCallback(() => {
    if (!isClient || typeof window === 'undefined') return

    setIsLoading(true)
    setError('')
    setIsConnected(false)

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      console.log('Connecting to Next.js SSE proxy at /api/devices...')
      const eventSource = new EventSource('/api/devices')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('Proxy SSE connection established.')
        setIsConnected(true)
        setIsLoading(false)
      }

      eventSource.onmessage = event => {
        try {
          console.log('Received SSE data via proxy:', event.data)
          const deviceData = JSON.parse(event.data)
          const allDevices = Array.isArray(deviceData) ? deviceData : [deviceData]
          
          // Filter devices based on user's deviceCode if available
          const filteredDevices = userDeviceCode
            ? allDevices.filter(device => {
                // Match device if it equals the deviceCode or contains it
                const deviceId = typeof device === 'string' ? device : device?.id || device?.deviceCode || device
                return deviceId === userDeviceCode || String(deviceId).includes(userDeviceCode)
              })
            : allDevices
          
          setDevices(filteredDevices)
          setError('')
        } catch (err) {
          console.error('Error parsing device data:', err)
          setError('Failed to parse device data.')
        }
      }

      eventSource.onerror = err => {
        console.error('Proxy SSE Error:', err)
        setError('Connection to server failed. It might be offline.')
        setIsConnected(false)
        setIsLoading(false)
        eventSource.close()
      }
    } catch (err) {
      console.error('Error creating EventSource:', err)
      setError('Failed to establish connection.')
      setIsLoading(false)
    }
  }, [isClient, userDeviceCode])

  // Fetch devices via API route (alternative to SSE)
  const fetchDevicesViaApi = useCallback(async () => {
    if (!isClient) return

    setIsLoading(true)
    setError('')
    setIsConnected(false)

    try {
      console.log('Fetching devices via API route...')
      const response = await fetch('/api/fingerprint/devices')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to fetch devices: ${response.status}`)
      }

      const allDevices = result.devices || []
      
      // Filter devices based on user's deviceCode if available
      const filteredDevices = userDeviceCode
        ? allDevices.filter(device => {
            // Match device if it equals the deviceCode or contains it
            const deviceId = typeof device === 'string' ? device : device?.id || device?.deviceCode || device
            return deviceId === userDeviceCode || String(deviceId).includes(userDeviceCode)
          })
        : allDevices
      
      setDevices(filteredDevices)
      setIsConnected(true)
      setError('')
      console.log('Devices fetched successfully:', filteredDevices)
      console.log('User deviceCode:', userDeviceCode)
    } catch (err) {
      console.error('Error fetching devices via API:', err)
      setError(err.message || 'Failed to fetch devices')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [isClient, userDeviceCode])

  // Connect when modal opens
  useEffect(() => {
    if (open && isClient) {
      connectToSseProxy()
    }

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        console.log('Cleaning up SSE connection.')
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [open, isClient, connectToSseProxy])

  const handleSubmit = async e => {
    e.preventDefault()

    if (!selectedDevice) {
      setError('Please select a device')
      return
    }

    if (!data?.clientId) {
      setError('Client ID is required')
      return
    }

    if (data?.uniqueId === undefined || data?.uniqueId === null) {
      setError('Client unique ID is required for fingerprint deletion')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/fingerprint/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: data.clientId,
          deviceId: selectedDevice,
          uniqueId: data.uniqueId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Server responded with ${response.status}`)
      }

      console.log('Fingerprint deletion successful:', result)
      setSuccess(true)

      closeTimeoutRef.current = setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (err) {
      console.error('Error deleting fingerprint:', err)
      setError(err.message || 'Failed to delete fingerprint')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render anything until we're on the client
  if (!isClient) {
    return null
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle
        variant='h4'
        className='flex flex-col gap-2 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Delete Fingerprint
        <Typography component='span' className='flex flex-col text-center'>
          Remove fingerprint for {data?.clientName || 'client'} from device
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          <Grid container spacing={5}>
            {/* Connection Status */}
            <Grid item size={12}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    <i className='ri-wifi-line' style={{ marginRight: '8px' }} />
                    Connection Status
                  </Typography>

                  <Box display='flex' alignItems='center' gap={2} mb={2} flexWrap='wrap'>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<i className='ri-refresh-line' />}
                      onClick={connectToSseProxy}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Connecting...' : 'Live Updates (SSE)'}
                    </Button>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<i className='ri-download-line' />}
                      onClick={fetchDevicesViaApi}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Fetching...' : 'Fetch Devices (API)'}
                    </Button>
                    {isLoading && <CircularProgress size={20} />}
                    {isConnected && (
                      <Alert severity='success' sx={{ display: 'inline-flex', p: 0.5 }}>
                        Connected
                      </Alert>
                    )}
                    {!isConnected && !isLoading && (
                      <Alert severity='warning' sx={{ display: 'inline-flex', p: 0.5 }}>
                        Not Connected
                      </Alert>
                    )}
                  </Box>

                  <Typography variant='body2' color='text.secondary'>
                    {isConnected
                      ? 'Connected and listening for live device updates.'
                      : 'Disconnected from device server. Please refresh to reconnect.'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Error and Success Messages */}
            {error && (
              <Grid item size={12}>
                <Alert severity='error' onClose={() => setError('')}>
                  {error}
                </Alert>
              </Grid>
            )}

            {success && (
              <Grid item size={12}>
                <Alert severity='success'>Fingerprint deleted successfully!</Alert>
              </Grid>
            )}

            {/* Device Selection */}
            <Grid item size={12}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    <i className='ri-device-line' style={{ marginRight: '8px' }} />
                    Available Devices ({devices.length})
                  </Typography>
                  
                  {userDeviceCode && (
                    <Alert severity='info' sx={{ mb: 2, fontFamily: 'sans-serif' }}>
                      Showing devices matching your configured device code: <strong>{userDeviceCode}</strong>
                    </Alert>
                  )}

                  {devices.length > 0 ? (
                    <FormControl fullWidth>
                      <InputLabel>Select Device</InputLabel>
                      <Select
                        value={selectedDevice}
                        label='Select Device'
                        onChange={e => setSelectedDevice(e.target.value)}
                        disabled={isSubmitting}
                        sx={{ fontFamily: 'sans-serif', '& *': { fontFamily: 'sans-serif' } }}
                      >
                        {devices.map((deviceId, index) => {
                          const deviceValue = typeof deviceId === 'string' ? deviceId : deviceId?.id || deviceId?.deviceCode || deviceId
                          const deviceLabel = typeof deviceId === 'object' && deviceId?.name 
                            ? deviceId.name 
                            : `Device ${deviceValue || index + 1}`
                          
                          return (
                            <MenuItem key={deviceValue || index} value={deviceValue}>
                              {deviceLabel} {userDeviceCode && deviceValue === userDeviceCode && '(Your Device)'}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  ) : (
                    <Alert severity='info' sx={{ fontFamily: 'sans-serif' }}>
                      {isLoading
                        ? 'Connecting to device server...'
                        : userDeviceCode
                        ? `No devices found matching device code: ${userDeviceCode}. Please ensure the device server is running and the device code matches.`
                        : 'No devices available. Please ensure the device server is running and try again.'}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
          <Button
            variant='contained'
            color='error'
            type='submit'
            disabled={!selectedDevice || isSubmitting || !isConnected}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <i className='ri-delete-bin-line' />}
          >
            {isSubmitting ? 'Deleting Fingerprint...' : 'Delete Fingerprint'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default DeleteFingerprintModal

