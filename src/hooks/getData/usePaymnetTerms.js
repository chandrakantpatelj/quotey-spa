import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllPaymentTermsQuery } from 'src/@core/components/graphql/paymentTerms-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllPaymentTerms } from 'src/store/apps/other-setting'

const usePaymentTerms = () => {
  const dispatch = useDispatch()

  const paymentTerms = useSelector(state => state.otherSettings?.paymentTerms) || []

  const fetchPaymentTermsFromApi = paymentTerms?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  useEffect(() => {
    const fetchPaymentTerms = async () => {
      if (fetchPaymentTermsFromApi) {
        try {
          const response = await fetchData(getAllPaymentTermsQuery())
          const allPaymentTerms = response?.getAllPaymentTerms

          dispatch(setAllPaymentTerms(allPaymentTerms))
        } catch (err) {
          console.error(err)
        }
      }
    }

    fetchPaymentTerms()
  }, [dispatch, headerLoader])
  return { paymentTerms }
}

export default usePaymentTerms
