import { bankTransactionField } from './bank-transaction-queries'
import { fileFragment } from './common-queries'
import { ClearedTaxStatementField } from './tax-statement-queries'

const generalTaxPaymentsFields = `
  schemaVersion
  paymentId
  tenantId
  paymentNoPrefix
  paymentNo
  taxAuthorityId
  paymentDate
  paymentMethod
  referenceNo
  amount
  paymentType
  currency
  description
  notes
  bankTransactionId
  status
  files {
    ${fileFragment}
  }
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
  deletedDateTime
`

export const getAllTaxPayments = tenantId => `
  getAllTaxPayments(tenantId: "${tenantId}") {
    ${generalTaxPaymentsFields}
  }
`

export const getAllTaxPaymentsQuery = tenantId => `
  query getAllTaxPayments {
    ${getAllTaxPayments(tenantId)}
  }
`
export const getTaxPaymentsByDateRange = (tenantId, startDate, endDate) => `
  query getTaxPaymentsByDateRange {
    ${getTaxStatements(tenantId, startDate, endDate)}
  }
`

export const createTaxPaymentMutation = () => {
  return /* GraphQL */ `
      mutation createTaxPaymentMutation($tenantId: String!, $payment: TaxPaymentInput!) {
        createTaxPayment(tenantId: $tenantId, payment: $payment) {
        ${generalTaxPaymentsFields}
        }
      }
    `
}
export const createTaxPaymentFromBankTransactionMutation = () => {
  return /* GraphQL */ `
      mutation createTaxPaymentFromBankTransactionMutation($tenantId: String!, $payment: TaxPaymentInput!) {
        createTaxPaymentFromBankTransaction(tenantId: $tenantId, payment: $payment) {
        ${bankTransactionField}
        }
      }
    `
}

export const getClearedTaxStatementsForPaymentQuery = (tenantId, taxPaymentId) => {
  return /* GraphQL */ `
    query getClearedTaxStatementsForPayment {
      getClearedTaxStatementsForPayment(tenantId: "${tenantId}", taxPaymentId: "${taxPaymentId}") {
        ${ClearedTaxStatementField}
      }
    }
  `
}
export const undoPaymentClearingForTaxStatementMutation = () => {
  return /* GraphQL */ `
    mutation undoPaymentClearingForTaxStatement($tenantId: String!, $taxStatementId: String!) {
      undoPaymentClearingForTaxStatement(tenantId: $tenantId, taxStatementId: $taxStatementId)
    }
  `
}
