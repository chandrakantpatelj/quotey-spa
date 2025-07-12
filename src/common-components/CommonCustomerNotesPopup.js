import { Alert, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import useCustomers from 'src/hooks/getData/useCustomers'
import CustomCloseButton from './CustomCloseButton'

import CustomerNoteTab from 'src/views/sales/customer/CustomerNoteTab'

function CommonCustomerNotesPopup({ customerId, openCustomerNotesDialog, setOpenCustomerNOtesDialog }) {
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant || {}
  const { fetchSingleCustomer } = useCustomers(tenantId)
  const [customer, setCustomer] = useState(null)

  useEffect(() => {
    const getCustomerObject = async () => {
      const customer = await fetchSingleCustomer(customerId)
      if (customer) {
        setCustomer(customer)
      }
    }
    getCustomerObject()
  }, [tenantId, customerId])

  const handleClose = () => {
    setOpenCustomerNOtesDialog(false)
  }

  return (
    <Dialog
      open={openCustomerNotesDialog}
      disableEscapeKeyDown
      maxWidth='md'
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
          p: '20px 0px !important',
          height: '100%',
          verticalAlign: 'top'
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Customer Notes
        </Alert>{' '}
      </DialogTitle>

      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        <CustomerNoteTab customer={customer} />
      </DialogContent>
    </Dialog>
  )
}

export default CommonCustomerNotesPopup
