import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllTaxModuleSettingsQuery } from 'src/@core/components/graphql/tax-module-settings-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'

// const { useSelector, useDispatch } = require('react-redux')
const { setAllTaxSettings, setTaxSettingError, setTaxSettingLoader } = require('src/store/apps/tax-settings')

export const useTaxSettings = tenantId => {
  const dispatch = useDispatch()

  const taxSettings = useSelector(state => state.taxSettings.data || [])
  const taxSettingLoader = useSelector(state => state.taxSettings.taxSettingLoader || false)
  const error = useSelector(state => state.taxSettings?.error || null)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadTaxSettingLoader = useSelector(state => state.taxSettings?.reloadTaxSettingLoader || false)

  useEffect(() => {
    const fetchSalesModule = async () => {
      if (taxSettings?.length === 0 && tenantId) {
        dispatch(setTaxSettingLoader(true))
        try {
          const response = await fetchData(getAllTaxModuleSettingsQuery(tenantId))

          dispatch(setAllTaxSettings(response?.getAllTaxModuleSettings ?? []))
        } catch (err) {
          dispatch(setTaxSettingLoader(false))
          dispatch(setTaxSettingError('Failed to fetch sales module'))
          console.error(err)
        }
      }
    }

    fetchSalesModule()
  }, [tenantId, dispatch, reloadTaxSettingLoader, headerLoader])
  return { taxSettings, taxSettingLoader, error }
}
