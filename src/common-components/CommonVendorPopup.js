import { Typography, Dialog, DialogTitle, Alert, DialogContent, LinearProgress } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import { useEffect, useMemo, useState } from 'react'
import CustomCloseButton from './CustomCloseButton'
import VendorViewSection from 'src/views/purchase/vendor/VendorViewSection'
import { getVendorQuery } from 'src/@core/components/graphql/vendor-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'

function CommonVendorPopup({ vendorId, openVendorDialog, setOpenVendorDialog }) {
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const vendors = useSelector(state => state?.vendors?.data)
  // const { vendors } = useVendors(tenantId)

  const handleClose = () => {
    setOpenVendorDialog(false)
  }
  const getVendorObject = async () => {
    setLoading(true)
    const vendor = vendors?.find(val => val.vendorId === vendorId)

    if (vendor) {
      setVendor(vendor)
      setLoading(false)
      return
    }
    try {
      const response = await fetchData(getVendorQuery(tenantId, vendorId))
      if (response.getVendor) {
        setVendor(response.getVendor || null)
      }
    } catch (e) {
      console.error('Error fetching vendor:', e)
      setVendor(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!vendor) {
      getVendorObject()
    }
  }, [vendors, tenantId, vendorId])

  return (
    <Dialog
      open={openVendorDialog}
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
          Vendor Details
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        {loading ? (
          <LinearProgress />
        ) : vendor ? (
          <VendorViewSection vendorId={vendor?.vendorId} defaultTab='overview' vendors={vendors} />
        ) : (
          <Typography variant='h4' textAlign={'center'}>
            vendor is not available.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CommonVendorPopup
