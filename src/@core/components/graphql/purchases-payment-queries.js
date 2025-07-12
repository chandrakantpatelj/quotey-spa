import { bankTransactionField } from './bank-transaction-queries'
import { fileFragment } from './common-queries'

const purchaseOrderPayment = `
  schemaVersion
  paymentId
  tenantId
  paymentNoPrefix
  paymentNo
  vendorId
  taxAuthorityId
  paymentDate
  paymentType
  paymentMethod
  financialAccountId
  financialAccountName
  referenceNo
  amount
  currency
  description
  notes
  paidAmount
  paidCurrency
  exchangeRate
  bankTransactionId
  status
  reconciliationStatus
  files {
    ${fileFragment}
  }
  sourcePurchaseOrderId
  sourcePurchaseOrderShipmentId
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
  deletedDateTime
`

export const getAllPurchaseOrderPayments = tenantId => `
  getAllPurchaseOrderPayments(tenantId: "${tenantId}") {
    ${purchaseOrderPayment}
  }
`

export const createPurchaseOrderPaymentMutation = () => {
  return /* GraphQL */ `
    mutation createPurchaseOrderPaymentMutation($tenantId: String!, $payment: PurchaseOrderPaymentInput!) {
      createPurchaseOrderPayment(tenantId: $tenantId, payment: $payment) {
        ${purchaseOrderPayment}
      }
    }
  `
}

export const createPurchaseOrderPaymentFromBankTransaction = () => {
  return /* GraphQL */ `
    mutation createPurchaseOrderPaymentFromBankTransactionMutation($tenantId: String!, $payment: PurchaseOrderPaymentInput!) {
      createPurchaseOrderPaymentFromBankTransaction(tenantId: $tenantId, payment: $payment) {
          ${bankTransactionField}
      }
    }
  `
}

export const updatePurchaseOrderPaymentMutation = () => {
  return /* GraphQL */ `
    mutation UpdatePurchaseOrderPayment($tenantId: String!, $paymentId: String!, $payment: PurchaseOrderPaymentInput!) {
      updatePurchaseOrderPayment(tenantId: $tenantId, paymentId: $paymentId, payment: $payment) {
        ${purchaseOrderPayment}
      }
    }
  `
}

export const clearPurchaseOrderPayment = () => {
  return /* GraphQL */ `
    mutation clearPurchaseOrderPayment($tenantId: String!, $paymentId:  String!) {
      clearPurchaseOrderPayment(tenantId: $tenantId, paymentId: $paymentId) {
        ${purchaseOrderPayment}

      }
    }
  `
}

export const deletePurchaseOrderPaymentMutation = () => {
  return /* GraphQL */ `
    mutation DeletePayment($tenantId: String!, $paymentId: String!) {
      deletePurchaseOrderPayment(tenantId: $tenantId, paymentId: $paymentId)
    }
  `
}

export const getPurchaseOrderPaymentsQuery = tenantId => {
  return /* GraphQL */ `
    query getAllPayments {
      ${getAllPurchaseOrderPayments(tenantId)}
    }
  `
}

export const getPurchaseOrderPaymentsByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query getPurchaseOrderPaymentsByDateRange {
      getPurchaseOrderPaymentsByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${purchaseOrderPayment}
      }
    }
  `
}

export const getPurchaseOrderPaymentsData = (tenantId, purchaseOrderId) => {
  return /* GraphQL */ `
    query getPurchaseOrderPaymentsData {
      getPurchaseOrderPaymentsForPurchaseOrder(tenantId: "${tenantId}", purchaseOrderId: "${purchaseOrderId}") {
        ${purchaseOrderPayment}
      }
    }
  `
}

const ClearedPurchaseOrderPayable = `
    purchaseOrderId
    purchaseOrderNo
    purchaseOrderNoPrefix
    purchaseOrderShipmentId
    purchaseOrderShipmentNo
    purchaseOrderShipmentNoPrefix
    purchaseOrderShipmentDate
    purchaseOrderPayableId
    purchaseOrderDate
    clearingDate
    totalPayableAmount
    payableCurrency
    payableAmount
    amountInLocalCurrency
    totalClearedPayableAmount
    totalClearedPayableAmountInLocalCurrency
    payableStatus
`

export const getClearedPurchaseOrderPayablesQuery = (tenantId, paymentId) => {
  return /* GraphQL */ `
    query getClearedPurchaseOrderPayables {
      getClearedPurchaseOrderPayables(tenantId: "${tenantId}", paymentId: "${paymentId}") {
        ${ClearedPurchaseOrderPayable}
      }
    }
  `
}

export const getPurchaseOrderPaymentQuery = (tenantId, paymentId) => {
  return `
      query getPurchaseOrderPayment{
          getPurchaseOrderPayment(tenantId:"${tenantId}", paymentId:"${paymentId}"){
              ${purchaseOrderPayment}
        }
    }
  `
}

export const undoPaymentClearingForPurchaseOrderPayableQuery = () => {
  return /* GraphQL */ `
    mutation undoPaymentClearingForPurchaseOrderPayable($tenantId: String!, $purchaseOrderPayableId: String!) {
      undoPaymentClearingForPurchaseOrderPayable(tenantId: $tenantId, purchaseOrderPayableId: $purchaseOrderPayableId)
    }
  `
}

export const GetPurchaseOrderPaymentsForPurchaseOrderShipmentQuery = (tenantId, purchaseOrderShipmentId) => {
  return /* GraphQL */ `
    query getPurchaseOrderPaymentsForPurchaseOrderShipment {
      getPurchaseOrderPaymentsForPurchaseOrderShipment(tenantId: "${tenantId}",purchaseOrderShipmentId: "${purchaseOrderShipmentId}") {
        ${purchaseOrderPayment}
      }
    }
  `
}
