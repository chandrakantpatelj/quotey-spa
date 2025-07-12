import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Typography, Button, LinearProgress, Box } from '@mui/material'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import VendorListTable from 'src/views/purchase/vendor/VendorsListTable'
import { useDispatch, useSelector } from 'react-redux'
import CommonFileImporter from 'src/common-components/CommonFileImporter'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_VENDOR, LIST_VENDOR, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import useVendors from 'src/hooks/getData/useVendors'
import { createAlert } from 'src/store/apps/alerts'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import { setAddVendorsArry, setLoading } from 'src/store/apps/vendors'
import { CreateVendorsMutation } from 'src/@core/components/graphql/vendor-queries'
import useCurrencies from 'src/hooks/getData/useCurrencies'

function Vendors() {
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant
  const { currencies = [] } = useCurrencies()

  const { vendors, loading } = useVendors(tenantId)
  const userProfile = useSelector(state => state.userProfile)
  const [open, setOpen] = useState(null)
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [vendorData, setVendorData] = useState({})

  useEffect(() => {
    setVendorData({ vendors: vendors, currencies: currencies })
  }, [vendors])

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_VENDOR, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }

  const columns = [
    { columnName: 'displayName' },
    { columnName: 'emailAddress' },
    { columnName: 'workPhone' },
    { columnName: 'mobile' },
    { columnName: 'companyName' },
    { columnName: 'shippingPreference' },
    { columnName: 'currencyId' },
    { columnName: 'paymentTermsId' }
  ]

  const handleImportedData = async mappedData => {
    const tenantId = tenant?.tenantId
    const vendors = mappedData?.map(item => ({
      schemaVersion: SCHEMA_VERSION,
      displayName: item?.displayName,
      emailAddress: item?.emailAddress,
      workPhone: item?.workPhone,
      mobile: item?.mobile,
      companyName: item?.companyName,
      shippingPreference: item?.shippingPreference,
      currencyId: item?.currencyId,
      paymentTermsId: item?.paymentTermsId
    }))
    dispatch(setLoading(true))
    try {
      const response = await writeData(CreateVendorsMutation(), { tenantId, vendors })
      if (response.createVendors) {
        dispatch(setAddVendorsArry(response.createVendors))
        dispatch(createAlert({ message: 'Vendors created successfully !', type: 'success' }))
        setOpen(false)
        router.push('/purchases/vendors')
      } else {
        setOpen(false)
        dispatch(setLoading(false))
        dispatch(createAlert({ message: 'Vendors creation failed  !', type: 'error' }))
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
            Vendors{' '}
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
            {hasPermission(userProfile, CREATE_VENDOR) && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/purchases/vendors/add-vendor`}
              >
                Add New
              </Button>
            )}
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
            <VendorListTable tenantId={tenantId} vendorData={vendorData} />
          </ErrorBoundary>
        )}
      </PageWrapper>
    </>
  )
}

export default Vendors
