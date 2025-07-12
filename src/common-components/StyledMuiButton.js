import React from 'react'
import { Button, Typography } from '@mui/material'

const StyledButton = ({ children, onClick, color, ...props }) => {
  const getColor = val => {
    switch (val) {
      case 'secondary':
        return '#959595 !important'
      case 'primary':
        return theme => theme.palette.primary.main
      case 'dark':
        return theme => theme.palette.secondary.main
      default:
        return theme => theme.palette.primary.main
    }
  }

  return (
    <Button
      type='button'
      onClick={onClick}
      {...props}
      sx={{
        p: '0px',
        fontSize: 'inherit',
        minWidth: 'unset',
        fontWeight: 500,
        textDecoration: 'underline',
        cursor: 'pointer',
        display: 'inline-block',
        wordBreak: 'break-all',
        textAlign: 'left',
        color: color && getColor(color)
      }}
    >
      {children}
    </Button>
  )
}

export default StyledButton
