import {
  Dialog,
  DialogTitle,
  Alert,
  DialogContent,
  Grid,
  FormHelperText,
  Box,
  Button,
  createFilterOptions
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomCloseButton from './CustomCloseButton'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useForm } from 'react-hook-form'
import CustomPhoneInput from './CustomPhoneInput'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createCustomerMutation } from 'src/@core/components/graphql/customer-queries'
import { useDispatch, useSelector } from 'react-redux'
import { SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { setAddCustomer } from 'src/store/apps/customers'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
export default function AddCustomerPopup({ open, setOpen, setFormValue }) {
  const dispatch = useDispatch()

  const customers = useSelector(state => state.customers?.data || [])

  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const handleClose = () => {
    setOpen(false)
  }

  const defaultData = {
    schemaVersion: SCHEMA_VERSION,
    customerId: '',
    mobile: '',
    emailAddress: ''
  }

  const {
    control,
    watch,
    setValue: setCustomerValue,
    handleSubmit
  } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const selectedCustomer = watch('customerId')

  const handleNewCustomerSave = async data => {
    const customerId = data?.customerId?.customerId
    const typedCustomerName = typeof data?.customerId === 'string' ? data.customerId : null

    if (customerId) {
      const findCustomer = customers?.find(val => val?.customerId === customerId)

      if (findCustomer) {
        setFormValue('customerId', findCustomer)
        setOpen(false)
      }
      return
    }

    if (typedCustomerName) {
      const customer = { ...data, customerName: typedCustomerName }
      delete customer.customerId

      try {
        const response = await writeData(createCustomerMutation(), { tenantId, customer })

        if (response?.createCustomer) {
          dispatch(setAddCustomer(response.createCustomer))
          dispatch(createAlert({ message: 'Customer created successfully!', type: 'success' }))
          setFormValue('customerId', response.createCustomer)
        } else {
          dispatch(createAlert({ message: 'Customer creation failed!', type: 'error' }))
        }

        setOpen(false)
        return response
      } catch (error) {
        console.error('error: ', error)
      }
    }
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth='xs'
      fullWidth
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
          Add New Customer
        </Alert>
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        <form onSubmit={handleSubmit(handleNewCustomerSave)}>
          <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
            <Grid item xs={12}>
              <Controller
                name='customerId'
                control={control}
                rules={{ required: 'Customer  is required' }}
                render={({ field, fieldState: { error } }) => (
                  <CustomAutocomplete
                    freeSolo
                    handleHomeEndKeys
                    options={customers || []}
                    forcePopupIcon
                    value={field.value}
                    onChange={(event, newValue) => {
                      field.onChange(newValue)

                      if (typeof newValue === 'object' && newValue !== null) {
                        setCustomerValue('mobile', newValue?.mobile || '')
                        setCustomerValue('emailAddress', newValue?.emailAddress || '')
                      } else {
                        setCustomerValue('mobile', '')
                        setCustomerValue('emailAddress', '')
                      }
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (newInputValue) {
                        field.onChange(newInputValue)
                        setCustomerValue('mobile', '')
                        setCustomerValue('emailAddress', '')
                      }
                    }}
                    getOptionLabel={option => (typeof option === 'string' ? option : option?.customerName)}
                    renderOption={(props, option) => <li {...props}>{option?.customerName}</li>}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Customer'
                        fullWidth
                        error={Boolean(error)}
                        helperText={error?.message}
                      />
                    )}
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
            {typeof selectedCustomer === 'object' && selectedCustomer?.customerId ? (
              <Button variant='contained' type='submit'>
                OK
              </Button>
            ) : (
              <Button variant='contained' type='submit'>
                Save
              </Button>
            )}
            <Button variant='outlined' type='reset' onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}
