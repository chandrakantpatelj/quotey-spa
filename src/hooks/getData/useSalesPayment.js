import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getSalesInvoicePaymentQuery,
  getSalesInvoicePaymentsByDateRangeQuery
} from 'src/@core/components/graphql/sales-payment-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import { setAllSalesPayments, setError, setLoading } from 'src/store/apps/payments'
import useOtherSettings from './useOtherSettings'

const useSalesPayments = tenantId => {
  const dispatch = useDispatch()

  const salesPayments = useSelector(state => state.salesPayments?.data || [])
  const salesPaymentLoading = useSelector(state => state.salesPayments?.salesPaymentLoading)
  const error = useSelector(state => state.salesPayments?.error || null)
  const reloadSalesPaymentLoader = useSelector(state => state.salesPayments?.reloadSalesPaymentLoader)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const { fetchOtherSettings } = useOtherSettings(tenantId)

  const fetchSalesPayments = useCallback(
    async (startDateParam, endDateParam) => {
      const fetchSalesPaymentFromApi = salesPayments.length === 0

      if (!tenantId) return []

      const shouldUseDefaultDates = !startDateParam && !endDateParam
      if (!fetchSalesPaymentFromApi && shouldUseDefaultDates) return salesPayments

      dispatch(setLoading(true))

      try {
        const otherSettings = await fetchOtherSettings()
        const startDate = startDateParam || lastMonthDate(otherSettings?.moduleFilterDateDuration)
        const endDate = endDateParam || new Date()

        const response = await fetchData(getSalesInvoicePaymentsByDateRangeQuery(tenantId, startDate, endDate))
        const allSalesPayments = response?.getSalesInvoicePaymentsByDateRange || []

        // Only update store if it's a default fetch
        if (shouldUseDefaultDates) {
          dispatch(setAllSalesPayments(allSalesPayments))
        }

        return allSalesPayments
      } catch (err) {
        console.error(err)
        dispatch(setError?.('Failed to fetch sales payments'))
        return []
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, fetchOtherSettings, dispatch, reloadSalesPaymentLoader, headerLoader]
  )
  const fetchSalesPayment = useCallback(
    async paymentId => {
      if (!paymentId) return null
      const existingPayments = salesPayments.find(payment => payment.paymentId === paymentId)
      if (existingPayments) return existingPayments
      try {
        dispatch(setLoading(true))
        const response = await fetchData(getSalesInvoicePaymentQuery(tenantId, paymentId))

        const salePayment = response.getSalesInvoicePayment || null

        return salePayment
      } catch (err) {
        dispatch(setError('Failed to fetch order'))
        console.error(err)
        return null
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, salesPayments, dispatch]
  )
  return { salesPaymentLoading, error, fetchSalesPayments, fetchSalesPayment, reloadSalesPaymentLoader }
}

export default useSalesPayments
