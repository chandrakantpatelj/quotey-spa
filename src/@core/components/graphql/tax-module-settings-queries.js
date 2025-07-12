const taxStatementAccountFields = `
  accountId
  accountType
  description
  statementLabel
  statementDescription
`

const taxModuleSettingsFields = `
  schemaVersion
  tenantId
  taxAuthorityId
  taxAccountingMethod
  taxStatementAccounts {
    ${taxStatementAccountFields}
  }
  accountPayableAccountId
  differedTaxAccountId
  salesRevenueAccountId
  costOfGoodsSoldAccountId
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
`

export const getTaxModuleSettingsQuery = (tenantId, taxAuthorityId) => `
  query getTaxModuleSettings {
    getTaxModuleSettings(tenantId: "${tenantId}", taxAuthorityId: "${taxAuthorityId}") {
      ${taxModuleSettingsFields}
    }
  }
`

export const getAllTaxModuleSettingsQuery = tenantId => `
  query getAllTaxModuleSettings {
    getAllTaxModuleSettings(tenantId: "${tenantId}") {
      ${taxModuleSettingsFields}
    }
  }
`

export const updateTaxModuleSettingsMutation = () => {
  return /* GraphQL */ `
    mutation updateTaxModuleSettings($tenantId: String!, $taxAuthorityId: String!, $settings: TaxModuleSettingsInput!) {
      updateTaxModuleSettings(tenantId: $tenantId, taxAuthorityId: $taxAuthorityId, settings: $settings) {
        ${taxModuleSettingsFields}
      }
    }
  `
}
