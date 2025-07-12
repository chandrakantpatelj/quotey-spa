import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_TAX_AUTHORITIES } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useAccountTransactions from 'src/hooks/getData/useAccountTransactions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewAccountEntry from 'src/views/accounting/transactions/ViewAccountEntry'

function View() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { currencies } = useCurrencies()
  const { financialAccounts, financialAccountloading } = useFinancialAccounts(tenantId)
  const { accountTransactions = [], loading: accountTransactionsloading } = useAccountTransactions(tenantId)
  const loading = accountTransactionsloading || financialAccountloading

  const [accountsData, setAccountsData] = useState({})

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_TAX_AUTHORITIES, router, userProfile)) {
      setIsAuthorized(true)
      setAccountsData({
        accounts: financialAccounts,
        accountTransactions: accountTransactions,
        currencies: currencies
      })
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewAccountEntry loading={loading} accountsData={accountsData} />
    </ErrorBoundary>
  )
}

export default View
