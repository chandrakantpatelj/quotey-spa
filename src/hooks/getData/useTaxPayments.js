import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllTaxPaymentsQuery } from 'src/@core/components/graphql/tax-payments-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllTaxPayment, setLoading, setError } from 'src/store/apps/tax-payments'

const useTaxPayments = tenantId => {
  const dispatch = useDispatch()

  const taxPayments = useSelector(state => state.taxPayments?.data || [])
  const loading = useSelector(state => state.taxPayments?.loading || false)
  const error = useSelector(state => state.taxPayments?.error || null)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadTaxPaymentLoader = useSelector(state => state.taxPayments?.reloadTaxPaymentLoader)

  useEffect(() => {
    const fetchTaxPayment = async () => {
      if (taxPayments?.length === 0 && tenantId) {
        dispatch(setLoading(true))
        try {
          const response = await fetchData(getAllTaxPaymentsQuery(tenantId))
          dispatch(setAllTaxPayment(response?.getAllTaxPayments || []))
        } catch (err) {
          dispatch(setError('Failed to fetch tax payments'))
          console.error(err)
        }
      }
    }

    fetchTaxPayment()
  }, [tenantId, dispatch, reloadTaxPaymentLoader, headerLoader])
  return { taxPayments, loading, error }
}

export default useTaxPayments
