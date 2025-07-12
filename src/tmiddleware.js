import { NextResponse } from 'next/server'
import {
  CREATE_ACCOUNT,
  CREATE_TAX_AUTHORITIES,
  CREATE_CUSTOMER,
  CREATE_EXPENSE,
  CREATE_ITEM,
  CREATE_PACKAGE,
  CREATE_PRICE_LIST,
  CREATE_PURCHASE_ORDER,
  CREATE_PURCHASE_PAYMENT,
  CREATE_QUOTATION,
  CREATE_SALES_ORDER,
  CREATE_SALES_PAYMENT,
  CREATE_STATEMENT,
  CREATE_TAX_PAYMENT,
  CREATE_TRADING,
  CREATE_USER,
  CREATE_VENDOR,
  CREATE_WAREHOUSE,
  EDIT_ACCOUNT,
  EDIT_ACCOUNT_SETTING,
  EDIT_TAX_AUTHORITIES,
  EDIT_CUSTOMER,
  EDIT_EXPENSE,
  EDIT_ITEM,
  EDIT_PACKAGE,
  EDIT_PRICE_LIST,
  EDIT_PURCHASE_ORDER,
  EDIT_PURCHASE_SETTING,
  EDIT_QUOTATION,
  EDIT_SALES_ORDER,
  EDIT_SALES_SETTING,
  EDIT_TAX_SETTING,
  EDIT_TRADING,
  EDIT_USER,
  EDIT_VENDOR,
  EDIT_WAREHOUSE,
  LIST_ACCOUNT,
  LIST_ACCOUNT_SETTING,
  LIST_TAX_AUTHORITIES,
  LIST_BALANCE_SHEET,
  LIST_BANK_TRANSACTION,
  LIST_EXPENSE,
  LIST_ITEM,
  LIST_OTHER_SETTING,
  LIST_PACKAGE,
  LIST_PRICE_LIST,
  LIST_PROFIT_LOSS,
  LIST_PURCHASE_ORDER,
  LIST_PURCHASE_PAYMENT,
  LIST_PURCHASE_SETTING,
  LIST_QUOTATION,
  LIST_SALES_ORDER,
  LIST_SALES_PAYMENT,
  LIST_SALES_SETTING,
  LIST_STATEMENT,
  LIST_TAX_PAYMENT,
  LIST_TAX_SETTING,
  LIST_TRADING,
  LIST_USER,
  LIST_VENDOR,
  LIST_WAREHOUSE,
  VIEW_ACCOUNT,
  VIEW_TAX_AUTHORITIES,
  VIEW_CUSTOMER,
  VIEW_EXPENSE,
  VIEW_ITEM,
  VIEW_PACKAGE,
  VIEW_PRICE_LIST,
  VIEW_PURCHASE_ORDER,
  VIEW_PURCHASE_PAYMENT,
  VIEW_QUOTATION,
  VIEW_SALES_ORDER,
  VIEW_SALES_PAYMENT,
  VIEW_STATEMENT,
  VIEW_TAX_PAYMENT,
  VIEW_TRADING,
  VIEW_USER,
  VIEW_VENDOR,
  VIEW_WAREHOUSE,
  LIST_ACCOUNT_ENTRY,
  CREATE_ACCOUNT_ENTRY
} from './common-functions/utils/Constants'

const routePermissions = {
  // Sales Routes
  '/sales/sales-order/': LIST_SALES_ORDER,
  '/sales/sales-order/add-salesorder/': CREATE_SALES_ORDER,
  '/sales/sales-order/edit/': EDIT_SALES_ORDER,
  '/sales/sales-order/view/': VIEW_SALES_ORDER,
  '/sales/customer/': LIST_SALES_ORDER,
  '/sales/customer/add-customer/': CREATE_CUSTOMER,
  '/sales/customer/edit/': EDIT_CUSTOMER,
  '/sales/customer/view/': VIEW_CUSTOMER,
  '/sales/quotation/': LIST_QUOTATION,
  '/sales/quotation/add/': CREATE_QUOTATION,
  '/sales/quotation/edit/': EDIT_QUOTATION,
  '/sales/quotation/view/': VIEW_QUOTATION,
  '/sales/packages/': LIST_PACKAGE,
  '/sales/packages/add-package/': CREATE_PACKAGE,
  '/sales/packages/edit/': EDIT_PACKAGE,
  '/sales/packages/view/': VIEW_PACKAGE,
  '/sales/payments/': LIST_SALES_PAYMENT,
  '/sales/payments/new-payment/': CREATE_SALES_PAYMENT,
  '/sales/payments/view/': VIEW_SALES_PAYMENT,

  // Inventory Routes
  '/inventory/products/': LIST_ITEM,
  '/inventory/products/add-product/': CREATE_ITEM,
  '/inventory/products/edit/': EDIT_ITEM,
  '/inventory/products/view/': VIEW_ITEM,
  '/inventory/price-list/': LIST_PRICE_LIST,
  '/inventory/price-list/add-price-list/': CREATE_PRICE_LIST,
  '/inventory/price-list/edit/': EDIT_PRICE_LIST,
  '/inventory/price-list/view/': VIEW_PRICE_LIST,

  // Purchases Routes
  '/purchases/vendors/': LIST_VENDOR,
  '/purchases/vendors/add-vendor/': CREATE_VENDOR,
  '/purchases/vendors/edit/': EDIT_VENDOR,
  '/purchases/vendors/view/': VIEW_VENDOR,
  '/purchases/purchase-order/': LIST_PURCHASE_ORDER,
  '/purchases/purchase-order/add-purchaseorder/': CREATE_PURCHASE_ORDER,
  '/purchases/purchase-order/edit/': EDIT_PURCHASE_ORDER,
  '/purchases/purchase-order/view/': VIEW_PURCHASE_ORDER,
  '/purchases/payments/': LIST_PURCHASE_PAYMENT,
  '/purchases/payments/new-payment/': CREATE_PURCHASE_PAYMENT,
  '/purchases/payments/view/': VIEW_PURCHASE_PAYMENT,

  // Accounting Routes
  '/accounting/accounts/': LIST_ACCOUNT,
  '/accounting/accounts/add-account/': CREATE_ACCOUNT,
  '/accounting/accounts/edit/': EDIT_ACCOUNT,
  '/accounting/accounts/view/': VIEW_ACCOUNT,
  '/accounting/transactions/': LIST_ACCOUNT_ENTRY,
  '/accounting/transactions/new/': CREATE_ACCOUNT_ENTRY,
  '/accounting/transactions/view/': VIEW_ACCOUNT_ENTRY,
  '/accounting/bank-transactions/': LIST_BANK_TRANSACTION,
  '/accounting/expenses/': LIST_EXPENSE,
  '/accounting/expenses/add/': CREATE_EXPENSE,
  '/accounting/expenses/edit/': EDIT_EXPENSE,
  '/accounting/expenses/view/': VIEW_EXPENSE,
  '/accounting/tax-authorities/': LIST_TAX_AUTHORITIES,
  '/accounting/tax-authorities/add/': CREATE_TAX_AUTHORITIES,
  '/accounting/tax-authorities/edit/': EDIT_TAX_AUTHORITIES,
  '/accounting/tax-authorities/view/': VIEW_TAX_AUTHORITIES,
  '/accounting/tax-statements/': LIST_STATEMENT,
  '/accounting/tax-statements/add/': CREATE_STATEMENT,
  '/accounting/tax-statements/view/': VIEW_STATEMENT,
  '/accounting/tax-payments/': LIST_TAX_PAYMENT,
  '/accounting/tax-payments/add/': CREATE_TAX_PAYMENT,
  '/accounting/tax-payments/view/': VIEW_TAX_PAYMENT,

  // Reports Routes
  '/reports/profit-loss-reports/': LIST_PROFIT_LOSS,
  '/reports/balance-sheet/': LIST_BALANCE_SHEET,

  // Account Settings Routes
  '/account-settings/account/': LIST_ACCOUNT_SETTING,
  '/account-settings/account/edit/': EDIT_ACCOUNT_SETTING,
  '/account-settings/company/': LIST_TRADING,
  '/account-settings/company/add-company/': CREATE_TRADING,
  '/account-settings/company/edit/': EDIT_TRADING,
  '/account-settings/company/view/': VIEW_TRADING,
  '/account-settings/user/': LIST_USER,
  '/account-settings/user/add-user/': CREATE_USER,
  '/account-settings/user/edit/': EDIT_USER,
  '/account-settings/user/view/': VIEW_USER,
  '/account-settings/warehouses/': LIST_WAREHOUSE,
  '/account-settings/warehouses/add-warehouse/': CREATE_WAREHOUSE,
  '/account-settings/warehouses/edit/': EDIT_WAREHOUSE,
  '/account-settings/warehouses/view/': VIEW_WAREHOUSE,
  '/account-settings/tradings/': LIST_TRADING,
  '/account-settings/tradings/add-trading/': CREATE_TRADING,
  '/account-settings/tradings/edit/': EDIT_TRADING,
  '/account-settings/tradings/view/': VIEW_TRADING,
  '/account-settings/purchase-module/': LIST_PURCHASE_SETTING,
  '/account-settings/purchase-module/add/': EDIT_PURCHASE_SETTING,
  '/account-settings/purchase-module/edit/': EDIT_PURCHASE_SETTING,
  '/account-settings/purchase-module/view/': LIST_PURCHASE_SETTING,
  '/account-settings/sales-module/': LIST_SALES_SETTING,
  '/account-settings/sales-module/edit-salesmodule/': EDIT_SALES_SETTING,
  '/account-settings/tax-settings/': LIST_TAX_SETTING,
  '/account-settings/tax-settings/add/': EDIT_TAX_SETTING,
  '/account-settings/tax-settings/view/': LIST_TAX_SETTING,
  '/account-settings/other-settings.js/': LIST_OTHER_SETTING
}

export function middleware(req) {
  const { cookies } = req

  // Retrieve specific cookies and parse permissions
  const isAdmin = cookies.get('isAdmin')?.value === 'true'
  const isRootUser = cookies.get('isRootUser')?.value === 'true'
  const permissions = cookies.get('permissions')?.value
  console.log('permissions', permissions)

  const tanantSpecificPermissions =
    typeof permissions === 'string' && permissions.length > 0 ? JSON.parse(permissions) : []

  // If the user is either root or admin, allow access immediately
  if (isRootUser || isAdmin) {
    return NextResponse.next()
  }

  const { pathname } = req.nextUrl
  console.log('pathname', pathname)

  // Find the route's required permission using startsWith for dynamic route matching
  const requiredPermission = Object.entries(routePermissions).find(([route]) => pathname.startsWith(route))?.[1]
  console.log('hasPermission', !hasPermission(tanantSpecificPermissions, requiredPermission))
  console.log('requiredPermission', requiredPermission)
  // If no required permission is found or user lacks permission, redirect
  if (requiredPermission !== undefined && !hasPermission(tanantSpecificPermissions, requiredPermission)) {
    console.log('Redirecting to unauthorized')
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return NextResponse.next()
}

function hasPermission(tanantSpecificPermissions, requiredPermission) {
  return tanantSpecificPermissions?.some(permission => permission.action === requiredPermission)
}
