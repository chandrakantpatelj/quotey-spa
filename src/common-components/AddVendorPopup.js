import { Dialog, DialogTitle, Alert, DialogContent, Grid, Box, Button } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomCloseButton from './CustomCloseButton'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useForm } from 'react-hook-form'
import CustomPhoneInput from './CustomPhoneInput'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { useDispatch, useSelector } from 'react-redux'
import { SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { createAlert } from 'src/store/apps/alerts'
import { CreateVendorMutation } from 'src/@core/components/graphql/vendor-queries'
import { setAddVendor } from 'src/store/apps/vendors'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

export default function AddVendorPopup({ open, setOpen, setValue }) {
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const { currencies } = useCurrencies()

  const handleClose = () => {
    setOpen(false)
  }

  const defaultData = {
    schemaVersion: SCHEMA_VERSION,
    displayName: '',
    mobile: '',
    emailAddress: '',
    currencyId: '',
    paymentTermsId: 'Due On Receipt',
    shippingPreference: 'Standard'
  }

  const { control, handleSubmit } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const handleNewVendorSave = async data => {
    const vendor = { ...data, currencyId: data?.currencyId?.currencyId }

    try {
      const response = await writeData(CreateVendorMutation(), { tenantId, vendor })
      if (response.createVendor) {
        dispatch(setAddVendor(response.createVendor))
        dispatch(createAlert({ message: 'Vendor created  successfully !', type: 'success' }))
        setValue('vendorId', response.createVendor)
        setOpen(false)
      } else {
        const errorMessage = response?.errors[0] ? response.errors[0].message : 'Vendor creation  failed!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
        setOpen(false)
      }
      return response
    } catch (error) {
      console.error('error: ', error)
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
            Add New Vendor
          </Alert>{' '}
        </DialogTitle>
        <DialogContent sx={{ py: 8 }}>
          <CustomCloseButton onClick={handleClose}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <form onSubmit={handleSubmit(handleNewVendorSave)}>
            <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
              <Grid item xs={12}>
                <Controller
                  name='displayName'
                  control={control}
                  rules={{ required: 'Vendor name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Vendor Name'
                      error={Boolean(error)}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='mobile'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomPhoneInput name='mobile' label='Mobile' value={value} onChange={onChange} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='emailAddress'
                  control={control}
                  render={({ field }) => <CustomTextField {...field} fullWidth label='Email' type='email' />}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='currencyId'
                  control={control}
                  rules={{ required: 'Currency is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomAutocomplete
                      {...field}
                      onChange={(event, newValue) => {
                        field.onChange(newValue)
                      }}
                      options={currencies}
                      getOptionLabel={option => {
                        if (typeof option === 'string') {
                          return option
                        } else return `${option?.currencyId}`
                      }}
                      renderOption={(props, option) => (
                        <Box component='li' {...props}>
                          {option.symbol} - {option.currencyId}
                        </Box>
                      )}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Currency'
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
