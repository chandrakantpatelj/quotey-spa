const salesModuleTaxesField = `
    taxId
    taxType
    taxName
    taxRate
    taxAuthorityId
    enabled
`
const salesModuleOtherChargesField = `
    chargeId
    chargeType
    chargeName
    includingTax
    taxes {
      ${salesModuleTaxesField}
    }
    enabled
`
const salesModuleSettingFieldBase = `
    schemaVersion
    tenantId
    version
    latestVersion
    currencies
    taxes {
      ${salesModuleTaxesField}
    }
    otherCharges {
      ${salesModuleOtherChargesField}
    }
    sendInvoiceAutomatically
    enableDiscount
    createdDateTime
    createdBy
    modifiedDateTime
    modifiedBy
`

export const getSalesModuleSettings = tenantId => `
    getSalesModuleSettings(tenantId:"${tenantId}"){
        ${salesModuleSettingFieldBase}
    }
`

export const getSalesModuleSettingsQuery = tenantId => {
  return /* GraphQL */ ` 
    query getSalesModuleSettings{
        ${getSalesModuleSettings(tenantId)}
    }
`
}

export const updateSalesModuleSettingsMutation = () => {
  return `
    mutation updateSalesModuleSettings($tenantId:String!,$settings:SalesModuleSettingsInput!){
        updateSalesModuleSettings(tenantId:$tenantId, settings:$settings){
        ${salesModuleSettingFieldBase}
        }
    }
    `
}
