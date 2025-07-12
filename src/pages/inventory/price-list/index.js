import Link from 'next/link'
import { useState, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Button, Typography } from '@mui/material'
import PriceListTable from 'src/views/inventory/priceLists/PriceListTable'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuthorizedRoute, dynamicSort, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_PRICE_LIST, LIST_PRICE_LIST } from 'src/common-functions/utils/Constants'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'
import usePriceLists from 'src/hooks/getData/usePriceLists'

function PriceList() {
  // const tenant = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const [priceListData, setPriceListData] = useState([])
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const reloadPriceListsLoader = useSelector(state => state.priceLists?.reloadPriceListsLoader)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const { fetchPriceLists, priceListLoading } = usePriceLists(tenantId)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const dispatch = useDispatch()

  async function getPriceList() {
    const priceLists = await fetchPriceLists()
    const filterData = dynamicSort(priceLists, 'priceListNo') || []
    const distructObject = {
      priceLists: filterData
    }
    setPriceListData(distructObject)
  }

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_PRICE_LIST, router, userProfile)) {
      setIsAuthorized(true)
      getPriceList()
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile, fetchOtherSettings, reloadPriceListsLoader, headerLoader])

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
            Price List
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_PRICE_LIST) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/inventory/price-list/add-price-list`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <PriceListTable
            priceListData={priceListData}
            setPriceListData={setPriceListData}
            tenantId={tenantId}
            loading={priceListLoading}
          />
        </ErrorBoundary>
      </PageWrapper>
    </>
  )
}

export default PriceList
