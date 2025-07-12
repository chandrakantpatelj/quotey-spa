import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import useOtherSettings from './useOtherSettings'
import {
  getPurchaseOrderPackagesByDateRangeQuery,
  getPurchaseOrderPackageQuery // Placeholder — replace with your real query
} from 'src/@core/components/graphql/purchase-order-packages-queries'
import { setAllPurchasePackage, setError, setLoading, setUpdatePurchasePackage } from 'src/store/apps/purchase-packages'

const usePurchasePackages = tenantId => {
  const dispatch = useDispatch()

  const purchasePackages = useSelector(state => state.purchasePackage?.data || [])
  const purchasePackageLoading = useSelector(state => state.purchasePackage?.loading || false)
  const error = useSelector(state => state.purchasePackage?.error || null)
  const reloadPurchasePackage = useSelector(state => state.purchasePackage?.reloadPurchasePackage)
  const headerLoader = useSelector(state => state?.otherSettings?.headerLoader)
  const { fetchOtherSettings } = useOtherSettings(tenantId)

  const getPurchasePackages = async (startDate, endDate) => {
    const response = await fetchData(getPurchaseOrderPackagesByDateRangeQuery(tenantId, startDate, endDate))
    return response?.getPurchaseOrderPackagesByDateRange || []
  }

  const fetchPurchasePackages = useCallback(
    async (startDateParam, endDateParam) => {
      if (!tenantId) return []
      const fetchPurchasePackageFromApi = purchasePackages.length === 0

      const shouldUseDefaultDates = !startDateParam && !endDateParam
      if (!fetchPurchasePackageFromApi && shouldUseDefaultDates) return purchasePackages

      dispatch(setLoading(true))

      try {
        const otherSettings = await fetchOtherSettings()
        const startDate = startDateParam || lastMonthDate(otherSettings?.moduleFilterDateDuration)
        const endDate = endDateParam || new Date()

        const allPurchasePackages = await getPurchasePackages(startDate, endDate)

        if (shouldUseDefaultDates) {
          dispatch(setAllPurchasePackage(allPurchasePackages))
        }

        return allPurchasePackages
      } catch (err) {
        console.error(err)
        dispatch(setError('Failed to fetch purchase orders'))
        return []
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, fetchOtherSettings, dispatch, reloadPurchasePackage, headerLoader]
  )

  // Fetch a single package by ID or any identifier
  const fetchSinglePurchasePackage = useCallback(
    async packageId => {
      if (!tenantId || !packageId) return null
      const existingPackage = purchasePackages.find(item => item.packageId === packageId)
      if (existingPackage) return existingPackage
      dispatch(setLoading(true))

      try {
        const response = await fetchData(getPurchaseOrderPackageQuery(tenantId, packageId))
        return response?.getPurchaseOrderPackage || null
      } catch (err) {
        console.error(err)
        dispatch(setError('Failed to fetch single purchase package'))
        return null
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, purchasePackages, dispatch]
  )

  const reloadPurchasePackageInStore = useCallback(
    async packageId => {
      if (!tenantId || !packageId) return null

      const existingPackage = purchasePackages.find(pkg => pkg.packageId === packageId)

      try {
        if (existingPackage?.packageId) {
          const response = await fetchData(getPurchaseOrderPackageQuery(tenantId, existingPackage?.packageId))
          const updatedPackage = response?.getPurchaseOrderPackage
          if (updatedPackage) {
            dispatch(setUpdatePurchasePackage(updatedPackage))
          }
        } else {
          try {
            const otherSettings = await fetchOtherSettings()
            const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
            const endDate = new Date()

            const allPackages = await getPurchasePackages(startDate, endDate)
            dispatch(setAllPurchasePackage(allPackages))
          } catch (fallbackError) {
            console.error('Fallback fetch for all packages failed:', fallbackError)
          }

          return null
        }
      } catch (error) {
        console.error('Failed to fetch package. Falling back to full package fetch:', error)
      }
    },
    [tenantId, purchasePackages, fetchOtherSettings, dispatch]
  )

  return {
    purchasePackageLoading,
    error,
    fetchPurchasePackages,
    fetchSinglePurchasePackage,
    reloadPurchasePackageInStore
  }
}

export default usePurchasePackages
