import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getUserRolesQuery } from 'src/@core/components/graphql/general-setting-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setUserAccountRoles } from 'src/store/apps/general-setting'

const useUserAccountRoles = tenantId => {
  const dispatch = useDispatch()

  const userAccountRoles = useSelector(state => state.generalSettings?.userAccountRoles || [])

  const fetchDataFromApi = userAccountRoles?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  useEffect(() => {
    const fetchStockAdjustmentSetting = async () => {
      if (fetchDataFromApi && tenantId) {
        try {
          const response = await fetchData(getUserRolesQuery(tenantId))
          const generalStockSettings = response?.getUserRoles
          dispatch(setUserAccountRoles(generalStockSettings))
        } catch (err) {
          console.error(err)
        }
      }
    }

    fetchStockAdjustmentSetting()
  }, [tenantId, dispatch, headerLoader])
  return { userAccountRoles }
}

export default useUserAccountRoles
