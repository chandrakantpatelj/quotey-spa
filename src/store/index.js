// ** Toolkit imports
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
// import storage from 'redux-persist/lib/storage'

// ** Reducers
import alerts from 'src/store/apps/alerts'
import user from 'src/store/apps/user'
import vendors from './apps/vendors'
import warehouses from './apps/warehouses'
import products from './apps/products'
import purchaseOrder from './apps/purchaseorder'
import tenants from './apps/company'
import customers from './apps/customers'
import sales from './apps/sales'
import currencies from './apps/currency'
import countries from './apps/country'
import accounts from './apps/accounts'
import otherSettings from './apps/other-setting'
import generalSettings from './apps/general-setting'
import salesModuleSetting from './apps/sales-module-settings'
import purchaseModuleSetting from './apps/purchase-module-settings'
import packages from './apps/packages'
import salesPayments from './apps/payments'
import userPreference from './apps/user-preference'
import purchasesPayment from './apps/purchases-payment'
import quotations from './apps/quotations'
import tradings from './apps/tradings'
import priceLists from './apps/priceLists'
import financialAccounts from './apps/financial-Accounts'
import storage from 'redux-persist/lib/storage'
import expenses from './apps/expenses'
import taxStatements from './apps/tax-statements'
import taxAuthority from './apps/tax-authority'
import taxPayments from './apps/tax-payments'
import taxSettings from './apps/tax-settings'
import userProfile from './apps/user-profile'
import stockAdjustments from './apps/stock-adjustments'
import salesInvoices from './apps/sales-invoices'
import accountTransactions from './apps/account-transactions'
import purchasePackage from './apps/purchase-packages'
import purchaseShipments from './apps/purchase-shipments'
import bankTransactions from './apps/bank-transaction'

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    user,
    vendors,
    products,
    purchaseOrder,
    purchasePackage,
    purchaseShipments,
    tenants,
    warehouses,
    customers,
    sales,
    currencies,
    countries,
    alerts,
    otherSettings,
    generalSettings,
    salesModuleSetting,
    purchaseModuleSetting,
    accounts,
    accountTransactions,
    stockAdjustments,
    packages,
    salesPayments,
    userPreference,
    purchasesPayment,
    quotations,
    tradings,
    priceLists,
    financialAccounts,
    expenses,
    taxAuthority,
    taxStatements,
    taxPayments,
    taxSettings,
    userProfile,
    salesInvoices,
    bankTransactions
  })
)

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

const persistor = persistStore(store)

export { store, persistor }
