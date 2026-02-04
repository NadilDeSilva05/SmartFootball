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

const SaveFingerprintModal = ({ open, setOpen, data }) => {
  console.log('save fingerprint data', data)
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

  const handleClose = () => {
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
  }

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

  // Convert Buffer/object to array if needed
  const getTemplateArray = (fingerprintData) => {
    if (!fingerprintData) return null
    
    // If it's already an array, return it
    if (Array.isArray(fingerprintData)) {
      return fingerprintData
    }
    
    // If it's a Buffer object with data property
    if (fingerprintData.data && Array.isArray(fingerprintData.data)) {
      return fingerprintData.data
    }
    
    // If it's a Buffer-like object with type 'Buffer'
    if (fingerprintData.type === 'Buffer' && Array.isArray(fingerprintData.data)) {
      return fingerprintData.data
    }
    
    // If it's a string (base64 encoded), try to decode it
    if (typeof fingerprintData === 'string') {
      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(fingerprintData)
        if (Array.isArray(parsed)) return parsed
        if (parsed.data && Array.isArray(parsed.data)) return parsed.data
      } catch {
        // If not JSON, try base64 decode
        try {
          const decoded = atob(fingerprintData)
          return Array.from(decoded).map(char => char.charCodeAt(0))
        } catch {
          console.error('Failed to decode fingerprint data')
          return null
        }
      }
    }
    
    return null
  }

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
      setError('Client unique ID is required')
      return
    }

    const templateArray = getTemplateArray(data?.fingerprintData)
    if (!templateArray || templateArray.length === 0) {
      setError('No fingerprint template data available for this client')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/fingerprint/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: data.clientId,
          deviceId: selectedDevice,
          uniqueId: data.uniqueId,
          template: templateArray
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Server responded with ${response.status}`)
      }

      console.log('Fingerprint template saved successfully:', result)
      setSuccess(true)

      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (err) {
      console.error('Error saving fingerprint template:', err)
      setError(err.message || 'Failed to save fingerprint template to device')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if fingerprint data exists
  const hasFingerprintData = data?.fingerprintData && getTemplateArray(data?.fingerprintData)?.length > 0

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
        Save Fingerprint to Device
        <Typography component='span' className='flex flex-col text-center'>
          Upload fingerprint template for {data?.clientName || 'client'} to device
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          <Grid container spacing={5}>
            {/* Client Information */}
            <Grid item size={12}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    <i className='ri-user-line' style={{ marginRight: '8px' }} />
                    Client Information
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Client ID: {data?.clientId || 'Not available'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Client Name: {data?.clientName || 'Not available'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Unique ID: {data?.uniqueId !== undefined ? data.uniqueId : 'Not available'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Fingerprint Template: {hasFingerprintData ? 
                      <span style={{ color: 'green' }}>✓ Available ({getTemplateArray(data?.fingerprintData)?.length} bytes)</span> : 
                      <span style={{ color: 'red' }}>✗ Not available</span>
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Info Alert */}
            <Grid item size={12}>
              <Alert severity='info' sx={{ fontFamily: 'sans-serif' }}>
                <strong>Info:</strong> This will upload the stored fingerprint template from the database to the selected device. 
                The client will be able to use fingerprint authentication on this device after the upload.
              </Alert>
            </Grid>

            {/* No Template Warning */}
            {!hasFingerprintData && (
              <Grid item size={12}>
                <Alert severity='warning' sx={{ fontFamily: 'sans-serif' }}>
                  <strong>Warning:</strong> No fingerprint template found in the database for this client. 
                  Please register the client's fingerprint first using "Add Fingerprint" before trying to save it to a device.
                </Alert>
              </Grid>
            )}

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
                <Alert severity='success'>Fingerprint template saved to device successfully!</Alert>
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
            color='success'
            type='submit'
            disabled={!selectedDevice || isSubmitting || !isConnected || !hasFingerprintData}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <i className='ri-upload-cloud-line' />}
          >
            {isSubmitting ? 'Saving to Device...' : 'Save to Device'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SaveFingerprintModal

