const navigation = () => {
  return [
    {
      title: 'Dashboard',
      icon: 'lucide:layout-dashboard',
      path: '/dashboard',
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
          path: '/purchases/vendors'
        },
        {
          title: 'Purchase Orders',
          path: '/purchases/purchase-order'
        },
        {
          title: 'Packages',
          path: '/purchases/packages'
        },
        {
          title: 'Shipments',
          path: '/purchases/shipments'
        },
        {
          title: 'Payments',
          path: '/purchases/payments'
        }
      ]
    },
    {
      title: 'Inventory',
      icon: 'cil:basket',
      children: [
        {
          title: 'Products',
          path: '/inventory/products'
        },
        {
          title: 'Stock Adjustments',
          path: '/inventory/stock-adjustments'
        },
        {
          title: 'Price List',
          path: '/inventory/price-list'
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
          path: '/sales/customer'
        },
        {
          title: 'Quotations',
          path: '/sales/quotation'
        },
        {
          title: 'Sales Orders',
          path: '/sales/sales-order'
        },
        {
          title: 'Invoices',
          path: '/sales/invoice'
        },
        {
          title: 'Packages',
          path: '/sales/packages'
        },
        {
          title: 'Payments',
          path: '/sales/payments'
        }
      ]
    },

    {
      title: 'Accounting',
      icon: 'ph:bank',
      children: [
        {
          title: 'Accounts',
          path: '/accounting/accounts'
        },
        {
          title: 'Transactions',
          path: '/accounting/transactions'
        },
        {
          title: 'Bank Transactions',
          path: '/accounting/bank-transactions'
        },
        {
          title: 'Expenses',
          path: '/accounting/expenses'
        },

        {
          title: 'Tax',
          icon: 'tabler:receipt-tax',
          children: [
            {
              title: 'Tax Authorities',
              path: '/accounting/tax-authorities'
            },
            {
              title: 'Tax Statements',
              path: '/accounting/tax-statements'
            },
            {
              title: 'Payments',
              path: '/accounting/tax-payments'
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
          title: 'Profi & Loss',
          path: '/reports/profit-losss-reports'
        },
        {
          title: 'Balance Sheet',
          path: '/reports/balance-sheet'
        }
      ]
    },
    {
      title: 'Account Settings',
      icon: 'tabler:settings',
      children: [
        {
          title: 'Account',
          path: '/account-settings/account'
        },
        {
          title: 'Users',
          path: '/account-settings/user'
        },
        {
          title: 'Companies',
          path: '/account-settings/company'
        },
        {
          title: 'Tradings',
          path: '/account-settings/tradings'
        },
        {
          title: 'Warehouses',
          path: '/account-settings/warehouses'
        },
        {
          title: 'Sales Module',
          path: '/account-settings/sales-module'
        },
        {
          title: 'Purchase Module',
          path: '/account-settings/purchase-module'
        },
        {
          title: 'Other Settings',
          path: '/account-settings/other-settings'
        }
      ]
    }
  ]
}

export default navigation
