import React from 'react'
import { Container, Typography, Button, Box } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import Link from 'next/link'

const UnauthorizedPage = () => {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 87px)',
        textAlign: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4
        }}
      >
        <LockIcon sx={{ fontSize: 80, color: '#d32f2f' }} />
        <Typography variant='h4' sx={{ mt: 2, fontWeight: 'bold' }}>
          Access Denied
        </Typography>
        <Typography variant='body1' sx={{ mt: 2, color: '#555' }}>
          You do not have permission to view this page.
        </Typography>
      </Box>

      <Button
        variant='contained'
        color='primary'
        href={`/`}
        component={Link}
        sx={{
          textTransform: 'none',
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#1565c0'
          }
        }}
      >
        Back to Home
      </Button>
    </Container>
  )
}

export default UnauthorizedPage
