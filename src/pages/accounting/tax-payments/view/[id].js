import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_TAX_PAYMENT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import useTaxPayments from 'src/hooks/getData/useTaxPayments'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewTaxPayment from 'src/views/accounting/tax-payments/ViewTaxPayment'

function View() {
  const dispatch = useDispatch()
  const router = useRouter()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''

  const { currencies, loading: currenciesLoading } = useCurrencies()
  const { paymentMethods } = usePaymentMethods(tenantId)
  const { taxPayments, loading: paymentsLoading } = useTaxPayments(tenantId)
  const sortedData = dynamicSort(taxPayments, 'paymentNo')

  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)

  const loading = taxAuthorityLoading || currenciesLoading || paymentsLoading
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [taxPaymentsData, setTaxPaymentsData] = useState({})

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_TAX_PAYMENT, router, userProfile)) {
      setIsAuthorized(true)
      setTaxPaymentsData({
        taxPayments: sortedData,
        taxAuthorities,
        paymentMethods,
        currencies
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
      <ViewTaxPayment loading={loading} taxPaymentsData={taxPaymentsData} />
    </ErrorBoundary>
  )
}

export default View
