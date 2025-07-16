import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getGeneralExpenseTypes } from 'src/@core/components/graphql/general-setting-queries'
// import { getAllPaymentMethodsQuery } from 'src/@core/components/graphql/generalExpenseTypes-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setGeneralExpenseTypes, setGeneralExpenseTypeLoading } from 'src/store/apps/general-setting'

const useGeneralExpenseType = tenantId => {
  const dispatch = useDispatch()

  const generalExpenseTypes = useSelector(state => state.generalSettings?.generalExpenseTypes || [])
  const generalExpenseTypeLoading = useSelector(state => state.generalSettings?.generalExpenseTypeLoading || false)

  const fetchGeneralExpenseTypesFromApi = generalExpenseTypes?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  useEffect(() => {
    const fetchGeneralExpenseTypes = async () => {
      if (fetchGeneralExpenseTypesFromApi && tenantId) {
        try {
          dispatch(setGeneralExpenseTypeLoading(true))
          const response = await fetchData(getGeneralExpenseTypes(tenantId))
          dispatch(setGeneralExpenseTypes(response?.getExpenseTypes || []))
        } catch (err) {
          dispatch(setGeneralExpenseTypeLoading(false))
          console.error(err)
        }
      }
    }

    fetchGeneralExpenseTypes()
  }, [tenantId, dispatch, headerLoader])
  return { generalExpenseTypes, generalExpenseTypeLoading }
}

export default useGeneralExpenseType
