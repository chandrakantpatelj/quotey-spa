import { addressFragment, primaryContact } from './common-queries'

export const accountFieldsBase = `
  schemaVersion
  accountId
  accountNo
  businessName
  displayName
  primaryContact {
   ${primaryContact}
  }
  email
  phoneNumber
  contactEmail
  workPhone
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
`

export const getAccounts = () => `
  getAccount {
    ${accountFieldsBase}
  }
`

export const getAccount = () => `
  getAccount {
    accountNo
  }
`
export const getAccountQuery = () => {
  return /* GraphQL */ `
    query getAccount {
      getAccount {
        ${accountFieldsBase}
      }
    }
  `
};



export const updateAccountMutation = () => {
  return /* GraphQL */ `
    mutation UpdateAccount($account: AccountInput!) {
      updateAccount(account: $account) {
        ${accountFieldsBase}
      }
    }
  `
}
