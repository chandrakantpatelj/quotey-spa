import Link from 'next/link'

import { useState, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Typography, Button, LinearProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import WarehouseListTable from 'src/views/settings/warehouses/WarehouseListTable'
import { useDispatch, useSelector } from 'react-redux'
import { CREATE_WAREHOUSE, LIST_WAREHOUSE } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'

function Warehouses() {
  const userProfile = useSelector(state => state.userProfile)

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const dispatch = useDispatch()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const { warehouses, loading } = useWarehouses(tenantId)

  const [warehousesObject, setWarehousesObject] = useState({ warehouses: [] })

  useEffect(() => {
    setWarehousesObject({ warehouses })
  }, [warehouses])

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_WAREHOUSE, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Warehouses
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_WAREHOUSE) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/account-settings/warehouses/add-warehouse`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <WarehouseListTable
            tenantId={tenantId}
            warehousesObject={warehousesObject}
            setWarehousesObject={setWarehousesObject}
          />
        )}
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default Warehouses
