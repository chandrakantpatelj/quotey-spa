import { Dialog, DialogTitle, Alert, DialogContent, Grid, Box, Button } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useForm } from 'react-hook-form'
// import CustomPhoneInput from './CustomPhoneInput'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { useDispatch, useSelector } from 'react-redux'
import { createAlert } from 'src/store/apps/alerts'
import CustomCloseButton from 'src/common-components/CustomCloseButton'
import useUserAccounts from 'src/hooks/getData/useUserAccounts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { assignPackageToUserMutation } from 'src/@core/components/graphql/sales-order-package-queries'
import { setUpdatePackage } from 'src/store/apps/packages'

export default function AssigntoUserPopup({ tenantId, open, setOpen }) {
  const dispatch = useDispatch()

  const { userAccounts } = useUserAccounts()
  const selectedPackage = useSelector(state => state?.packages?.selectedPackages) || {}
  const packageId = selectedPackage?.packageId

  const handleClose = () => {
    setOpen(false)
  }

  const defaultData = {
    assignedTo: null
  }

  const { control, handleSubmit } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const handleFormSubmit = async data => {
    const assignedTo = data?.assignedTo?.username

    try {
      const response = await writeData(assignPackageToUserMutation(), { tenantId, packageId, assignedTo })

      if (response.assignPackageToUser) {
        dispatch(setUpdatePackage(response.assignPackageToUser))
        dispatch(createAlert({ message: 'Assigned package to user  successfully !', type: 'success' }))
        setOpen(false)
      } else {
        dispatch(createAlert({ message: 'Failed to assign package !', type: 'error' }))
        setOpen(false)
      }
      return response
    } catch (error) {
      console.log('error: ', error)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        disableEscapeKeyDown
        maxWidth='xs'
        fullWidth={true}
        scroll='paper'
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            overflow: 'visible',
            pt: '10px !important',
            verticalAlign: 'top'
          }
        }}
      >
        <DialogTitle id='alert-dialog-title'>
          <Alert severity='info' icon={false} sx={{ color: 'rgba(0,0,0,0.8)' }}>
            Assign to User
          </Alert>{' '}
        </DialogTitle>
        <DialogContent sx={{ py: 8 }}>
          <CustomCloseButton onClick={handleClose}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
              <Grid item xs={12}>
                <Controller
                  name='assignedTo'
                  control={control}
                  rules={{ required: 'User is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomAutocomplete
                      id='assignedTo'
                      {...field}
                      getOptionLabel={option => option?.name}
                      onChange={(event, newValue) => {
                        field.onChange(newValue)
                      }}
                      isOptionEqualToValue={(option, value) => option.name === value.name}
                      renderOption={(props, option) => (
                        <Box component='li' {...props}>
                          {`${option?.name}`}
                        </Box>
                      )}
                      options={userAccounts}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Assigned to'
                          error={Boolean(error)}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: '10px', md: '20px' },
                marginTop: { xs: '20px', sm: '30px' }
              }}
            >
              <Button variant='contained' type='submit'>
                Save
              </Button>
              <Button variant='outlined' type='reset' onClick={handleClose}>
                Cancel
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
