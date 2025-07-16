// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Typography, Button } from '@mui/material'
import PurchaseOrderListTable from 'src/views/purchase/purchase-order/PurchaseOrderListTable'
import { useDispatch, useSelector } from 'react-redux'
import { CREATE_PURCHASE_ORDER, LIST_PURCHASE_ORDER } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import useVendors from 'src/hooks/getData/useVendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'

function PurchaseOrder() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { vendors, loading: vendorsLoading } = useVendors(tenantId)
  const { fetchPurchaseOrders, purchaseOrdersLoading } = usePurchaseOrders(tenantId)
  const loading = vendorsLoading || purchaseOrdersLoading
  const userProfile = useSelector(state => state.userProfile)
  const reloadPurchaseOrder = useSelector(state => state.purchaseOrder?.reloadPurchaseOrder)
  const headerLoader = useSelector(state => state?.otherSettings?.headerLoader)

  const [isAuthorized, setIsAuthorized] = useState(false)

  const [purchaseOrderData, setPurchaseOrderData] = useState({})

  useEffect(() => {
    const getPurchaseOrder = async () => {
      if (checkAuthorizedRoute(LIST_PURCHASE_ORDER, router, userProfile)) {
        setIsAuthorized(true)
        const purchaseOrders = await fetchPurchaseOrders()
        setPurchaseOrderData({
          vendors: vendors,
          purchaseOrders: purchaseOrders
        })
      } else {
        setIsAuthorized(false)
      }
    }
    getPurchaseOrder()
  }, [userProfile, vendors, reloadPurchaseOrder, headerLoader, tenantId, dispatch])

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
            Purchase Orders
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
              href={`/purchases/purchase-order/add-purchaseorder`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <PurchaseOrderListTable tenantId={tenantId} purchaseOrderData={purchaseOrderData} loading={loading} />
        </ErrorBoundary>
      </PageWrapper>
    </>
  )
}

export default PurchaseOrder
