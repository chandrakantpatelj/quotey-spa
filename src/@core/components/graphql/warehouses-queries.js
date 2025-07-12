import { addressFragment, primaryContact } from './common-queries'

const warehouseFields = `
  schemaVersion
  name
  mobile
  warehouseId
  tenantId
  warehouseNo
  workPhone
  emailAddress
  address {
  ${addressFragment}
  }
  primaryContact {
    ${primaryContact}

  }
  attributes {
    key
    value
  }
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy

`

export const getAllWarehouses = tenantId => `
  getAllWarehouses(tenantId: "${tenantId}") {
    ${warehouseFields}
  }
`

export const getAllWarehousesQuery = tenantId => {
  return /* GraphQL */ `
    query getWarehouses {
      ${getAllWarehouses(tenantId)}
    }
  `
}

export const CreateWareHouseMutation = () => {
  return /* GraphQL */ `
    mutation CreateWareHouseMutation($tenantId: String!, $warehouse: WarehouseInput!) {
      createWarehouse(tenantId: $tenantId, warehouse: $warehouse) {
        ${warehouseFields}
      }
    }
  `
}

export const UpdateWareHouseMutation = () => {
  return /* GraphQL */ `
    mutation updateWarehouse($tenantId: String!, $warehouseId: String!, $warehouse: WarehouseInput!) {
      updateWarehouse(tenantId: $tenantId, warehouseId: $warehouseId, warehouse: $warehouse) {
        ${warehouseFields}
      }
    }
  `
}

export const GetWarehousesByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query GetWarehousesByDateRange {
      getWarehousesByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${warehouseFields}
      }
    }
  `
}
