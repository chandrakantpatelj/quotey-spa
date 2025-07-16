import { getAccounts } from './account-queries'
import { addressFragment, logoImageFragment, primaryContact } from './common-queries'
import { getAllCountries } from './country-queries'
import { getAllCurrencies } from './currency-queries'
import { getUserProfile } from './user-profile'

// Function to get all tenants fields
const getAllTenantsFields = `
  schemaVersion
  tenantNo
  businessName
  displayName
  primaryContact {
    ${primaryContact}

  }
  emailAddress
  workPhone
  mobile
  currencyId
  useTradingInfo
  tradingId
  address {
    ${addressFragment}
  }
  billingAddress {
    ${addressFragment}
  }
 
  attributes {
    key
    value
  }
  logoImage {
   ${logoImageFragment}
  }
  createdDateTime
  accountId
  tenantId
  createdBy
  modifiedDateTime
  modifiedBy   

`

// Function to get all tenants
export const getAllTenants = () => `
  getAllTenants {
    ${getAllTenantsFields}
  }
`

// Exported queries
export const getAllTenantQuery = () => {
  return /* GraphQL */ `
    query getAllTenants {
      ${getAllTenants()}
    }
  `
}

export const getUserPreference = () => `
  getUserPreference {
    tenantId
  }
`

export const getTenantsAndPreferenceQuery = () => {
  return /* GraphQL */ `
    query getTenantsAndPreference {
      ${getAllTenants()}
      ${getAllCurrencies()}
      ${getUserPreference()}
      ${getAllCountries()}
      ${getAccounts()}
      ${getUserProfile()}

    }
  `
}

// Exported mutations
export const createTenantMutation = () => {
  return /* GraphQL */ `
    mutation CreateTenantMutation($tenant: TenantInput!) {
      createTenant(tenant: $tenant) {
        ${getAllTenantsFields}
      }
    }
  `
}

export const updateTenantMutation = () => {
  return /* GraphQL */ `
    mutation UpdateTenant($tenantId: String!, $tenant: TenantInput!) {
      updateTenant(tenantId: $tenantId, tenant: $tenant) {
        ${getAllTenantsFields}
      }
    }
  `
}

export const GetTenantsByDateRangeQuery = (startDate, endDate) => {
  return /* GraphQL */ `
    query GetTenantsByDateRange {
      getTenantsByDateRange(startDate: "${startDate}", endDate: "${endDate}") {
        ${getAllTenantsFields}
      }
    }
  `
}
