import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getPurchaseOrderQuery,
  getPurchaseOrdersByDateRangeQuery
} from 'src/@core/components/graphql/purchase-order-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import {
  setActionPurchaseOrder,
  setAllPurchaseOrder,
  setError,
  setLoading,
  setUpdatePurchaseOrder
} from 'src/store/apps/purchaseorder'
import useOtherSettings from './useOtherSettings'

const usePurchaseOrders = tenantId => {
  const dispatch = useDispatch()
  const purchaseOrders = useSelector(state => state.purchaseOrder?.data || [])
  const purchaseOrdersLoading = useSelector(state => state.purchaseOrder?.loading || false)
  const error = useSelector(state => state.purchaseOrder?.error || null)
  const reloadPurchaseOrder = useSelector(state => state.purchaseOrder?.reloadPurchaseOrder)
  const headerLoader = useSelector(state => state?.otherSettings?.headerLoader)
  const { fetchOtherSettings } = useOtherSettings(tenantId)

  const callGetPurchaseOrdersQuery = async (startDate, endDate) => {
    const response = await fetchData(getPurchaseOrdersByDateRangeQuery(tenantId, startDate, endDate))
    return response?.getPurchaseOrdersByDateRange || []
  }

  const fetchPurchaseOrders = useCallback(
    async (startDateParam, endDateParam) => {
      if (!tenantId) return []
      if (purchaseOrders.length) return purchaseOrders

      const otherSettings = await fetchOtherSettings()
      const startDate = startDateParam || lastMonthDate(otherSettings?.moduleFilterDateDuration)
      const endDate = endDateParam || new Date()

      dispatch(setLoading(true))

      try {
        const allPurchaseOrders = await callGetPurchaseOrdersQuery(startDate, endDate)
        if (!startDateParam && !endDateParam) {
          dispatch(setAllPurchaseOrder(allPurchaseOrders))
        }

        return allPurchaseOrders
      } catch (err) {
        dispatch(setError('Failed to fetch purchase orders'))
        console.error(err)
        return []
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, dispatch, fetchOtherSettings, reloadPurchaseOrder, headerLoader]
  )

  const fetchPurchaseOrder = useCallback(
    async orderId => {
      if (!orderId) return null

      let existingPurchaseOrders = purchaseOrders.find(inv => inv.orderId === orderId)
      if (existingPurchaseOrders) return existingPurchaseOrders

      // If no invoices are cached, fetch all invoices
      if (!purchaseOrders.length && !existingPurchaseOrders) {
        const purchaseOrders = await fetchPurchaseOrders()
        existingPurchaseOrders = purchaseOrders.find(inv => inv.orderId === orderId)
      }

      try {
        dispatch(setLoading(true))
        const response = await fetchData(getPurchaseOrderQuery(tenantId, orderId))
        const purchaseOrder = response?.getPurchaseOrder || null

        if (purchaseOrder) {
          dispatch(setActionPurchaseOrder(purchaseOrder))
        }

        return purchaseOrder
      } catch (err) {
        dispatch(setError('Failed to fetch Purchase Order'))
        console.error(err)
        return null
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, purchaseOrders, dispatch, fetchPurchaseOrders]
  )

  const reloadPurchaseOrderInStore = useCallback(
    async orderId => {
      if (!orderId) return

      const existingPO = purchaseOrders.find(po => po.orderId === orderId)

      try {
        if (existingPO?.orderId) {
          const response = await fetchData(getPurchaseOrderQuery(tenantId, existingPO?.orderId))
          const updatedPO = response.getPurchaseOrder
          if (updatedPO) {
            dispatch(setUpdatePurchaseOrder(updatedPO))
          }
        } else {
          try {
            const otherSettings = await fetchOtherSettings()
            const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
            const endDate = new Date()

            const allPOs = await callGetPurchaseOrdersQuery(startDate, endDate)
            dispatch(setAllPurchaseOrder(allPOs))
          } catch (fallbackError) {
            console.error('Fallback to fetch all POs also failed:', fallbackError)
          }

          return null
        }
      } catch (error) {
        console.error('Failed to fetch single PO, falling back to full fetch:', error)
      }
    },
    [tenantId, purchaseOrders, fetchOtherSettings, dispatch]
  )

  return {
    purchaseOrders,
    purchaseOrdersLoading,
    error,
    fetchPurchaseOrders,
    fetchPurchaseOrder,
    reloadPurchaseOrderInStore
  }
}

export default usePurchaseOrders
