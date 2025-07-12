import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Grid,
  Typography
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { issueTaxInvoiceForSalesOrderMutation } from 'src/@core/components/graphql/sales-order-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomCloseButton from 'src/common-components/CustomCloseButton'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { getLeadDays, parseDate } from 'src/common-functions/utils/UtilityFunctions'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import { createAlert } from 'src/store/apps/alerts'
import { setActionSalesOrder, setUpdateSalesOrder } from 'src/store/apps/sales'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'

export default function IssueTaxInvoicePopUp({ tenantId, open, setOpen }) {
  const dispatch = useDispatch()

  const { paymentTerms } = usePaymentTerms()

  const order = useSelector(state => state.sales?.selectedSalesOrder) || {}
  const orderId = order?.orderId

  const handleClose = () => {
    setOpen(false)
  }

  const defaultData = {
    invoiceDate: order?.orderDate,
    paymentTerms: order?.paymentTerms,
    dueDate: order?.dueDate,
    sendEmail: order?.sendEmail || false,
    emailAddress: order?.emailAddress || ''
  }

  const {
    control,
    setValue,
    watch,
    trigger,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })
  const selectedSendEmailCheckBox = watch('sendEmail')

  const handleFormSubmit = async data => {
    const invoiceDate = parseDate(data?.invoiceDate)
    const paymentTerms = data?.paymentTerms
    const dueDate = parseDate(data?.dueDate)

    try {
      const response = await writeData(issueTaxInvoiceForSalesOrderMutation(), {
        tenantId,
        orderId,
        invoiceDate,
        paymentTerms,
        dueDate,
        sendEmail: data?.sendEmail
      })

      if (response.issueTaxInvoiceForSalesOrder) {
        dispatch(setUpdateSalesOrder(response.issueTaxInvoiceForSalesOrder))
        dispatch(setActionSalesOrder(response.issueTaxInvoiceForSalesOrder))
        dispatch(createAlert({ message: 'Tax invoice issued successfully!', type: 'success' }))
        setOpen(false)
      } else {
        dispatch(createAlert({ message: 'Failed to issue tax invoice!', type: 'error' }))
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
            Issue Tax Invoice
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
                  name='invoiceDate'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomDatePicker
                      label={'Invoice Date'}
                      fullWidth={true}
                      date={field.value ? new Date(field.value) : new Date()}
                      onChange={date => {
                        field.onChange(date)
                      }}
                      error={Boolean(errors?.invoiceDate)}
                    />
                  )}
                />

                {errors?.invoiceDate && <FormHelperText error>Invoice Date is required</FormHelperText>}
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='paymentTerms'
                  control={control}
                  rules={{ required: 'payment Terms is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomAutocomplete
                      id='paymentTerms'
                      {...field}
                      onChange={(event, newValue) => {
                        field.onChange(newValue)
                        const leadDays = getLeadDays(newValue, paymentTerms)
                        if (leadDays > 0) {
                          const newDate = new Date()
                          newDate.setDate(newDate.getDate() + leadDays)
                          setValue('dueDate', newDate)
                        } else if (leadDays === 0) {
                          setValue('dueDate', new Date())
                        } else {
                          setValue('dueDate', null)
                        }
                      }}
                      options={paymentTerms?.map(item => item?.paymentTerms)}
                      getOptionLabel={option => option || ''}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Payment Term'
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
                  name='dueDate'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomDatePicker
                      label={'Due Date'}
                      fullWidth={true}
                      date={field.value ? new Date(field.value) : new Date()}
                      onChange={date => {
                        field.onChange(date)
                      }}
                      error={Boolean(errors?.dueDate)}
                    />
                  )}
                />
                {errors?.dueDate && <FormHelperText error>Due Date is required</FormHelperText>}
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='emailAddress'
                  control={control}
                  rules={{
                    validate: value => {
                      if (selectedSendEmailCheckBox) {
                        if (!value || value.trim() === '') {
                          return 'Email address is required if Send Invoice is checked'
                        }
                      }

                      return true
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      onChange={e => {
                        const newValue = e.target.value
                        field.onChange(newValue)
                        if (newValue && newValue.trim() !== '') {
                          setValue('sendEmail', true, { shouldValidate: true })
                        } else {
                          setValue('sendEmail', false, { shouldValidate: true })
                        }

                        trigger(['emailAddress', 'sendEmail'])
                      }}
                      label='Email Address'
                      error={Boolean(errors.emailAddress)} // Only show error if checkbox is checked
                      helperText={errors.emailAddress?.message || ''}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Controller
                    name='sendEmail'
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        sx={{ p: '4px' }}
                        defaultChecked={field.value}
                        {...field}
                        checked={field.value || false}
                        onChange={e => {
                          const checked = e.target.checked
                          field.onChange(checked)
                          trigger('emailAddress')
                        }}
                      />
                    )}
                  />
                  <Typography sx={{ fontSize: '13px', display: 'flex' }}>Send Invoice</Typography>
                </Box>
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
                {selectedSendEmailCheckBox ? 'Save And Send' : 'Save'}
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
