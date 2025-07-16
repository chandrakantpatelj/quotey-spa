import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getGeneralPaymentMethodsQuery } from 'src/@core/components/graphql/general-setting-queries'
// import { getAllPaymentMethodsQuery } from 'src/@core/components/graphql/paymentMethods-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setGeneralPaymentMethods } from 'src/store/apps/general-setting'

const usePaymentMethods = tenantId => {
  const dispatch = useDispatch()

  const paymentMethods = useSelector(state => state.generalSettings?.generalPaymentMethods || [])

  const fetchPaymentMethodsFromApi = paymentMethods?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (fetchPaymentMethodsFromApi && tenantId) {
        try {
          const response = await fetchData(getGeneralPaymentMethodsQuery(tenantId))
          const allPaymentMethods = response?.getPaymentMethods
          dispatch(setGeneralPaymentMethods(allPaymentMethods))
        } catch (err) {
          console.error(err)
        }
      }
    }

    fetchPaymentMethods()
  }, [tenantId, dispatch, headerLoader])
  return { paymentMethods }
}

export default usePaymentMethods
