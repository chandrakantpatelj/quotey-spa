export const getDashboardStatesForSalesInvoicesQuery = (tenantId, currentDate, startDate, endDate) => {
  return /* GraphQL */ `
    query GetDashboardStatesForSalesInvoices {
      getDashboardStatesForSalesInvoices(tenantId: "${tenantId}",currentDate: "${currentDate}", startDate: "${startDate}", endDate: "${endDate}") {
        key
        value
      }
    }
  `
}
