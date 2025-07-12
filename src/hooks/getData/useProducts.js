import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllItemsQuery, getItemQuery } from 'src/@core/components/graphql/item-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllProduct, setProductLoading, setUpdateProduct } from 'src/store/apps/products'

const useProducts = tenantId => {
  const dispatch = useDispatch()

  const products = useSelector(state => state.products?.data || [])
  const productsLoading = useSelector(state => state.products?.loading || false)
  const error = useSelector(state => state.products?.error || null)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadProduct = useSelector(state => state.products?.reloadProduct)

  const callGetProductsQuery = async () => {
    const response = await fetchData(getAllItemsQuery(tenantId))
    return response?.getAllItems || []
  }

  const fetchProducts = useCallback(async () => {
    if (!tenantId) return []

    if (products?.length > 0) return products
    dispatch(setProductLoading(true))
    try {
      const allProducts = await callGetProductsQuery()

      dispatch(setAllProduct(allProducts))
    } catch (err) {
      dispatch(setProductLoading(false))

      dispatch(setError('Failed to fetch products'))
      console.error(err)
    } finally {
      dispatch(setProductLoading(false))
    }
  }, [tenantId, dispatch, reloadProduct, headerLoader])

  const reloadProductInStore = useCallback(
    async itemId => {
      if (!itemId) return
      dispatch(setProductLoading(true))

      const existingItem = products.find(po => po.itemId === itemId)

      try {
        if (existingItem?.itemId) {
          const response = await fetchData(getItemQuery(tenantId, existingItem?.itemId))
          const fetchedItem = response.getItem
          if (fetchedItem) {
            dispatch(setUpdateProduct(fetchedItem))
          }
        } else {
          try {
            const allPOs = await callGetProductsQuery()
            dispatch(setAllProduct(allPOs))
          } catch (fallbackError) {
            console.error('Fallback to fetch all Products also failed:', fallbackError)
          }

          return null
        }
      } catch (error) {
        console.error('Failed to fetch single product, falling back to full fetch:', error)
      } finally {
        dispatch(setProductLoading(false))
      }
    },
    [tenantId, products, dispatch]
  )

  const fetchSingleProduct = useCallback(
    async itemId => {
      if (!itemId) return
      dispatch(setProductLoading(true))

      const existingItem = products.find(po => po.itemId === itemId)
      if (existingItem) return existingItem

      try {
        const response = await fetchData(getItemQuery(tenantId, itemId))
        return response.getItem
        dispatch(setProductLoading(false))
      } catch (error) {
        console.error('Failed to fetch single product, falling back to full fetch:', error)
        return null
      } finally {
        dispatch(setProductLoading(false))
      }
    },
    [tenantId, products, dispatch]
  )

  return { products, productsLoading, error, reloadProductInStore, fetchProducts, fetchSingleProduct }
}

export default useProducts
