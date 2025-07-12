export const getAllClients = /* GraphQL */ `
  query MyQuery {
    getAllClients {
      name
    }
    getAllContacts {
      emailAddress
    }
  }
`

export const getClient = /* GraphQL */ `
  query GetClient($clientId: String!) {
    getClient(clientId: $clientId) {
      address
      cityOrTown
      clientId
      clientNo
      clientType
      emailAddress
      mobile
      name
      phone
      postalAddress
      postalCityOrTown
      postalPostcode
      postalState
      postcode
      state
    }
  }
`
