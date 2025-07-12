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
import { processSalesOrderPackageAsDeliveredMutation } from 'src/@core/components/graphql/sales-order-package-queries'
import { setUpdatePackage } from 'src/store/apps/packages'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'

export default function ProcessAsDelivered({ tenantId, open, setOpen }) {
  const dispatch = useDispatch()

  const { userAccounts } = useUserAccounts()
  const selectedPackage = useSelector(state => state?.packages?.selectedPackages) || {}
  const { reloadSalesOrderInStore } = useSalesOrders(tenantId)
  const packageId = selectedPackage?.packageId
  console.log('packageId', packageId)

  const handleClose = () => {
    setOpen(false)
  }

  const defaultData = {
    packedByUsername: null,
    deliveredByUsername: null,
    deliveryDate: new Date()
  }

  const { control, handleSubmit } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const handleFormSubmit = async data => {
    const packedByUsername = data?.packedByUsername?.username
    const deliveredByUsername = data?.deliveredByUsername?.username
    const deliveryDate = data?.deliveryDate

    try {
      const response = await writeData(processSalesOrderPackageAsDeliveredMutation(), {
        tenantId,
        packageId,
        packedByUsername,
        deliveredByUsername,
        deliveryDate
      })

      if (response.processSalesOrderPackageAsDelivered) {
        dispatch(setUpdatePackage(response.processSalesOrderPackageAsDelivered))
        reloadSalesOrderInStore(response.processSalesOrderPackageAsDelivered.salesOrderId)
        dispatch(createAlert({ message: 'Package deliverd successfully !', type: 'success' }))
        setOpen(false)
      } else {
        dispatch(createAlert({ message: 'Failed to deliver the package !', type: 'error' }))
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
            Process Package As Delivered
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
                  name='deliveredByUsername'
                  control={control}
                  render={({ field }) => (
                    <CustomAutocomplete
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
                      renderInput={params => <CustomTextField {...params} label='Picked By' />}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='packedByUsername'
                  control={control}
                  render={({ field }) => (
                    <CustomAutocomplete
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
                      renderInput={params => <CustomTextField {...params} label='Deliverd By' />}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='deliveryDate'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomDatePicker label={'Date'} fullWidth={true} date={field.value} onChange={field.onChange} />
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
