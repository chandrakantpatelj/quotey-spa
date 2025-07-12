import { useState } from 'react'
import { TableContainer, Dialog, DialogTitle, Alert, DialogContent } from '@mui/material'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import Icon from 'src/@core/components/icon'
import CustomCloseButton from './CustomCloseButton'
import useVendors from 'src/hooks/getData/useVendors'
import NotesTab from 'src/views/purchase/vendor/NotesTab'

function CommonVendorNotesPopup({ vendorId, openVendorNotesDialog, setOpenVendorNOtesDialog }) {
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant
  const { vendors } = useVendors(tenantId)
  const [openDialog, setOpenDialog] = useState(false)
  const [vendorNotesData, setVendorNotesData] = useState([])

  const vendor = useMemo(() => vendors?.find(val => val.vendorId === vendorId || '') || {}, [vendors, vendorId])

  const handleClose = () => {
    setVendorNotesData([])
    setOpenVendorNOtesDialog(false)
  }

  return (
    <Dialog
      open={openVendorNotesDialog}
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
        <Alert
          severity='info'
          sx={{
            color: 'rgba(0,0,0,0.8)'
          }}
        >
          {`Vendor Notes(#${vendor?.vendorNoPrefix ? vendor.vendorNoPrefix : ''}${vendor?.vendorNo})`}
        </Alert>{' '}
      </DialogTitle>

      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>

        <TableContainer>
          <NotesTab vendor={vendor} />
        </TableContainer>
      </DialogContent>
    </Dialog>
  )
}

export default CommonVendorNotesPopup
