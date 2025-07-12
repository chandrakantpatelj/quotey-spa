import { bankTransactionField } from './bank-transaction-queries'
import { fileFragment } from './common-queries'

const paymentsFieldsBase = `
  schemaVersion
  paymentId
  tenantId
  paymentNoPrefix
  paymentNo
  customerId
  paymentDate
  paymentType
  paymentMethod
  referenceNo
  amount
  currency
  description
  notes
  bankTransactionId
  status
  reconciliationStatus
  sourceSalesInvoiceId
  sourceSalesOrderId
  files {
    ${fileFragment}
  }
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
  deletedDateTime
`

const ClearedSalesInvoicePayable = `
    salesInvoiceId
    salesInvoiceNo
    salesInvoiceNoPrefix
    salesInvoiceReceivableId
    salesInvoiceDate
    clearingDate
    totalReceivableAmount
    receivableCurrency
    clearedAmount
    clearedCurrency
    totalClearedReceivableAmount
    receivableStatus
`

export const getAllSalesInvoicePaymentsForBankTransaction = tenantId => {
  return /* GraphQL */ `
    query getAllSalesInvoicePayments {
      getAllSalesInvoicePayments(tenantId: "${tenantId}") {
        paymentId
      }
    }
  `
}

export const getAllSalesPayments = tenantId => `
  getAllSalesInvoicePayments(tenantId: "${tenantId}") {
    ${paymentsFieldsBase}
  }
`
export const getSalesInvoicePaymentQuery = (tenantId, paymentId) => {
  return `query getSalesInvoicePayment {
  getSalesInvoicePayment(tenantId: "${tenantId}",paymentId: "${paymentId}") {
    ${paymentsFieldsBase}
  }
}
`
}

export const getAllSalesOrderPaymentsQuery = tenantId => {
  return /* GraphQL */ `
    query getAllSalesInvoicePayments {
      ${getAllSalesPayments(tenantId)}
    }
  `
}

export const createSalesInvoicePaymentMutation = () => {
  return /* GraphQL */ `
    mutation createSalesInvoicePayment($tenantId: String!, $payment: SalesInvoicePaymentInput!) {
      createSalesInvoicePayment(tenantId: $tenantId, payment: $payment) {
        ${paymentsFieldsBase}
      }
    }
  `
}

export const createSalesInvoicePaymentsMutation = () => {
  return /* GraphQL */ `
    mutation createSalesInvoicePayments($tenantId: String!, $payments: SalesInvoicePaymentsInput!) {
      createSalesInvoicePayments(tenantId: $tenantId, payments: $payments) {
        ${bankTransactionField}
      }
    }
  `
}
export const updateSalesInvoicePaymentMutation = () => {
  return /* GraphQL */ `
    mutation updateSalesInvoicePayment($tenantId: String!,$paymentId: String!, $payment: SalesInvoicePaymentInput!) {
      updateSalesInvoicePayment(tenantId: $tenantId,paymentId:$paymentId, payment: $payment) {
        ${paymentsFieldsBase}
      }
    }
  `
}

export const deleteSalesInvoicePaymentMutation = () => {
  return /* GraphQL */ `
    mutation deleteSalesInvoicePayment($tenantId: String!, $paymentId: String!) {
      deleteSalesInvoicePayment(tenantId: $tenantId, paymentId: $paymentId)
    }
  `
}

export const getSalesInvoicePaymentsByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query getSalesInvoicePaymentsByDateRange {
      getSalesInvoicePaymentsByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${paymentsFieldsBase}
      }
    }
  `
}

export const getSalesInvoicePaymentsForSalesInvoiceQuery = (tenantId, salesInvoiceId, salesOrderId) => {
  return /* GraphQL */ `
    query getSalesInvoicePaymentsForSalesInvoice {
      getSalesInvoicePaymentsForSalesInvoice(tenantId: "${tenantId}",  salesInvoiceId: "${salesInvoiceId}", salesOrderId: "${salesOrderId}") {
        ${paymentsFieldsBase}
      }
    }
  `
}

export const clearSalesInvoicePaymentMutation = () => {
  return /* GraphQL */ `
    mutation clearSalesInvoicePayment($tenantId: String!, $paymentId:  String!) {
      clearSalesInvoicePayment(tenantId: $tenantId, paymentId: $paymentId) {
        ${paymentsFieldsBase}
      }
    }
  `
}

export const getClearedSalesInvoiceReceivablesQuery = (tenantId, paymentId) => {
  return /* GraphQL */ `
    query getClearedSalesInvoiceReceivables {
      getClearedSalesInvoiceReceivables(tenantId: "${tenantId}", paymentId: "${paymentId}") {
        ${ClearedSalesInvoicePayable}
      }
    }
  `
}

export const getMatchingSalesInvoicePaymentsMutation = () => {
  return `
    query getMatchingSalesInvoicePayments($tenantId : String!, $paymentInfo:PaymentInfoInput!) {
      getMatchingSalesInvoicePayments(tenantId: $tenantId, paymentInfo:$paymentInfo) {
          ${paymentsFieldsBase}
      }
    }
  `
}
export const undoPaymentClearingForSalesInvoiceReceivableMutation = () => {
  return /* GraphQL */ `
    mutation undoPaymentClearingForSalesInvoiceReceivable($tenantId: String!, $salesInvoiceReceivableId: String!) {
      undoPaymentClearingForSalesInvoiceReceivable(
        tenantId: $tenantId
        salesInvoiceReceivableId: $salesInvoiceReceivableId
      )
    }
  `
}
