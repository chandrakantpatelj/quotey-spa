// ** Next Import
import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Typography, Button } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { CREATE_PURCHASE_ORDER, LIST_PURCHASE_SHIPMENT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { useRouter } from 'next/router'
import ShipmentsListTable from 'src/views/purchase/Shipment/ShipmentsListTable'
import useShipments from 'src/hooks/getData/useShipments'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useVendors from 'src/hooks/getData/useVendors'

function Shipments() {
  const router = useRouter()
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const headerLoader = useSelector(state => state?.otherSettings?.headerLoader)
  const reloadPurchaseShipment = useSelector(state => state?.purchaseShipments.reloadPurchaseShipment)

  //   const { purchaseOrders, loading: shipmentsLoading } = usePurchaseOrders(tenantId)
  const { vendors, loading: vendorsLoading } = useVendors(tenantId)

  const { loading: shipmentsLoading, fetchShipments } = useShipments(tenantId)

  const loading = shipmentsLoading || vendorsLoading

  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)

  const [purchaseShipmentData, setPurchaseShipmentData] = useState({})

  useEffect(() => {
    const callGetShipmentHook = async () => {
      if (checkAuthorizedRoute(LIST_PURCHASE_SHIPMENT, router, userProfile)) {
        setIsAuthorized(true)
        const shipments = await fetchShipments()

        setPurchaseShipmentData({
          vendors,
          shipments
        })
      } else {
        setIsAuthorized(false)
      }
    }
    callGetShipmentHook()
  }, [userProfile, vendors, headerLoader, reloadPurchaseShipment, tenantId, dispatch])

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
            Shipments
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_PURCHASE_ORDER) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/purchases/shipments/add-new`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <ShipmentsListTable
            tenantId={tenantId}
            purchaseShipmentData={purchaseShipmentData}
            setPurchaseShipmentData={setPurchaseShipmentData}
            loading={loading}
          />
        </ErrorBoundary>
      </PageWrapper>
    </>
  )
}

export default Shipments
