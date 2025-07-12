import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import { setAllPackages, setLoading, setError, setUpdatePackage } from 'src/store/apps/packages'
import useOtherSettings from './useOtherSettings'
import {
  getSalesOrderPackage,
  getSalesOrderPackagesByDateRangeQuery
} from 'src/@core/components/graphql/sales-order-package-queries'

const usePackages = tenantId => {
  const dispatch = useDispatch()
  const packages = useSelector(state => state.packages?.data || [])
  const salesPackagesLoading = useSelector(state => state.packages?.salesPackagesLoading || false)
  const error = useSelector(state => state.packages?.error || null)
  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const reloadPackageLoader = useSelector(state => state.packages?.reloadPackageLoader)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  const callGetSalesPackageQuery = async (startDate, endDate) => {
    const response = await fetchData(getSalesOrderPackagesByDateRangeQuery(tenantId, startDate, endDate))
    return response?.getSalesOrderPackagesByDateRange || []
  }

  const fetchPackages = useCallback(
    async (startDateParam, endDateParam) => {
      const fetchPackagesFromApi = packages?.length === 0

      if (!tenantId) return []

      // Skip fetching if not required
      const shouldUseDefaultDates = !startDateParam && !endDateParam
      if (!fetchPackagesFromApi && shouldUseDefaultDates) {
        return packages
      }

      const otherSettings = await fetchOtherSettings()

      const startDate = startDateParam || lastMonthDate(otherSettings?.moduleFilterDateDuration)
      const endDate = endDateParam || new Date()

      dispatch(setLoading(true))
      try {
        const allPackages = await callGetSalesPackageQuery(startDate, endDate)

        // Only update store if it's default fetch
        if (shouldUseDefaultDates) {
          dispatch(setAllPackages(allPackages))
        }

        return allPackages
      } catch (error) {
        console.error(error)
        dispatch(setError('Failed to fetch packages'))
        return []
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, dispatch, fetchOtherSettings, reloadPackageLoader, headerLoader]
  )
  const fetchPackage = useCallback(
    async packageId => {
      if (!packageId) return null
      const existingPackage = packages.find(order => order.packageId === packageId)
      if (existingPackage) return existingPackage
      try {
        dispatch(setLoading(true))
        const response = await fetchData(getSalesOrderPackage(tenantId, packageId))

        const salePackage = response.getSalesOrderPackage || null

        return salePackage
      } catch (err) {
        dispatch(setError('Failed to fetch order'))
        console.error(err)
        return null
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, packages, dispatch]
  )

  const reloadSalesPackageInStore = useCallback(
    async packageId => {
      if (!packageId) return

      const existingPkg = packages.find(pkg => pkg.packageId === packageId)

      try {
        if (existingPkg?.packageId) {
          const response = await fetchData(getSalesOrderPackage(tenantId, packageId))

          const soPackage = response.getSalesOrder || null

          if (soPackage) {
            dispatch(setUpdatePackage(soPackage))
          }
        } else {
          try {
            const otherSettings = await fetchOtherSettings()
            const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
            const endDate = new Date()

            const allPackages = await callGetSalesPackageQuery(startDate, endDate)

            dispatch(setAllPackages(allPackages))
          } catch (fallbackError) {
            console.error('Fallback to fetch all POs also failed:', fallbackError)
          }

          return null
        }
      } catch (error) {
        console.error('Failed to fetch single PO, falling back to full fetch:', error)
      }
    },
    [tenantId, packages, fetchOtherSettings, dispatch]
  )

  return { packages, salesPackagesLoading, reloadSalesPackageInStore, error, fetchPackages, fetchPackage }
}

export default usePackages
