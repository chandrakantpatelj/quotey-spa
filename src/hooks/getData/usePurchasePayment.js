import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getPurchaseOrderPaymentsByDateRangeQuery } from 'src/@core/components/graphql/purchases-payment-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllPoPayments, setPOPaymentLoading, setError } from 'src/store/apps/purchases-payment'
import useOtherSettings from './useOtherSettings'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'

const usePurchasePayments = tenantId => {
  const dispatch = useDispatch()
  const purchasePayments = useSelector(state => state.purchasesPayment?.data || [])
  const loading = useSelector(state => state.purchasesPayment?.loading || false)
  const error = useSelector(state => state.purchasesPayment?.error || null)
  const fetchPurchasePaymentFromApi = purchasePayments?.length === 0
  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadPurchasePayment = useSelector(state => state.purchasesPayment?.reloadPurchasePayment)

  useEffect(() => {
    const fetchPurchasePayments = async () => {
      if (fetchPurchasePaymentFromApi && tenantId) {
        const otherSettings = await fetchOtherSettings()

        const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
        const endDate = new Date()
        dispatch(setPOPaymentLoading(true))
        try {
          const response = await fetchData(getPurchaseOrderPaymentsByDateRangeQuery(tenantId, startDate, endDate))
          const allpurchasePayments = response?.getPurchaseOrderPaymentsByDateRange
          dispatch(setAllPoPayments(allpurchasePayments))
        } catch (error) {
          dispatch(setError('Failed to fetch purchase payments'))
          console.error(error)
        }
      }
    }

    fetchPurchasePayments()
  }, [tenantId, dispatch, reloadPurchasePayment, headerLoader, fetchOtherSettings])
  return { purchasePayments, loading, error }
}
export default usePurchasePayments
