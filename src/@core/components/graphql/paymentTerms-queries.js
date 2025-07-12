const paymentTermsFieldsBase = `
  paymentTermsId
  schemaVersion
  paymentTerms
  leadDays
`

export const getAllPaymentTerms = () => `
  getAllPaymentTerms {
    ${paymentTermsFieldsBase}
  }
`

export const getAllPaymentTermsQuery = () => {
  return /* GraphQL */ `
    query getAllPaymentTerms {
      ${getAllPaymentTerms()}
    }
  `
}
