import { addressFragment, contactFragment, fileFragment } from './common-queries'

const taxAuthorityFieldBase = `
    schemaVersion
    taxAuthorityId
    tenantId
    taxAuthorityName
    taxAuthorityCode
    taxAuthorityCodePrefix
    taxAuthorityType
    taxAuthorityDescription
    taxAuthorityAddress {
      ${addressFragment}
    }
    taxAuthorityContact {
      ${contactFragment}
    }
    taxAuthorityRegistration {
      registrationNo
      registrationDate
      registrationExpiryDate
    }
    files {
      ${fileFragment}
    }
`

export const getAllTaxAuthorities = tenantId => `
  getAllTaxAuthorities(tenantId: "${tenantId}") {
    ${taxAuthorityFieldBase}
    createdDateTime
    createdBy
    modifiedDateTime
    modifiedBy
  }
`

const getTaxAuthorityTransactionsByDateRange = `
  schemaVersion
  transactionId
  taxAuthorityId
  transactionDate
  transactionType
  transactionRef
  description
  notes
  credit
  debit
  currency
  taxStatementId
  taxStatementNoPrefix
  taxStatementNo
  taxPaymentId
  taxPaymentNoPrefix
  taxPaymentNo
  taxRefundId
  status
  runningBalance
  closingBalance
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
  deletedDateTime
  deletedBy
`

export const getAllTaxAuthoritiesQuery = tenantId => {
  return /* GraphQL */ `
    query getAllTaxAuthorities {
      ${getAllTaxAuthorities(tenantId)}
    }
  `
}

export const GetTaxAuthorityTransactionsByDateRangeQuery = (tenantId, taxAuthorityId, fromDate, toDate) => `
    query GetTaxAuthorityTransactionsByDateRange {
       getTaxAuthorityTransactionsByDateRange(tenantId: "${tenantId}",taxAuthorityId: "${taxAuthorityId}",fromDate: "${fromDate}",toDate: "${toDate}") {
          ${getTaxAuthorityTransactionsByDateRange}
      }
    }
  `

export const CreateTaxAuthorityMutation = () => {
  return /* GraphQL */ `
    mutation CreateTaxAuthorityMutation($tenantId: String!, $taxAuthority: TaxAuthorityInput!) {
      createTaxAuthority(tenantId: $tenantId, taxAuthority: $taxAuthority) {
        ${taxAuthorityFieldBase}
      }
    }
  `
}

export const EditTaxAuthorityMutation = () => {
  return /* GraphQL */ `
    mutation UpdateTaxAuthorityMutation($tenantId: String!, $taxAuthorityId: String!, $taxAuthority: TaxAuthorityInput!) {
      updateTaxAuthority(tenantId: $tenantId, taxAuthorityId: $taxAuthorityId,taxAuthority: $taxAuthority) {
          ${taxAuthorityFieldBase}
      }
    }
  `
}

export const deleteTaxAuthorityMutation = () => {
  return /* GraphQL */ `
    mutation deleteTaxAuthorityMutation($tenantId: String!, $taxAuthorityId: String!) {
      deleteTaxAuthority(tenantId: $tenantId, taxAuthorityId: $taxAuthorityId)
    }
  `
}
