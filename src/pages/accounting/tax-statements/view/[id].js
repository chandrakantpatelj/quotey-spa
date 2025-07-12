import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_STATEMENT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewTaxStatement from 'src/views/accounting/tax-statements/ViewTaxStatement'

function View() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const { currencies, loading: currencyLoading } = useCurrencies()
  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)
  const { financialAccounts, financialAccountloading } = useFinancialAccounts(tenantId)

  const loading = currencyLoading || taxAuthorityLoading || financialAccountloading
  const [taxStatementData, setTaxStatementData] = useState({})

  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_STATEMENT, router, userProfile)) {
      setIsAuthorized(true)
      setTaxStatementData({
        currencies: currencies,
        taxAuthorities: taxAuthorities,
        accounts: financialAccounts
      })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile, taxAuthorities, financialAccounts])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewTaxStatement taxStatementData={taxStatementData} loading={loading} />
    </ErrorBoundary>
  )
}

export default View
