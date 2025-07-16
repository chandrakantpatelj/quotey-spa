import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import { Backdrop, Box, Button, CircularProgress, FormHelperText, Grid, IconButton, Typography } from '@mui/material'
import PageHeader from 'src/@core/components/page-header'
import { Close } from '@mui/icons-material'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useForm } from 'react-hook-form'
import CustomPhoneInput from 'src/common-components/CustomPhoneInput'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { useDispatch, useSelector } from 'react-redux'
import { createAlert } from 'src/store/apps/alerts'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_USER } from 'src/common-functions/utils/Constants'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { CreateUserAccountMutation } from 'src/@core/components/graphql/user-account-queries'
import { setAddUserAccount } from 'src/store/apps/user'

function AddUser() {
  const router = Router
  const dispatch = useDispatch()
  const [loader, setLoader] = React.useState(false)
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant)

  const { tenantId } = tenant || ''
  const { isRootUser } = userProfile

  const [userData, setUserData] = useState({
    username: '',
    name: '',
    email: '',
    phoneNumber: '',
    tempPassword: ''
  })

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: userData,
    mode: 'onChange'
  })
  const check = () => {
    // firstFieldRef?.current.focus()
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const saveUser = async userAccount => {
    setLoader(true)
    // console.log('user', user)
    const response = await writeData(CreateUserAccountMutation(), { userAccount })
    try {
      if (response.createUserAccount) {
        dispatch(setAddUserAccount(response.createUserAccount))
        dispatch(createAlert({ message: 'User created successfully !', type: 'success' }))
        router.push('/account-settings/user/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'User creation failed  !', type: 'error' }))
      }
    } catch (e) {
      setLoader(false)
      console.error(e)
    }
  }

  const handleCancel = () => {
    router.push('/account-settings/user/')
    reset()
  }

  useEffect(() => {
    if (isRootUser) {
      setIsAuthorized(true)
    } else {
      router.push('/unauthorized')
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            New User Account
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/account-settings/user/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />

      <PageWrapper>
        <form onSubmit={handleSubmit(saveUser)}>
          <Grid container spacing={{ xs: 6 }}>
            <Grid item xs={12} lg={10} xl={9}>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='username'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        id='username'
                        {...field}
                        fullWidth
                        label='User Name'
                        error={Boolean(errors.username)}
                        {...(errors.username && { helperText: 'User name is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        id='name'
                        {...field}
                        fullWidth
                        label='Name'
                        error={Boolean(errors.name)}
                        {...(errors.name && { helperText: 'Name is required' })}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={10} xl={9}>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='email'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        id='email'
                        type='email'
                        {...field}
                        fullWidth
                        label='Email'
                        error={Boolean(errors.email)}
                        {...(errors.email && { helperText: 'Email is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='phoneNumber'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <CustomPhoneInput
                        name='phoneNumber'
                        label='Phone Number'
                        value={value?.phoneNumber}
                        onChange={onChange}
                        error={Boolean(errors.phoneNumber)}
                      />
                    )}
                  />
                  {errors?.phoneNumber?.type === 'required' && (
                    <FormHelperText error>Mobile Number is required</FormHelperText>
                  )}
                  {errors?.phoneNumber?.type === 'validate' && (
                    <FormHelperText error>please enter valid phoneNumber number</FormHelperText>
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={10} xl={9}>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='tempPassword'
                    control={control}
                    rules={{
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        id='tempPassword'
                        {...field}
                        fullWidth
                        label='Temporary Password'
                        error={Boolean(errors.tempPassword)}
                        helperText={errors.tempPassword?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'start' },
              gap: '20px',
              marginTop: { xs: '20px', sm: '50px' }
            }}
          >
            <Button variant='contained' type='submit' onClick={check}>
              Save
            </Button>
            <Button type='reset' variant='outlined' onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </form>
        {loader && (
          <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
            <CircularProgress color='inherit' />
          </Backdrop>
        )}
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default AddUser
