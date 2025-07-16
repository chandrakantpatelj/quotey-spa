const currenciesFieldBase = `
    currencyId
    name
    symbol
    displayAlignment
    exchangeRate
`
export const getAllCurrencies = () => `
  getAllCurrency {
    ${currenciesFieldBase}
  }
`

export const getAllCurrencyQuery = () => {
  return /* GraphQL */ `
    query getCurrencies {
      ${getAllCurrencies()}
    }
  `
}
