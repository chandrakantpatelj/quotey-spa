import { getAllCurrencies } from './currency-queries'
import { getAllCustomersForPriceList } from './customer-queries'
import { getAllItemsForPriceList } from './item-queries'

const priceListFields = `
  schemaVersion
  priceListName
  validFrom
  validUpto
  status
  customers {
    customerId
  }
  itemList {
    itemId
    uom
    sellingPrice
    sellingPriceTaxInclusive
    sellingPriceCurrency
  }
`

export const getAllPriceList = tenantId => `
  getAllPriceList(tenantId: "${tenantId}") {
    ${priceListFields}
    createdDateTime
    tenantId
    priceListId
    priceListNo
  }
`

export const getAllPriceListQuery = tenantId => {
  return /* GraphQL */ `
    query getPriceList {
      ${getAllPriceList(tenantId)}
    }
  `
}

export const createPriceListMutation = () => {
  return /* GraphQL */ `
    mutation CreatePriceList($tenantId: String!, $priceList: PriceListInput!) {
      createPriceList(tenantId: $tenantId, priceList: $priceList) {
        ${priceListFields}
      }
    }
  `
}

export const updatePriceListMutation = () => {
  return /* GraphQL */ `
    mutation UpdatePriceList($tenantId: String!, $priceListId: String!, $priceList: PriceListInput!) {
      updatePriceList(tenantId: $tenantId, priceListId: $priceListId, priceList: $priceList) {
        ${priceListFields}
      }
    }
  `
}

export const deletePriceListMutation = () => {
  return /* GraphQL */ `
    mutation DeletePriceList($tenantId: String!, $priceListId: String!) {
      deletePriceList(tenantId: $tenantId, priceListId: $priceListId)
    }
  `
}

export const newPriceListQuery = tenantId => {
  return /* GraphQL */ `
    query newPriceListQuery {
      ${getAllItemsForPriceList(tenantId)}
    }
  `
}

export const editPriceListQuery = tenantId => {
  return /* GraphQL */ `
    query editPriceListQuery {
      ${getAllItemsForPriceList(tenantId)}
    }
  `
}

export const viewPriceListQuery = tenantId => {
  return /* GraphQL */ `
    query viewPriceListQuery {
      ${getAllCustomersForPriceList(tenantId)}
      ${getAllItemsForPriceList(tenantId)}
      ${getAllPriceList(tenantId)}
    }
  `
}

export const getPriceListByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query getPriceListByDateRange {
      getPriceListsByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
         ${priceListFields}
          createdDateTime
          tenantId
          priceListId
          priceListNo
      }
    }
  `
}
