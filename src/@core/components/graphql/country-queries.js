export const getAllCountries = () => `
  getAllCountries {
    name
    iso3
    states {
      name
      state_code
    }
  }
`

export const getAllCountriesQuery = () => {
  return /* GraphQL */ `
    query getCountries {
      ${getAllCountries()}
    }
  `
}
