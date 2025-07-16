import { bankTransactionField } from './bank-transaction-queries'

export const createInvestmentAccountEntryFromBankTransactionMutation = () => {
  return /* GraphQL */ `
    mutation createInvestmentAccountEntryFromBankTransaction($tenantId: String!, $transaction: InvestmentTransactionInput!) {
      createInvestmentAccountEntryFromBankTransaction(tenantId: $tenantId, transaction: $transaction) {
          ${bankTransactionField}
      }
    }
  `
}
