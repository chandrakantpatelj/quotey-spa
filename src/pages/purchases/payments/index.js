// ** Next Import

import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { Typography, Button } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PurchasePaymentListTable from 'src/views/purchase/Payment/PurchasePaymentListTable'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_PURCHASE_PAYMENT, LIST_PURCHASE_PAYMENT } from 'src/common-functions/utils/Constants'
import { setSelectedVendor } from 'src/store/apps/vendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import usePurchasePayments from 'src/hooks/getData/usePurchasePayment'
import useVendors from 'src/hooks/getData/useVendors'

export const MOBILE_COLUMNS = {
  paymentMethod: false,
  notes: false,
  vendorId: false
}
export const ALL_COLUMNS = {}

const PurchasePayments = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const userProfile = useSelector(state => state.userProfile)

  const [paymentData, setPaymentData] = useState({})
  const { purchasePayments, loading: paymentLoading } = usePurchasePayments(tenantId)
  const { vendors, loading: vendorLoading } = useVendors(tenantId)

  const loading = vendorLoading || paymentLoading

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_PURCHASE_PAYMENT, router, userProfile)) {
      setIsAuthorized(true)
      setPaymentData({
        payments: purchasePayments,
        vendors: vendors
      })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, vendors, purchasePayments, userProfile])

  if (!isAuthorized) {
    return null
  }

  return (
    <>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Payments
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_PURCHASE_PAYMENT) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/purchases/payments/new-payment`}
              onClick={() => dispatch(setSelectedVendor(null))}
            >
              New
            </Button>
          )
        }
      />
      <PageWrapper>
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <PurchasePaymentListTable
            tenantId={tenantId}
            paymentData={paymentData}
            setPaymentData={setPaymentData}
            loading={loading}
          />
        </ErrorBoundary>
      </PageWrapper>
    </>
  )
}

export default PurchasePayments
