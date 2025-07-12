// src/components/CustomCloseButton.js

import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'

const CustomCloseButton = styled(IconButton)(({ theme }) => ({
  top: 0,
  right: 0,
  padding: '6px !important',
  // color: rgb(66, 66, 66),
  position: 'absolute',
  boxShadow: theme.shadows[1],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '& svg': {
    color: '#424242'
  },
  '&:hover': {
    transform: 'scale(1.1) translate(10px, -10px)'
  }
}))

export default CustomCloseButton
