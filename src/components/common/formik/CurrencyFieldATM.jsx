// Local imports
import CurrencyInput from './CurrencyInput'

// MUI imports
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'

const CurrencyFieldATM = ({ currencySymbol = '%', ...props }) => (
  <Box sx={{ marginTop: 1, width: '100%' }}>
    <CurrencyInput
      customInput={TextField}
      variant='outlined'
      currencyConfig={{
        locale: 'en-US',
        currencyCode: 'USD',
        currencyDisplay: 'symbol',
        useGrouping: true
      }}
      {...props}
      InputProps={{
        endAdornment: <span>{currencySymbol}</span>
      }}
      fullWidth
    />
  </Box>
)

export default CurrencyFieldATM
