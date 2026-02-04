// MUI imports
import Typography from '@mui/material/Typography'

const TextError = ({ children }) => {
  return (
    <Typography
      variant='body2'
      sx={{
        color: 'error.main',
        fontSize: theme => theme.typography.caption.fontSize,
        marginTop: 0.25,
        marginLeft: 1.75
      }}
    >
      {children}
    </Typography>
  )
}

export default TextError
