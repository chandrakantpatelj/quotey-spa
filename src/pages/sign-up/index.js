// ** React Imports
import { useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import { FormLabel, Grid } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel from '@mui/material/FormControlLabel'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import LoginSwiper from 'src/views/pages/auth/login/LoginSwiper'
import KeenSliderWrapper from 'src/@core/styles/libs/keen-slider'

// ** Styled Components

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    color: theme.palette.text.secondary
  }
}))

const SignUpPage = () => {
  // ** Hook

  const [values, setValues] = useState({
    password: '',
    showPassword: false
  })

  const handleChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

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
                alt='user-img'
                style={{ width: '100%', height: '100%', objectFit: 'fill' }}
              />{' '}
            </Box>
            <Box sx={{ mb: '3rem' }}>
              <Typography sx={{ fontSize: '21px', fontWeight: 700 }}>Sign Up</Typography>
            </Box>

            <form noValidate autoComplete='off'>
              <FormLabel focused required sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '30px' }}>
                Username
              </FormLabel>
              <CustomTextField
                autoFocus
                hiddenLabel
                fullWidth
                id='username'
                sx={{ mb: 4 }}
                // placeholder='Enter your email'
              />
              <FormLabel focused required sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '30px' }}>
                Email
              </FormLabel>
              <CustomTextField
                autoFocus
                hiddenLabel
                fullWidth
                id='email'
                sx={{ mb: 4 }}
                // placeholder='Enter your email'
              />
              <FormLabel focused required sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '30px' }}>
                Password
              </FormLabel>
              <CustomTextField
                fullWidth
                sx={{ mb: 1.5 }}
                // label='Password'
                value={values.password}
                id='auth-login-password'
                placeholder='············'
                onChange={handleChange('password')}
                type={values.showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle password visibility'
                      >
                        <Icon fontSize='1.25rem' icon={values.showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Box
                sx={{
                  mb: 1.75,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#9F9F9F'
                }}
              >
                <FormControlLabel control={<Checkbox />} color='secondary' label='I agree to privacy policy & terms' />
              </Box>
              <Button type='submit' variant='contained' sx={{ mb: '15px' }}>
                Sign Up
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                <Typography sx={{ color: 'text.secondary', mr: 2 }}>Already have an account?</Typography>
                <Link
                  href='/login'
                  style={{
                    color: '#157AFE',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '28px'
                  }}
                >
                  Sign in instead
                </Link>
              </Box>
            </form>
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}
SignUpPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
SignUpPage.guestGuard = false

export default SignUpPage
