import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllCustomersQuery, getCustomerQuery } from 'src/@core/components/graphql/customer-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllCustomer, setError, setCustomerLoading } from 'src/store/apps/customers'

const useCustomers = tenantId => {
  const dispatch = useDispatch()

  const customers = useSelector(state => state.customers?.data || [])
  const customerLoading = useSelector(state => state.customers?.customerLoading || false)
  const reloadCustomerLoader = useSelector(state => state.customers?.reloadCustomerLoader)
  const error = useSelector(state => state.customers?.error || null)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const fetchCustomersFromApi = customers.length === 0

  const fetchCustomers = useCallback(async () => {
    if (!tenantId) return []
    if (!fetchCustomersFromApi) return customers

    dispatch(setCustomerLoading(true))
    try {
      const response = await fetchData(getAllCustomersQuery(tenantId))
      const allCustomers = response?.getAllCustomers || []

      dispatch(setAllCustomer(allCustomers))
      return allCustomers
    } catch (err) {
      dispatch(setError('Failed to fetch customers'))
      console.error(err)
      return []
    } finally {
      dispatch(setCustomerLoading(false))
    }
  }, [tenantId, dispatch, reloadCustomerLoader, headerLoader])

  const fetchSingleCustomer = useCallback(
    async customerId => {
      if (!customerId) return null

      try {
        const existingCustomer = customers?.find(customer => customer.customerId === customerId)
        if (existingCustomer) return existingCustomer
        dispatch(setCustomerLoading(true))
        const response = await fetchData(getCustomerQuery(tenantId, customerId))
        const customer = response.getCustomer || null
        return customer
      } catch (err) {
        dispatch(setError('Failed to fetch customer'))
        console.error(err)
        return null
      } finally {
        dispatch(setCustomerLoading(false))
      }
    },
    [tenantId, customers, dispatch]
  )

  return { fetchCustomers, fetchSingleCustomer, customers, customerLoading, error }
}

export default useCustomers
