import { useEffect } from 'react'
import { fetchData } from 'src/common-functions/GraphqlOperations'

const { useSelector, useDispatch } = require('react-redux')
const { getSalesModuleSettingsQuery } = require('src/@core/components/graphql/sales-module-setting')
const { setSalesModuleSetting, setLoading } = require('src/store/apps/sales-module-settings')

export const useSalesModule = tenantId => {
  const dispatch = useDispatch()

  const salesModules = useSelector(state => state.salesModuleSetting.data || [])
  const salesModuleLoading = useSelector(state => state.salesModuleSetting.salesModuleLoading || false)
  const error = useSelector(state => state.salesModuleSetting?.error || null)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadSalesModuleLoader = useSelector(state => state.salesModuleSetting?.reloadSalesModuleLoader || false)

  const fetchSalesModuleFromApi = salesModules?.length === 0
  useEffect(() => {
    const fetchSalesModule = async fetchSalesModuleFromApi => {
      if (fetchSalesModuleFromApi && tenantId) {
        dispatch(setLoading(true))
        try {
          const response = await fetchData(getSalesModuleSettingsQuery(tenantId))

          dispatch(setSalesModuleSetting(response?.getSalesModuleSettings ?? []))
        } catch (err) {
          dispatch(setLoading(false))
          dispatch(setError('Failed to fetch sales module'))
          console.error(err)
        }
      }
    }

    fetchSalesModule(fetchSalesModuleFromApi)
  }, [tenantId, dispatch, reloadSalesModuleLoader, headerLoader])
  return { salesModules, salesModuleLoading, error }
}
