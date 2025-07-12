import Link from 'next/link'
import { useEffect, useState } from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Button, Typography, Box } from '@mui/material'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import FinancialAccountsListTable from 'src/views/accounting/accounts/financialAccountsListTable'
import { CREATE_ACCOUNT, LIST_ACCOUNT, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import CommonFileImporter from 'src/common-components/CommonFileImporter'
import { CreateFinancialAccountsMutation } from 'src/@core/components/graphql/financial-account-queries'
import { createAlert } from 'src/store/apps/alerts'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { addFinancialAccountsArray, setFinancialAccountLoading } from 'src/store/apps/financial-Accounts'

function FinancialAccounts() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant

  const { financialAccounts, financialAccountloading } = useFinancialAccounts(tenantId)
  const [accountData, setAccountData] = useState({})
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_ACCOUNT, router, userProfile)) {
      setIsAuthorized(true)
      setAccountData({ financialAccounts: financialAccounts })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, financialAccounts, userProfile])

  if (!isAuthorized) {
    return null
  }

  const columns = [
    { columnName: 'name' },
    { columnName: 'type' },
    { columnName: 'category' },
    { columnName: 'reportType' },
    { columnName: 'description' },
    { columnName: 'currency' }
  ]

  const handleImportedData = async mappedData => {
    const tenantId = tenant?.tenantId
    const accounts = mappedData?.map(item => ({
      schemaVersion: SCHEMA_VERSION,
      accountName: item?.name,
      accountType: item?.type,
      accountCategory: item?.category,
      reportType: item?.reportType,
      description: item?.description,
      currency: item?.currency
    }))
    dispatch(setFinancialAccountLoading(true))

    try {
      const response = await writeData(CreateFinancialAccountsMutation(), { tenantId, accounts })
      if (response.createFinancialAccounts) {
        dispatch(addFinancialAccountsArray(response.createFinancialAccounts))
        dispatch(createAlert({ message: 'Financial accounts created successfully !', type: 'success' }))
        setOpen(false)
        router.push('/accounting/accounts')
      } else {
        setOpen(false)
        dispatch(setFinancialAccountLoading(false))
        dispatch(createAlert({ message: 'Financial accounts creation failed  !', type: 'error' }))
      }
    } catch (error) {
      setOpen(false)
    }
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
            Accounts
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
            {hasPermission(userProfile, CREATE_ACCOUNT) && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/accounting/accounts/add-accounts`}
              >
                Add New
              </Button>
            )}
          </Box>
        }
      />
      <PageWrapper>
        <FinancialAccountsListTable
          tenantId={tenantId}
          accountData={accountData}
          financialAccountloading={financialAccountloading}
        />
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default FinancialAccounts
