import { styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import { Dialog, Button, DialogActions, DialogContent, Alert, DialogTitle, IconButton, Typography } from '@mui/material'
import { sendSalesOrder } from 'src/store/apps/sales'
import { useSelector, useDispatch } from 'react-redux'

const CustomCloseButton = styled(IconButton)(({ theme }) => ({
  top: 0,
  right: 0,
  padding: '6px !important',
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[1],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1) translate(10px, -10px)'
  }
}))

function ResendModal({ order, customer, openModal, setOpenModal }) {
  console.log('Order', order)
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const dispatch = useDispatch()
  const { tenantId } = tenant || ''
  const handleClose = () => {
    setOpenModal(false)
  }
  const handleConfirm = () => {
    const sendTo = customer?.emailAddress
    const sendCC = ''

    sendSalesOrder(tenantId, order?.orderId, sendTo, sendCC, dispatch)
    setOpenModal(false)
  }

  return (
    <>
      <Dialog
        open={openModal}
        disableEscapeKeyDown
        maxWidth='md'
        scroll='body'
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible', p: '20px 0px !important', verticalAlign: 'top' } }}
      >
        <DialogTitle id='alert-dialog-title'>
          <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
            Email of this order will be send to the customer
          </Alert>{' '}
        </DialogTitle>
        <DialogContent sx={{ py: 8 }}>
          <CustomCloseButton onClick={handleClose}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>

          <Typography sx={{ fontSize: '16px', fontWeight: 500, textAlign: 'center', mb: 1 }}>
            {' '}
            {customer?.displayName}
          </Typography>
          <Typography sx={{ fontSize: '14px', fontWeight: 400, textAlign: 'center', color: '#818181' }}>
            {customer?.emailAddress}
          </Typography>
        </DialogContent>
        <DialogActions className='dialog-actions-dense' sx={{ justifyContent: 'center' }}>
          <Button onClick={handleClose} variant='outlined'>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant='contained'>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ResendModal
