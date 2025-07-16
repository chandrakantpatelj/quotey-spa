import { fileFragment } from './common-queries'

const generalTaxStatementFields = `
    schemaVersion
    tenantId
    statementId
    statementNoPrefix
    statementNo
    taxAuthorityId
    periodStartDate
    periodEndDate
    statementDate
    statementMethod
    taxStatementAccounts {
      accountId
      accountType
      statementLabel
      statementDescription
      amount
    }
    currency
    netStatementAmount
    description
    notes
    status
    paymentStatus
    files {
      ${fileFragment}
    }
    createdDateTime
    createdBy
    modifiedDateTime
    modifiedBy
    deletedDateTime
    deletedBy
`
export const ClearedTaxStatementField = ` taxStatementId
  taxAuthorityId
  taxStatementNo
  taxStatementNoPrefix
  taxStatementDate
  clearingDate
  netStatementAmount
  currency
  totalClearedPayableAmount
  paymentStatus`
export const getTaxStatements = tenantId => `
  getTaxStatements(tenantId: "${tenantId}") {
    ${generalTaxStatementFields}
  }
`

export const getAllTaxStatementsQuery = tenantId => `
  query getAllTaxStatements {
    ${getTaxStatements(tenantId)}
  }
`

export const createTaxStatementMutation = () => {
  return /* GraphQL */ `
      mutation createTaxStatementMutation($tenantId: String!, $taxStatement: TaxStatementInput!) {
        createTaxStatement(tenantId: $tenantId, taxStatement: $taxStatement) {
            ${generalTaxStatementFields}
        }
      }
    `
}

export const deleteTaxStatementMutation = () => {
  return /* GraphQL */ `
    mutation deleteTaxStatementMutation($tenantId: String!, $statementId: String!) {
      deleteTaxStatement(tenantId: $tenantId, statementId: $statementId)
    }
  `
}

export const markedStatementAsConfirmedQuery = () => {
  return /* GraphQL */ `
    mutation MarkedStatementAsConfirmed($tenantId: String!, $statementId: String!) {
      markedStatementAsConfirmed(tenantId: $tenantId, statementId: $statementId) {
        ${generalTaxStatementFields}
      }
    }
  `
}

export const undoConfirmedTaxStatementQuery = () => {
  return /* GraphQL */ `
    mutation UndoConfirmedTaxStatement($tenantId: String!, $statementId: String!) {
      undoConfirmedTaxStatement(tenantId: $tenantId, statementId: $statementId) {
        ${generalTaxStatementFields}
      }
    }
  `
}
