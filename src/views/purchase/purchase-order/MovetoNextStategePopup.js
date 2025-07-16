import { Dialog, DialogTitle, Alert, DialogContent, Grid, Box, Button } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { Controller, useForm } from 'react-hook-form'
// import CustomPhoneInput from './CustomPhoneInput'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { useDispatch } from 'react-redux'
import { createAlert } from 'src/store/apps/alerts'
import CustomCloseButton from 'src/common-components/CustomCloseButton'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import { toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import { setActionPurchaseOrder, setLoading, setUpdatePurchaseOrder } from 'src/store/apps/purchaseorder'
import { movePurchaseOrderToNextStageQuery } from 'src/@core/components/graphql/purchase-order-queries'

export default function MovetoNextStategePopup({ tenantId, selectedPurchaseOrder, open, setOpen }) {
  const dispatch = useDispatch()

  const orderId = selectedPurchaseOrder?.orderId

  const handleClose = () => {
    setOpen(false)
  }

  const defaultData = {
    stageDate: selectedPurchaseOrder?.orderDate
  }

  const { control, handleSubmit } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const handleFormSubmit = async data => {
    const stageDate = data?.stageDate

    const stageName = selectedPurchaseOrder?.nextStatus
    dispatch(setLoading(true))

    try {
      const response = await writeData(movePurchaseOrderToNextStageQuery(), { tenantId, orderId, stageName, stageDate })
      if (response.movePurchaseOrderToNextStage) {
        dispatch(setUpdatePurchaseOrder(response.movePurchaseOrderToNextStage))
        dispatch(setActionPurchaseOrder(response.movePurchaseOrderToNextStage))
        dispatch(createAlert({ message: 'Moved Order to Next Stage successfully!', type: 'success' }))
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Failed to move to next stage!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setOpen(false)
      dispatch(setLoading(false))
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
            Move to{' '}
            <span style={{ textTransform: 'capitalize' }}>{toTitleCase(selectedPurchaseOrder?.nextStatus)}</span>
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
                  name='stageDate'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomDatePicker
                      label={'Date'}
                      fullWidth={true}
                      date={field.value ? new Date(field.value) : new Date()}
                      onChange={field.onChange}
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
