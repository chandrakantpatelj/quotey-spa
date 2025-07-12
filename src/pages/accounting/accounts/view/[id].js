import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_ACCOUNT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import usePurchasePayments from 'src/hooks/getData/usePurchasePayment'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import useSalesPayments from 'src/hooks/getData/useSalesPayment'
import useVendors from 'src/hooks/getData/useVendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewFinancialAccount from 'src/views/accounting/accounts/ViewfinancialAccount'

function View() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId || null)

  const { financialAccounts, financialAccountloading } = useFinancialAccounts(tenantId)
  const { currencies } = useCurrencies()
  const { fetchSalesOrders } = useSalesOrders(tenantId)
  const { fetchPurchaseOrders } = usePurchaseOrders(tenantId)
  const { fetchSalesPayments } = useSalesPayments(tenantId)
  const { vendors } = useVendors(tenantId)
  const { purchasePayments } = usePurchasePayments(tenantId)
  const [accountData, setAccountData] = useState()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const fetchHooksAPI = async () => {
      if (checkAuthorizedRoute(LIST_ACCOUNT, router, userProfile)) {
        const salesOrders = await fetchSalesOrders()
        const salesPayments = await fetchSalesPayments()
        const purchaseOrders = await fetchPurchaseOrders()

        setIsAuthorized(true)
        setAccountData({
          financialAccounts,
          purchasePayments,
          currencies,
          vendors,
          salesOrders,
          purchaseOrders,
          salesPayments
        })
      } else {
        setIsAuthorized(false)
      }
    }
    fetchHooksAPI()
  }, [tenantId, vendors, userProfile])

  if (!isAuthorized) {
    return null
  }

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewFinancialAccount accountData={accountData} financialAccountloading={financialAccountloading} />
    </ErrorBoundary>
  )
}

export default View
