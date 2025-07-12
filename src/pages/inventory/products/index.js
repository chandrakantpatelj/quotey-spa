import Link from 'next/link'
import { useState, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Button, Typography, Box } from '@mui/material'
import { writeData } from 'src/common-functions/GraphqlOperations'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { createAlert } from 'src/store/apps/alerts'
import ItemsListTable from 'src/views/inventory/product/ItemsListTable'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_ITEM, LIST_ITEM, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import useProducts from 'src/hooks/getData/useProducts'
import CommonFileImporter from 'src/common-components/CommonFileImporter'
import { setAddProductsArry, setProductLoading } from 'src/store/apps/products'
import { createItemsMutation } from 'src/@core/components/graphql/item-queries'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'

function Product() {
  const router = useRouter()
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId || null)
  const userProfile = useSelector(state => state.userProfile)
  const [open, setOpen] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const { products, fetchProducts, productsLoading } = useProducts(tenantId)
  const { fetchOtherSettings, otherSettings } = useOtherSettings(tenantId)

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (checkAuthorizedRoute(LIST_ITEM, router, userProfile)) {
        fetchOtherSettings()
        fetchProducts()

        setIsAuthorized(true)
      } else {
        setIsAuthorized(false)
      }
    }
    checkAuthAndFetchData()
  }, [tenantId, userProfile, fetchProducts, fetchOtherSettings])

  if (!isAuthorized) {
    return null
  }

  const columns = [
    { columnName: 'itemName' },
    { columnName: 'itemGroup' },
    { columnName: 'itemDescription' },
    { columnName: 'uom' },
    { columnName: 'sellingPrice' },
    { columnName: 'sellingPriceCurrency' },
    { columnName: 'purchasePrice' },
    { columnName: 'purchasePriceCurrency' }
  ]

  const handleImportedData = async mappedData => {
    const items = mappedData?.map(item => ({
      schemaVersion: SCHEMA_VERSION,
      itemName: item?.itemName,
      itemGroup: item?.itemGroup,
      itemDescription: item?.itemDescription,
      uom: item?.uom,
      sellingPrice: item?.sellingPrice,
      sellingPriceCurrency: item?.sellingPriceCurrency || '',
      purchasePrice: item?.purchasePrice,
      purchasePriceCurrency: item?.purchasePriceCurrency || ''
    }))
    dispatch(setProductLoading(true))
    try {
      const response = await writeData(createItemsMutation(), { tenantId, items })
      if (response.createItems) {
        dispatch(setAddProductsArry(response.createItems))
        dispatch(createAlert({ message: 'Items created successfully !', type: 'success' }))
        setOpen(false)
        router.push('/inventory/products')
      } else {
        setOpen(false)
        dispatch(setProductLoading(false))
        dispatch(createAlert({ message: 'Items creation failed  !', type: 'error' }))
      }
    } catch (error) {
      setOpen(false)
    }
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
            Products
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <CommonFileImporter
              open={open}
              setOpen={setOpen}
              columns={columns}
              handleImportedData={handleImportedData}
            />
            {hasPermission(userProfile, CREATE_ITEM) && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/inventory/products/add-product`}
              >
                Add New
              </Button>
            )}
          </Box>
        }
      />
      <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
        <PageWrapper>
          <ItemsListTable
            productsData={{ products, settings: otherSettings }}
            tenantId={tenantId}
            loading={productsLoading}
          />
        </PageWrapper>{' '}
      </ErrorBoundary>
    </>
  )
}

export default Product
