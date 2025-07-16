import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllFinancialAccountsQuery } from 'src/@core/components/graphql/financial-account-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setFinancialAccounting, setFinancialAccountLoading } from 'src/store/apps/financial-Accounts'

export const useFinancialAccounts = tenantId => {
  const dispatch = useDispatch()
  const financialAccounts = useSelector(state => state.financialAccounts.data || [])
  const financialAccountloading = useSelector(state => state.financialAccounts.financialAccountloading || false)
  const fetchAccountsApi = financialAccounts?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadFinancialAccountLoader = useSelector(state => state.financialAccounts?.reloadFinancialAccountLoader)

  useEffect(() => {
    const fetchAccounts = async () => {
      if (fetchAccountsApi && tenantId) {
        dispatch(setFinancialAccountLoading(true))
        try {
          const response = await fetchData(getAllFinancialAccountsQuery(tenantId))
          const allFinancialAccounts = response?.getAllFinancialAccounts
          dispatch(setFinancialAccounting(allFinancialAccounts))
        } catch (err) {
          dispatch(setFinancialAccountLoading(false))
          console.error(err)
        }
      }
    }

    fetchAccounts()
  }, [tenantId, dispatch, reloadFinancialAccountLoader, headerLoader])

  return { financialAccounts, financialAccountloading }
}
