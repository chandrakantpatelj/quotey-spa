import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getSalesInvoiceQuery,
  getSalesInvoicesByDateRangeQuery
} from 'src/@core/components/graphql/sales-invoice-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import { setAllInvoices, setError, setInvoiceLoading, setUpdateInvoice } from 'src/store/apps/sales-invoices'
import useOtherSettings from './useOtherSettings'

const useSalesInvoices = tenantId => {
  const dispatch = useDispatch()
  const salesInvoices = useSelector(state => state.salesInvoices?.data || [])
  const salesInvoiceLoading = useSelector(state => state.salesInvoices?.salesInvoiceLoading || false)
  const reloadInvoiceLoader = useSelector(state => state.salesInvoices?.reloadInvoiceLoader)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const error = useSelector(state => state.salesInvoices?.error || null)
  const { fetchOtherSettings } = useOtherSettings(tenantId)

  const callGetSaleInvoiceQuery = async (startDate, endDate) => {
    const response = await fetchData(getSalesInvoicesByDateRangeQuery(tenantId, startDate, endDate))
    return response?.getSalesInvoicesByDateRange || []
  }

  const fetchSalesInvoices = useCallback(
    async (startDateParam, endDateParam) => {
      if (!tenantId) return []
      if (salesInvoices.length) return salesInvoices
      const otherSettings = await fetchOtherSettings()

      const startDate = startDateParam || lastMonthDate(otherSettings?.moduleFilterDateDuration)
      const endDate = endDateParam || new Date()

      dispatch(setInvoiceLoading(true))

      try {
        const allInvoices = await callGetSaleInvoiceQuery(startDate, endDate)

        if (!startDateParam && !endDateParam) {
          dispatch(setAllInvoices(allInvoices))
        }

        return allInvoices
      } catch (err) {
        dispatch(setError(response.errors[0].message))

        console.error(err)
        return []
      } finally {
        dispatch(setInvoiceLoading(false))
      }
    },
    [tenantId, dispatch, fetchOtherSettings, reloadInvoiceLoader, headerLoader]
  )

  const fetchSalesInvoice = useCallback(
    async invoiceId => {
      if (!invoiceId) return null

      let existingInvoice = salesInvoices.find(inv => inv.invoiceId === invoiceId)

      // If no invoices are cached, fetch all invoices
      if (!salesInvoices.length) {
        const fetchedInvoices = await fetchSalesInvoices()
        existingInvoice = fetchedInvoices.find(inv => inv.invoiceId === invoiceId)
      }

      if (existingInvoice) return existingInvoice

      try {
        dispatch(setInvoiceLoading(true))
        const response = await fetchData(getSalesInvoiceQuery(tenantId, invoiceId))
        const newInvoice = response?.getSalesInvoice || null

        return newInvoice
      } catch (err) {
        dispatch(setError('Failed to fetch invoice'))
        console.error(err)
        return null
      } finally {
        dispatch(setInvoiceLoading(false))
      }
    },
    [tenantId, salesInvoices, dispatch, fetchSalesInvoices]
  )

  const reloadSalesInvoiceInStore = useCallback(
    async invoiceId => {
      if (!invoiceId) return
      dispatch(setInvoiceLoading(true))

      const existingInvoice = salesInvoices.find(invoice => invoice.invoiceId === invoiceId)

      try {
        if (existingInvoice?.invoiceId) {
          const response = await fetchData(getSalesInvoiceQuery(tenantId, invoiceId))
          const newInvoice = response?.getSalesInvoice || null

          if (newInvoice) {
            dispatch(setUpdateInvoice(newInvoice))
          }
        } else {
          try {
            const otherSettings = await fetchOtherSettings()
            const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
            const endDate = new Date()

            const allInvoices = await callGetSaleInvoiceQuery(startDate, endDate)

            dispatch(setAllInvoices(allInvoices))
          } catch (fallbackError) {
            console.error('Fallback to fetch all invoices also failed:', fallbackError)
          }

          return null
        }
      } catch (error) {
        console.error('Failed to fetch single Invoice, falling back to full fetch:', error)
      } finally {
        dispatch(setInvoiceLoading(false))
      }
    },
    [tenantId, salesInvoices, fetchOtherSettings, dispatch]
  )

  return { salesInvoiceLoading, reloadSalesInvoiceInStore, error, fetchSalesInvoice, fetchSalesInvoices }
}

export default useSalesInvoices
