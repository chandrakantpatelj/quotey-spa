import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { editQuotationsQuery } from 'src/@core/components/graphql/quotation-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import EditQuotation from 'src/views/quotation/EditQuotation'
import useCustomers from 'src/hooks/getData/useCustomers'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useCountries from 'src/hooks/getData/useCountries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import useTradings from 'src/hooks/getData/useTradings'

function Edit() {
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { currencies } = useCurrencies()
  const { countries } = useCountries()
  const { paymentTerms } = usePaymentTerms()
  const { tradings, fetchTradings } = useTradings(tenantId)
  const { customers } = useCustomers(tenantId)

  const [quotationObject, setQuotationObject] = useState({})

  const [loading, setLoading] = useState(true)

  async function editQuotation() {
    try {
      setLoading(true)
      const quotationObject = await fetchData(editQuotationsQuery(tenantId))
      const { getOtherSetting, getAllPriceList } = quotationObject

      setQuotationObject({
        tradings,
        customers,
        currencies,
        countries,
        paymentTerms,
        settings: getOtherSetting,
        priceLists: getAllPriceList
      })
    } catch (error) {
      console.error('Error fetching data for quotation:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTradings()
    editQuotation()
  }, [tenantId, fetchTradings])

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditQuotation quotationObject={quotationObject} loading={loading} setLoading={setLoading} />
    </ErrorBoundary>
  )
}

export default Edit
