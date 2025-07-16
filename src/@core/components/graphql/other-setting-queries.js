const commonFields = `
  schemaVersion
  manufacturer
  brand
  status
  inwardReason
  outwardReason
  uom
  productCategory
  productClass
  customerNotes
  termsAndConditions
  salesOrderCustomerNotes
  salesInvoiceCustomerNotes
  salesOrderTermsAndConditions
  salesInvoiceTermsAndConditions
  moduleFilterDateDuration
`

export const getOtherSetting = tenantId => `
  getOtherSetting(tenantId: "${tenantId}") {
    ${commonFields}
  }
`

export const getOtherSettingQuery = tenantId => {
  return /* GraphQL */ `
    query getOtherSetting {
      ${getOtherSetting(tenantId)}
    }
  `
}

export const createOtherSettingMutation = () => {
  return /* GraphQL */ `
    mutation CreateOtherSettingMutation($tenantId: String!, $otherSetting: OtherSettingInput!) {
      createOtherSetting(tenantId: $tenantId, otherSetting: $otherSetting) {
        ${commonFields}
      }
    }
  `
}

export const updateOtherSettingMutation = () => {
  return /* GraphQL */ `
    mutation UpdateOtherSetting($tenantId: String!, $otherSetting: OtherSettingInput!) {
      updateOtherSetting(tenantId: $tenantId, otherSetting: $otherSetting) {
        ${commonFields}
      }
    }
  `
}
