// ** React Imports
import { useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { FormLabel, Grid } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import MuiFormControlLabel from '@mui/material/FormControlLabel'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import LoginSwiper from 'src/views/pages/auth/login/LoginSwiper'
import KeenSliderWrapper from 'src/@core/styles/libs/keen-slider'

// ** Styled Components

const ForgotPassword = () => {
  // ** Hook

  const [values, setValues] = useState({
    password: '',
    showPassword: false
  })

  return (
    <Grid container spacing={0} sx={{ minHeight: '100vh', height: '100%' }}>
      <Grid
        item
        xs={0}
        md={6}
        sx={{
          backgroundColor: 'customColors.bodyBg',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignitems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box>
          <div>
            <KeenSliderWrapper>
              {/* <SwiperControls direction={'rtl'} /> */}
              <LoginSwiper />
            </KeenSliderWrapper>
          </div>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            padding: '30px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 640 }}>
            <Box sx={{ width: 233, height: 44, overflow: 'hidden', marginBottom: '4rem' }}>
              <img
                src='/warehouse-img/logo.png'
                s
                alt='user-img'
                style={{ width: '100%', height: '100%', objectFit: 'fill' }}
              />{' '}
            </Box>
            <Box sx={{ mb: '3rem' }}>
              <Typography sx={{ fontSize: '21px', fontWeight: 700 }}>Forgot Password? </Typography>
              <Typography sx={{ fontSize: '15px', color: '#9F9F9F' }}>
                Enter your email and we′ll send you instructions to reset your password
              </Typography>
            </Box>

            <form noValidate autoComplete='off'>
              <FormLabel focused required sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '30px' }}>
                Email
              </FormLabel>
              <CustomTextField
                autoFocus
                hiddenLabel
                fullWidth
                id='email'
                sx={{ mb: 6 }}
                placeholder='Enter your email'
              />

              <Button type='submit' variant='contained' sx={{ maxWidth: '250px', width: '100%', mb: '10px' }}>
                Send reset link
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                <Link
                  href='/login'
                  style={{
                    color: '#157AFE',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronLeftIcon /> Back to login
                </Link>
              </Box>
            </form>
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}
ForgotPassword.getLayout = page => <BlankLayout>{page}</BlankLayout>
ForgotPassword.guestGuard = false

export default ForgotPassword
