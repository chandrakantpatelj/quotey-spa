import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Typography, Button, Box, Tooltip, IconButton } from '@mui/material'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useDispatch, useSelector } from 'react-redux'
import useAdjustments from 'src/hooks/getData/useAdjustments'
import { Refresh } from '@mui/icons-material'
import { resetStock } from 'src/store/apps/stock-adjustments'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import StockAdjustmentListTable from 'src/views/inventory/stockAdjutments/StockAdjustmentListTable'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import Router from 'next/router'
import { LIST_STOCK } from 'src/common-functions/utils/Constants'

function StockAdjustments() {
  const dispatch = useDispatch()
  const route = Router
  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant
  const { stockAdjustments, loading: stockLoading } = useAdjustments(tenantId)
  const { warehouses, loading: warehouseLoading } = useWarehouses(tenantId)
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const loading = stockLoading || warehouseLoading

  const [adjutmentsData, setAdjutmentsData] = useState({})

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_STOCK, route, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  useEffect(() => {
    setAdjutmentsData({ stockAdjustments: stockAdjustments, warehouses: warehouses })
  }, [tenantId, stockAdjustments, warehouses])
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
            Stock Adjustments{' '}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title='Reload' placement='top'>
              <IconButton
                color='default'
                size='small'
                onClick={() => {
                  dispatch(resetStock())
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/inventory/stock-adjustments/new`}
            >
              New
            </Button>
          </Box>
        }
      />
      <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
        <PageWrapper>
          <StockAdjustmentListTable tenantId={tenantId} adjutmentsData={adjutmentsData} loading={loading} />
        </PageWrapper>
      </ErrorBoundary>
    </>
  )
}

export default StockAdjustments
