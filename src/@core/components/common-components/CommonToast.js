// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'

import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

// ** Third Party Components
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const CommonToast = props => {
  const { position } = props

  const theme = useTheme()

  return (
    <>
      {/* <Button
      sx={{ mb: 8 }}
      color='success'
      variant='contained'
      onClick={() =>
        toast.success('Successfully toasted!', {
          style: {
            padding: '16px',
            color: theme.palette.primary.main,
            border: `1px solid ${theme.palette.primary.main}`
          },
          iconTheme: {
            primary: theme.palette.primary.main,
            secondary: theme.palette.primary.contrastText
          }
        })
      }
    >
      Success
    </Button> */}
      <Toaster
        position={position}
        toastOptions={{
          className: 'react-hot-toast',
          success: {
            style: {
              //   color: theme.palette.success.main,
              padding: '13px 15px',
              icon: <ErrorOutlineIcon />,
              color: '#fff',
              backgroundColor: hexToRGBA(theme.palette.success.main, 1)
            }
          },
          error: {
            style: {
              //   icon: <ErrorOutlineIcon />,
              padding: '13px 15px',
              icon: <CheckCircleOutlineIcon />,
              color: '#fff',
              backgroundColor: hexToRGBA(theme.palette.error.main, 1)
            }
          }
        }}
      />
    </>
  )
}

export default CommonToast
