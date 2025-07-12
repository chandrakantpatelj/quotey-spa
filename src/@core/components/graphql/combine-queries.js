import { getAllItems } from './item-queries'
import { getAllPurchaseOrders } from './purchase-order-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'

// export const getCombineQueryData = tenantId => {
//   return /* GraphQL */ `
//     query getAppBarContentQuery {
//        ${getAllTradings(tenantId)}
//        ${getAllWarehouses(tenantId)}
//        ${getAllCustomers(tenantId)}
//        ${getAllVendors(tenantId)}
//        ${getAllPurchaseOrders(tenantId)}
//        ${getAllSalesOrders(tenantId)}
//        ${getAllItems(tenantId)}
//        ${getAllFinancialAccounts(tenantId)}
//        ${getAllSalesPayments(tenantId)}
//        ${getGeneralPaymentMethods(tenantId)}
//        ${getGeneralExpenseTypes(tenantId)}
//       ${getSalesModuleSettingsForSalesOrder(tenantId)}

//     }
//   `
// }

// Function to call a single query
async function callSingleQuery(query) {
  const temp = `query {${query}}` // Format the query
  return await fetchData(temp) // Call fetchData with the formatted query
}

export async function callCommonQueries(tenantId) {
  const queries = [
    // getAllWarehouses(tenantId),
    // getAllCustomers(tenantId),
    //getAllVendors(tenantId),
    getAllPurchaseOrders(tenantId),
    getAllItems(tenantId)
    // getAllFinancialAccounts(tenantId)
    // getGeneralPaymentMethods(tenantId)
  ]

  const results = await Promise.allSettled(queries.map(callSingleQuery)) // Call all queries in parallel
  // return results
  // Process results
  const resolvedData = results.reduce((acc, result, index) => {
    const queryName = queries[index].match(/(\w+)/)[0] // Extract the query name dynamically
    if (result.status === 'fulfilled') {
      if (result.value?.data === null) {
        acc[queryName] = [] // Set to empty array if data is null
      } else {
        acc[queryName] = result.value[Object.keys(result.value)[0]]
      }
    } else {
      acc[queryName] = [] // Handle errors
      console.error(`Error fetching ${queryName}:`, result.reason)
    }
    return acc
  }, {})

  return resolvedData // Return the accumulated results
}
