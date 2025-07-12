import Link from 'next/link'
import PageHeader from 'src/@core/components/page-header'
import { Typography, Button, LinearProgress, Box } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CommonFileImporter from 'src/common-components/CommonFileImporter'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { writeData } from 'src/common-functions/GraphqlOperations'
import CustomerListTable from 'src/views/sales/customer/CustomerListTable'
import { CREATE_CUSTOMER, LIST_CUSTOMER, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import useCustomers from 'src/hooks/getData/useCustomers'
import { createAlert } from 'src/store/apps/alerts'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { setAddCustomersArry, setCustomerLoading } from 'src/store/apps/customers'
import { CreateCustomersMutation } from 'src/@core/components/graphql/customer-queries'

function Customer() {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const [isAuthorized, setIsAuthorized] = useState(false)
  const { customers, fetchCustomers, customerLoading } = useCustomers(tenantId)

  const [open, setOpen] = useState(null)
  const router = useRouter()
  const dispatch = useDispatch()
  const userProfile = useSelector(state => state.userProfile)

  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      await fetchCustomers()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers])

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_CUSTOMER, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }

  const columns = [
    { columnName: 'customerName' },
    { columnName: 'displayName' },
    { columnName: 'emailAddress' },
    { columnName: 'workPhone' },
    { columnName: 'mobile' },
    { columnName: 'companyName' },
    { columnName: 'currencyId' },
    { columnName: 'shippingPreference' },
    { columnName: 'paymentTerms' }
  ]
  const handleImportedData = async mappedData => {
    const customers = mappedData?.map(item => ({
      schemaVersion: SCHEMA_VERSION,
      customerName: item?.customerName,
      displayName: item?.displayName,
      emailAddress: item?.emailAddress,
      workPhone: item?.workPhone,
      mobile: item?.mobile,
      companyName: item?.companyName,
      currencyId: item?.currencyId,
      shippingPreference: item?.shippingPreference,
      paymentTerms: item?.paymentTerms
    }))

    dispatch(setCustomerLoading(true))
    try {
      const response = await writeData(CreateCustomersMutation(), { tenantId, customers })
      if (response.createCustomers) {
        dispatch(setAddCustomersArry(response.createCustomers))
        dispatch(createAlert({ message: 'Customers created successfully !', type: 'success' }))
        setOpen(false)
        router.push('/sales/customer')
      } else {
        setOpen(false)
        dispatch(setCustomerLoading(false))
        dispatch(createAlert({ message: 'Customers creation failed  !', type: 'error' }))
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
            Customers
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
            {hasPermission(userProfile, CREATE_CUSTOMER) && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/sales/customer/add-customer`}
              >
                Add New
              </Button>
            )}
          </Box>
        }
      />
      <PageWrapper>
        {customerLoading ? (
          <LinearProgress />
        ) : (
          <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
            <CustomerListTable tenantId={tenantId} customerData={{ customers: customers }} />
          </ErrorBoundary>
        )}
      </PageWrapper>
    </>
  )
}

export default Customer
