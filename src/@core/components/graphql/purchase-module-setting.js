import { getAllFinancialAccountsForSetting } from './financial-account-queries'

const PurchaseModuleSettingsTaxFieldBase = `
    taxId
    taxType
    taxName
    taxRate
    isManuallyEntered
    paidToTaxAuthority
    taxAuthorityId
    paidToMainVendor
    vendorId
    eligibleForTaxCredit
    distributionMethod
    inLocalCurrency
    enabled
    currencies
`

const PurchaseModuleSettingsExpenseFieldBase = `
    expenseId
    expenseType
    expenseName
    vendorId
    paidToMainVendor
    accountableForOrderTaxes
    additionalTaxes
    inLocalCurrency
    eligibleForTaxCredit
    distributionMethod
    enabled
    currencies
`
const PurchaseModuleShippingTaxFieldBase = `
    taxId
    taxType
    taxName
    paidToTaxAuthority
    taxAuthorityId
    paidToVendor
    vendorId
    eligibleForTaxCredit
    distributionMethod
    inLocalCurrency
    enabled
    currencies                                                                                                                      
`

const PurchaseModuleShipmentExpenseFieldBase = `
   expenseId
    expenseType
    expenseName
    paidToMainVendor
    vendorId
    additionalTaxes
    eligibleForTaxCredit
    inLocalCurrency
    distributionMethod
    enabled
    currencies
`

const PurchaseModuleSettingActionFieldBase = `
    entity
    actionName
`

const PurchaseModulePayableComponentFieldBase = `
    componentName
    componentType
`

const PurchaseModuleSettingsStageFieldBase = `
    entity
    stageName
    status
    nextStage
    firstStage
    deliveryStage
`

const PurchaseModuleSettingsStageEventsFieldBase = `
    entity
    stageName
    payableComponents{
     ${PurchaseModulePayableComponentFieldBase}
    }
    actions {
      ${PurchaseModuleSettingActionFieldBase}
    }
    undoActions {
      ${PurchaseModuleSettingActionFieldBase}
    }
    lockedComponents
    accountingEvents
`

const purchaseModuleSettingFieldBase = `
  schemaVersion
  tenantId
  purchaseType
  version
  latestVersion
  default
  currencies
  taxes {
    ${PurchaseModuleSettingsTaxFieldBase}
  }
  expenses{
    ${PurchaseModuleSettingsExpenseFieldBase}
  }
  purchaseModuleStages{
    ${PurchaseModuleSettingsStageFieldBase}
  }
  purchaseModuleStageEvents{
    ${PurchaseModuleSettingsStageEventsFieldBase}
  }
  shipmentCurrency
  shipmentTaxes{
    ${PurchaseModuleShippingTaxFieldBase}
  }
  shipmentExpenses {
    ${PurchaseModuleShipmentExpenseFieldBase}
  }
  subtotalInLocalCurrency
  totalAmountInLocalCurrency
`

export const getPurchaseModuleSettings = tenantId => `
  getPurchaseModuleSettings(tenantId:"${tenantId}"){
      ${purchaseModuleSettingFieldBase}
     
    }
`
export const getAllPurchaseModuleSettings = tenantId => `
  getAllPurchaseModuleSettings(tenantId: "${tenantId}") {
    ${purchaseModuleSettingFieldBase}
  
  }
`

export const getAllPurchaseModuleSettingsQuery = tenantId => {
  return /* GraphQL */ `
    query GetAllPurchaseModuleSettings {
      ${getAllPurchaseModuleSettings(tenantId)}       
    }
  `
}

export const getPurchaseModuleSettingsQuery = tenantId => {
  return /* GraphQL */ ` 
    query getPurchaseModuleSettings{
        ${getPurchaseModuleSettings(tenantId)}
        ${getAllFinancialAccountsForSetting(tenantId)}
    }
`
}

export const updatePurchaseModuleSettingsMutation = () => {
  return `
    mutation updatePurchaseModuleSettings($tenantId:String!,$settings:PurchaseModuleSettingsInput!){
        updatePurchaseModuleSettings(tenantId:$tenantId, settings:$settings){
        ${purchaseModuleSettingFieldBase}
        }
    }
    `
}
