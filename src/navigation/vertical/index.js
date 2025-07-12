import {
  LIST_ACCOUNT,
  LIST_ACCOUNT_ENTRY,
  LIST_ACCOUNT_SETTING,
  LIST_BALANCE_SHEET,
  LIST_BANK_TRANSACTION,
  LIST_CUSTOMER,
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
  LIST_SALES_INVOICE,
  LIST_SALES_ORDER,
  LIST_SALES_PAYMENT,
  LIST_SALES_SETTING,
  LIST_STATEMENT,
  LIST_STOCK,
  LIST_TAX_AUTHORITIES,
  LIST_TAX_PAYMENT,
  LIST_TAX_SETTING,
  LIST_TENANT,
  LIST_TRADING,
  LIST_VENDOR,
  LIST_WAREHOUSE
} from 'src/common-functions/utils/Constants'
import { filterVisibleItems, hasPermission } from 'src/common-functions/utils/UtilityFunctions'

const navigation = userProfile => {
  const { isRootUser } = userProfile

  const allRoutes = [
    {
      title: 'Dashboard',
      icon: 'lucide:layout-dashboard',

      children: [
        {
          title: 'General',
          path: '/dashboard'
        },
        {
          title: 'Customer',
          path: '/dashboard/customer'
        }
      ]
    },
    {
      title: 'Purchases',
      icon: 'tabler:shopping-bag',
      children: [
        {
          title: 'Vendors',
          path: '/purchases/vendors',
          visible: hasPermission(userProfile, LIST_VENDOR)
        },

        {
          title: 'Purchase Orders',
          path: '/purchases/purchase-order',
          visible: hasPermission(userProfile, LIST_PURCHASE_ORDER)
        },
        {
          title: 'Packages',
          path: '/purchases/packages',
          visible: true
        },
        {
          title: 'Shipments',
          path: '/purchases/shipments',
          visible: true
        },
        {
          title: 'Payments',
          path: '/purchases/payments',
          visible: hasPermission(userProfile, LIST_PURCHASE_PAYMENT)
        }
      ]
    },

    {
      title: 'Inventory',
      icon: 'cil:basket',
      children: [
        {
          title: 'Products',
          path: '/inventory/products',
          visible: hasPermission(userProfile, LIST_ITEM)
        },
        {
          title: 'Stock Adjustments',
          path: '/inventory/stock-adjustments',
          visible: hasPermission(userProfile, LIST_STOCK)
        },
        {
          title: 'Price List',
          path: '/inventory/price-list',
          visible: hasPermission(userProfile, LIST_PRICE_LIST)
        }
      ]
    },

    {
      title: 'Sales',
      icon: 'ion:cart-outline',
      children: [
        {
          title: 'Unifined Sales',
          path: '/sales/unified-salesdata',
          visible: process.env.NEXT_PUBLIC_APP_ENV === 'dev' ? true : false
        },
        {
          title: 'Customers',
          path: '/sales/customer',
          visible: hasPermission(userProfile, LIST_CUSTOMER)
        },
        {
          title: 'Quotations',
          path: '/sales/quotation',
          visible: hasPermission(userProfile, LIST_QUOTATION)
        },
        {
          title: 'Sales Orders',
          path: '/sales/sales-order',
          visible: hasPermission(userProfile, LIST_SALES_ORDER)
        },
        {
          title: 'Invoices',
          path: '/sales/invoice',
          visible:
            (process.env.NEXT_PUBLIC_APP_ENV === 'dev' || process.env.NEXT_PUBLIC_APP_ENV === 'test') &&
            hasPermission(userProfile, LIST_SALES_INVOICE)
        },
        {
          title: 'Packages',
          path: '/sales/packages',
          visible: hasPermission(userProfile, LIST_PACKAGE)
        },
        {
          title: 'Payments',
          path: '/sales/payments',
          visible: hasPermission(userProfile, LIST_SALES_PAYMENT)
        }
      ]
    },

    {
      title: 'Accounting',
      icon: 'ph:bank',
      children: [
        {
          title: 'Accounts',
          path: '/accounting/accounts',
          visible: hasPermission(userProfile, LIST_ACCOUNT)
        },

        {
          title: 'Transactions',
          path: '/accounting/transactions',
          visible: hasPermission(userProfile, LIST_ACCOUNT_ENTRY)
        },
        {
          title: 'Bank Transactions',
          path: '/accounting/bank-transactions',
          visible: hasPermission(userProfile, LIST_BANK_TRANSACTION)
        },
        {
          title: 'Expenses',
          path: '/accounting/expenses',
          visible: hasPermission(userProfile, LIST_EXPENSE)
        },

        {
          title: 'Tax',
          icon: 'tabler:receipt-tax',
          children: [
            {
              title: 'Authorities',
              path: '/accounting/tax-authorities',
              visible: hasPermission(userProfile, LIST_TAX_AUTHORITIES)
            },
            {
              title: 'Statements',
              path: '/accounting/tax-statements',
              visible: hasPermission(userProfile, LIST_STATEMENT)
            },
            {
              title: 'Payments',
              path: '/accounting/tax-payments',
              visible: hasPermission(userProfile, LIST_TAX_PAYMENT)
            }
          ]
        }
      ]
    },
    {
      title: 'Reports',
      icon: 'tabler:file-text',
      children: [
        {
          title: 'Sales',
          path: '/reports/sales-report'
        },
        {
          title: 'Profit & Loss',
          path: '/reports/profit-loss-reports',
          visible: hasPermission(userProfile, LIST_PROFIT_LOSS)
        },
        {
          title: 'Balance Sheet',
          path: '/reports/balance-sheet',
          visible: hasPermission(userProfile, LIST_BALANCE_SHEET)
        }
      ]
    },
    {
      title: 'Account Settings',
      icon: 'tabler:settings',
      children: [
        {
          title: 'Account',
          path: '/account-settings/account',
          visible: hasPermission(userProfile, LIST_ACCOUNT_SETTING)
        },
        {
          title: 'Users',
          path: '/account-settings/user',
          visible: isRootUser
        },
        {
          title: 'Companies',
          path: '/account-settings/company',
          visible: hasPermission(userProfile, LIST_TENANT)
        },
        {
          title: 'Tradings',
          path: '/account-settings/tradings',
          visible: hasPermission(userProfile, LIST_TRADING)
        },
        {
          title: 'Warehouses',
          path: '/account-settings/warehouses',
          visible: hasPermission(userProfile, LIST_WAREHOUSE)
        },
        {
          title: 'Sales Module',
          path: '/account-settings/sales-module',
          visible: hasPermission(userProfile, LIST_SALES_SETTING)
        },
        {
          title: 'Purchase Module',
          path: '/account-settings/purchase-module',
          visible: hasPermission(userProfile, LIST_PURCHASE_SETTING)
        },
        {
          title: 'Tax Account Settings',
          path: '/account-settings/tax-settings',
          visible: hasPermission(userProfile, LIST_TAX_SETTING)
        },
        {
          title: 'Other Settings',
          path: '/account-settings/other-settings',
          visible: hasPermission(userProfile, LIST_OTHER_SETTING)
        }
      ]
    }
  ]

  return filterVisibleItems(allRoutes) // Return the filtered navigation
}

export default navigation
