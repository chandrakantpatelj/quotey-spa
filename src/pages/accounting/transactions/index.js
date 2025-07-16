import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Typography, Button, LinearProgress } from '@mui/material'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useDispatch, useSelector } from 'react-redux'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import AccountTransactionsListTable from 'src/views/accounting/transactions/AccountTransactionsListTable'
import useAccountTransactions from 'src/hooks/getData/useAccountTransactions'
import { CREATE_ACCOUNT_ENTRY, LIST_ACCOUNT_ENTRY } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { useRouter } from 'next/router'

function AcccountTransactions() {
  const router = useRouter()
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const userProfile = useSelector(state => state.userProfile)

  const [transactionsData, setTransactionsData] = useState({})

  const { accountTransactions = [], loading } = useAccountTransactions(tenantId)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const createPermission = hasPermission(userProfile, CREATE_ACCOUNT_ENTRY)

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_ACCOUNT_ENTRY, router, userProfile)) {
      setIsAuthorized(true)
      setTransactionsData({ accountTransactions })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, accountTransactions, userProfile])

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
            Transactions
          </Typography>
        }
        button={
          createPermission && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/accounting/transactions/new`}
            >
              New
            </Button>
          )
        }
      />
      <PageWrapper>
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <AccountTransactionsListTable tenantId={tenantId} transactionsData={transactionsData} loading={loading} />
        </ErrorBoundary>
      </PageWrapper>
    </>
  )
}

export default AcccountTransactions
