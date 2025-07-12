import { getAllItemsForPriceList } from './item-queries'
export const profitAndLossReportFieldsBase = `
currency
  tenantId
  accountId
  accountName
  accountType
  accountCategory
  totalAmount
`

export const viewReportsQuery = tenantId => {
  return /* GraphQL */ `
    query viewReports {
      ${getAllItemsForPriceList(tenantId)}
    }
  `
}

export const getReportsQuery = (tenantId, itemId) => {
  return /* GraphQL */ `
    query getReports {
      getSalesReport(tenantId: "${tenantId}", itemId: "${itemId}") {
        orderId
        orderNo
        orderDate
        customerId
        notes
        dueDate
        status
      }
    }
  `
}

export const getPLReportsQueryByDateRange = (tenantId, method, fromDate, toDate) => {
  return /* GraphQL */ `
    query getProfitAndLossReportByDateRange {
      getProfitAndLossReportByDateRange(tenantId: "${tenantId}", method: "${method}",fromDate: "${fromDate}",toDate: "${toDate}") {
        ${profitAndLossReportFieldsBase}
      }
    }
  `
}

export const getBLReportsQueryByDateRange = (tenantId, method, fromDate, toDate) => {
  return /* GraphQL */ `
    query getBalanceSheetReportByDateRange {
      getBalanceSheetReportByDateRange(tenantId: "${tenantId}", method: "${method}",fromDate: "${fromDate}",toDate: "${toDate}") {
        ${profitAndLossReportFieldsBase}
      }
    }
  `
}
