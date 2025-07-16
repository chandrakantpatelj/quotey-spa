import { Alert, Dialog, DialogContent, DialogTitle, LinearProgress, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import useCustomers from 'src/hooks/getData/useCustomers'
import CustomerViewSection from 'src/views/sales/customer/CustomerViewSection'
import CustomCloseButton from './CustomCloseButton'

function CommonCustomerPopup({ customerId, open, setOpen }) {
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const { customers, fetchCustomers, fetchSingleCustomer } = useCustomers(tenantId)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  console.log('customer', customer)
  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      await fetchCustomers()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers])

  const getCustomerObject = async () => {
    setLoading(true)
    const customer = await fetchSingleCustomer(customerId)
    if (customer) {
      setCustomer(customer)
      setLoading(false)
    }
  }

  useEffect(() => {
    getCustomerObject()
  }, [tenantId, customerId])

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      // maxWidth={false}
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
          p: '20px 0px !important',
          maxWidth: '1150px',
          height: '100%',
          width: '100%',
          verticalAlign: 'top'
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Customer Details
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        {loading ? (
          <LinearProgress />
        ) : customer ? (
          <CustomerViewSection customerId={customer?.customerId} defaultTab='overview' />
        ) : (
          <Typography variant='h4' textAlign={'center'}>
            Customer is not available.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CommonCustomerPopup
