const generalPaymentMethodField = `
    schemaVersion
    tenantId
    paymentMethodId
    paymentMethod
    paymentMethodType
    financialAccountId
    enabled
    createdDateTime
    createdBy
    modifiedDateTime
    modifiedBy`

const expenseTypeTaxField = `
   schemaVersion
    tenantId
    expenseTypeId
    expenseType
    expenseAccountId
    amountInclusiveOfTax
    eligibleForTaxCredit
    taxes{
      taxName
      taxRate
      expenseTaxCreditAccountId
    }
    enabled
    description
    createdDateTime
    createdBy
    modifiedDateTime
    modifiedBy
`

const StockAdjustmentReasonFields = `
    reasonCode
    reasonName
    accountingEvents
    enabled
`

const getStockAdjustmentSettingsFields = `
    schemaVersion
    tenantId
    stockMovement
    reasons {
      ${StockAdjustmentReasonFields}
    }
    createdDateTime
    createdBy
    modifiedDateTime
    modifiedBy
`
const UserRolePermission = `
  action
  scope
`

const userRolesFields = `
    userRoleId
    role
    accountId
    permissions {
      ${UserRolePermission}
    }
`

export const getGeneralPaymentMethodsQuery = tenantId => `
  query {
    getPaymentMethods(tenantId: "${tenantId}") {
      ${generalPaymentMethodField}
    }
  }
`

export const getGeneralExpenseTypes = tenantId => `
 query {  
    getExpenseTypes(tenantId: "${tenantId}") {
    ${expenseTypeTaxField}
  }
}
`

export const getStockAdjustmentSettingsQuery = tenantId => `
 query {  
    getStockAdjustmentSettings(tenantId: "${tenantId}") {
    ${getStockAdjustmentSettingsFields}
  }
}
`

export const getUserRolesQuery = () => `
 query {  
    getUserRoles {
    ${userRolesFields}
  }
}
`
