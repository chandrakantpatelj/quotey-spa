import { addressFragment, logoImageFragment } from './common-queries'

const tradingFieldsBase = `
  schemaVersion
  tenantId
  tradingId
  tradingNo
  tradingNoPrefix
  tradingName
  businessName
  address {
   ${addressFragment}
  }
  attributes {
    key
    value
  }
  logoImage {
   ${logoImageFragment}
  }
  emailAddress
  workPhone
  mobile
   createdDateTime
  modifiedDateTime
  modifiedBy
  createdBy
`

const tradingFieldsAll = () => `
  ${tradingFieldsBase}
 
`

export const getAllTradings = tenantId => `
  getTradings(tenantId: "${tenantId}") {
    ${tradingFieldsAll()}
  }
`

export const getAllTradingQuery = tenantId => {
  return /* GraphQL */ `
    query getTradings {
      ${getAllTradings(tenantId)}
    }
  `
}

export const getTradingQuery = (tenantId, tradingId) => {
  return /* GraphQL */ `
    query getTrading {
       getTrading(tenantId: "${tenantId}", tradingId: "${tradingId}"){
        ${tradingFieldsBase}
        }
    }
  `
}

export const CreateTradingMutation = () => {
  return /* GraphQL */ `
    mutation CreateTradingMutation($tenantId: String!, $trading: TradingInput!) {
      createTrading(tenantId: $tenantId, trading: $trading) {
        ${tradingFieldsBase}
      }
    }
  `
}

export const UpdateTradingMutation = () => {
  return /* GraphQL */ `
    mutation UpdateTradingMutation($tenantId: String!, $tradingId: String!, $trading: TradingInput!) {
      updateTrading(tenantId: $tenantId, tradingId: $tradingId, trading: $trading) {
        ${tradingFieldsBase}
      }
    }
  `
}

export const deleteTradingMutation = () => {
  return /* GraphQL */ `
    mutation DeleteTrading($tenantId: String!, $tradingId: String!) {
      deleteTrading(tenantId: $tenantId, tradingId: $tradingId)
    }
  `
}

export const getTradingsByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query getTradingsByDateRange {
      getTradingsByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${tradingFieldsBase}
      }
    }
  `
}
